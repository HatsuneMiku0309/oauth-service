import { install } from 'source-map-support';
install();

import { v4 as uuid } from 'uuid';
import { Connection, FieldPacket } from 'mysql2/promise';
import { TAnyObj, IMysqlDatabase, IConfig } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import { IListQuery, IRegistBody, IScope, IApiScopeDao, IListRes } from './scope.interface';
import * as _ from 'lodash';
import { IUserDAO } from '../login/login.interface';
import { IBasicPassportRes } from '../jwt/passport.interface';

class Scope implements IScope {
    static instance: IScope;
    private readonly _METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
    options: TAnyObj & { config: IConfig };
    private constructor(options: TAnyObj & { config: IConfig }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj & { config: IConfig }): IScope {
        if (!Scope.instance) {
            Scope.instance = new Scope(options);
        }

        return Scope.instance;
    }

    async list(database: IMysqlDatabase, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbList(db, query, options);

                return result;
            } catch (err) {
                throw err;
            } finally {
                await database.end(db);
            }
        } catch (err) {
            throw err;
        }
    }

    async dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes> {
        const { user: { user_id } } = options;
        const { q, count = 10, offset = 0 } = query;
        try {
            let [oauthApps] = <[{ CLIENT_ID: string }[], FieldPacket[]]> await db.query('SELECT CLIENT_ID FROM OAUTH_APPLICATION WHERE USER_ID = ?', [ user_id ]);
            let clientIds = oauthApps.map((oauthApp) => oauthApp.CLIENT_ID);
            let sql = 'SELECT * FROM API_SCOPE';

            let whereSql = ['IS_PUBLIC = ? AND CREATE_BY IN (?)', 'IS_PUBLIC = ?'];
            let params = ['PRIVATE', clientIds, 'PUBLIC'];
            let pageParams: any[] = [Number(count), Number(offset * count)];
            !!q && whereSql.push('NAME LIKE ?') && whereSql.push('`SYSTEM` LIKE ?') && params.push(`%${q}%`) && params.push(`%${q}%`);
            sql += ` WHERE (${whereSql.join(') OR (')})`;
            sql += ' ORDER BY `SYSTEM`, CREATE_TIME';
            sql += ' LIMIT ? OFFSET ?';
            let [rows] = <[IApiScopeDao[], FieldPacket[]]> await db.query(sql, [...params, ...pageParams]);

            let totalSql = 'SELECT COUNT(1) TOTAL_PAGE FROM API_SCOPE';
            totalSql += ` WHERE (${whereSql.join(') OR (')})`;

            let [totalCounts] = <[{ TOTAL_PAGE: number }[], FieldPacket[]]> await db.query(totalSql, params);
            let totalCount = totalCounts[0].TOTAL_PAGE;
            let totalPage = Math.ceil(totalCount / count);

            return {
                datas: rows,
                count,
                offset,
                totalPage
            };
        } catch (err) {
            throw err;
        }
    }

    async regist(database: IMysqlDatabase, system: string, body: IRegistBody[], options: TAnyObj & { user: IBasicPassportRes }): Promise<IApiScopeDao[]> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbRegist(db, system, body, options);

                await db.commit();

                return result;
            } catch (err) {
                await db.rollback();
                throw err;
            } finally {
                await database.end(db);
            }
        } catch (err) {
            throw err;
        }
    }

    private _checkRegistBody(body: IRegistBody[]) {
        try {
            let dupTemp: string[] = [];
            if (!body) {
                throw new Error('body is required');
            }
            if (!!body && !_.isArray(body)) {
                throw new Error('body type error');
            }
            if (!!body && body.length === 0) {
                throw new Error('body is required');
            }

            body.forEach((data) => {
                const { name, description, is_required, require_check, apis } = data;
                if (!name) {
                    throw new Error('name is required');
                } else if (!apis) {
                    throw new Error('apis is required');
                }

                if (!!name && !_.isString(name)) {
                    throw new Error('name type error');
                }
                if (!!description && !_.isString(description)) {
                    throw new Error('description type error');
                }
                if (require_check !== undefined) {
                    if (!_.isBoolean(require_check)) {
                        throw new Error('require_check type error');
                    }
                }
                if (is_required !== undefined) {
                    if (!_.isBoolean(is_required)) {
                        throw new Error('is_required type error');
                    }
                }
                if (!!apis && !_.isArray(apis)) {
                    throw new Error('apis type error');
                }
                if (!!apis && apis.length === 0) {
                    throw new Error('apis is required');
                }

                apis.forEach((api) => {
                    const whiteList = ['api', 'method', 'params'];
                    let keys = Object.keys(api);
                    let otherKeys = _.without(keys, ...whiteList);
                    if (otherKeys.length !== 0) {
                        throw new Error('invalid parameter in apis');
                    }
                    const { api: _api, method } = api;
                    if (!_api) {
                        throw new Error(`[${name}] api is required`);
                    }
                    if (!!_api && !_.isString(_api)) {
                        throw new Error('api type error');
                    }
                    if (!this._METHODS.includes(method)) {
                        throw new Error(`[${method}] Error method`);
                    }
                });

                if (dupTemp.includes(name)) {
                    throw new Error(`[${name}] name is duplicate register`);
                }
                dupTemp.push(name);
            });
        } catch (err) {
            throw err;
        }
    }

    async dbRegist(db: Connection, system: string, body: IRegistBody[], options: TAnyObj & { user: IBasicPassportRes }): Promise<IApiScopeDao[]> {
        const { user: { user_id, client_id } } = options;
        const COLUMNS = ['ID', '`SYSTEM`', 'NAME', 'DESCRIPTION', 'APIS', 'IS_REQUIRED', 'REQUIRE_CHECK', 'CREATE_BY'];
        try {
            this._checkRegistBody(body);
            let [users] = <[IUserDAO[], FieldPacket[]]> await db.query('SELECT * FROM USER WHERE ID = ? AND SOURCE = ?', [user_id, 'SELF']);
            if (users.length === 0) {
                throw new Error('Not found user');
            }
            let user = users[0];
            if (user.USER_TYPE !== 'ADMIN') {
                throw new Error('Not admin account');
            }

            let sql = `INSERT INTO API_SCOPE (${COLUMNS.join(', ')})`;
            let params = body.map((data) => {
                const { name, description = '', require_check = false, is_required = false, apis } = data;
                let id = uuid();

                return [
                    id, system, name, description,
                    JSON.stringify(apis),
                    is_required,
                    require_check,
                    client_id
                ];
            });

            sql += `
                VALUES (${params.map(() => '?').join('), (')})
                ON DUPLICATE KEY UPDATE
                NAME = VALUES(NAME), DESCRIPTION = VALUES(DESCRIPTION),
                APIS = VALUES(APIS), IS_REQUIRED = VALUES(IS_REQUIRED), REQUIRE_CHECK = VALUES(REQUIRE_CHECK),
                UPDATE_BY = VALUES(CREATE_BY)
            `;

            await db.query(sql, params);
            let [rows] = <[IApiScopeDao[], FieldPacket[]]> await db.query('SELECT * FROM API_SCOPE WHERE `SYSTEM` = ?', [system]);

            return rows;
        } catch (err) {
            throw err;
        }
    }
}

export {
    Scope
};
