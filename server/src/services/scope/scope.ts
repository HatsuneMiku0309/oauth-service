import { install } from 'source-map-support';
install();

import * as Q from 'q';
import { v4 as uuid } from 'uuid';
import { Connection, FieldPacket } from 'mysql2/promise';
import { TAnyObj, IMysqlDatabase } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import { ICreateBody, IListQuery, IRegistBody, IScope, IApiScopeDao, IUpdateBody, IUpdatesBody } from './scope.interface';
import { IBasicPassportRes } from '../jwt/passport.interface';
import { Oauth } from '../oauth/oauth';
import * as _ from 'lodash';

class Scope implements IScope {
    static instance: IScope;
    private readonly _METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
    options: TAnyObj;
    private constructor(options: TAnyObj = { }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj = { }): IScope {
        if (!Scope.instance) {
            Scope.instance = new Scope(options);
        }

        return Scope.instance;
    }

    async list(database: IMysqlDatabase, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IApiScopeDao[]> {
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

    private _checkListQuery(query: IListQuery) {
        const { name, system } = query;
        try {
            if (!!name && !_.isString(name)) {
                throw new Error('name type error');
            }
            if (!!system && !_.isString(system)) {
                throw new Error('system type error');
            }
        } catch (err) {
            throw err;
        }
    }

    async dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IApiScopeDao[]> {
        const { user: { user_id } } = options;
        const { name, system } = query;
        try {
            this._checkListQuery(query);
            let sql = `
                SELECT * FROM api_scope WHERE
            `;

            let whereSql = ['CREATE_BY = ?'];
            let params = [user_id];
            !!name && whereSql.push('NAME LIKE ?') && params.push(name);
            !!system && whereSql.push('SYSTEM LIKE ?') && params.push(system);
            sql += ` ${whereSql.join(' AND ')}`;

            let [rows] = <[IApiScopeDao[], FieldPacket[]]> await db.query(sql, params);

            return rows;
        } catch (err) {
            throw err;
        }
    }

    async create(database: IMysqlDatabase, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<{ ID: string }> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbCreate(db, body, options);

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

    private _checkCreateBody(body: ICreateBody): void {
        try {
            const { description, is_required, system, apis } = body;

            if (!system) {
                throw new Error('system is required');
            }
            if (!apis) {
                throw new Error('apis is required');
            }
            if (!!description && !_.isString(description)) {
                throw new Error('description type error');
            }
            if (is_required !== undefined) {
                if (!_.isBoolean(is_required)) {
                    throw new Error('is_required type error');
                }
            }
            if (!_.isArray(apis)) {
                throw new Error('apis type error');
            }
        } catch (err) {
            throw err;
        }
    }

    async dbCreate(db: Connection, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<{ ID: string }> {
        const { user: { user_id } } = options;
        const { name, description = '', is_required, system, apis } = body;
        try {
            this._checkCreateBody(body);
            let id = uuid();
            let sql = 'INSERT INTO api_scope SET ?';
            let params = <IApiScopeDao[]> [{
                ID: id,
                NAME: name,
                DESCRIPTION: description,
                SYSTEM: system,
                APIS: apis,
                IS_REQUIRED: is_required || false,
                CREATE_BY: user_id
            }];

            await db.query(sql, params);

            return {
                ID: id
            };
        } catch (err) {
            throw err;
        }
    }

    async creates(database: IMysqlDatabase, body: ICreateBody[], options: TAnyObj & IJWTCotext): Promise<{ ID: string }[]> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbCreates(db, body, options);

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

    private _checkCreatesBody(body: ICreateBody[]): void {
        try {
            body.forEach((data) => {
                const { description, is_required, system, apis } = data;
                if (!system) {
                    throw new Error('system is required');
                }
                if (!apis) {
                    throw new Error('apis is required');
                }
                if (!!description && !_.isString(description)) {
                    throw new Error('description type error');
                }
                if (is_required !== undefined) {
                    if (!_.isBoolean(is_required)) {
                        throw new Error('is_required type error');
                    }
                }
                if (!_.isArray(apis)) {
                    throw new Error('apis type error');
                }
            });
        } catch (err) {
            throw err;
        }
    }

    async dbCreates(db: Connection, body: ICreateBody[], options: TAnyObj & IJWTCotext): Promise<{ ID: string }[]> {
        const { user: { user_id } } = options;
        const COLUMNS = ['ID', '`SYSTEM`', 'NAME', 'DESCRIPTION', 'APIS', 'IS_REQUIRED', 'CREATE_BY'];
        try {
            this._checkCreatesBody(body);
            let sql = `INSERT INTO api_scope (${COLUMNS.join(', ')})`;
            let ids: { ID: string }[] = [];
            let params = body.map((data) => {
                const { name, description = '', is_required, system, apis } = data;
                let id = uuid();
                ids.push({ ID: id });

                return [
                    id, name, description,
                    system, apis,
                    is_required || false,
                    user_id
                ];
            });
            sql += `
                VALUES (${params.map(() => '?').join('), (')})
            `;

            await db.query(sql, params);

            return ids;
        } catch (err) {
            throw err;
        }
    }

    async update(database: IMysqlDatabase, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<{ ID: string }> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbUpdate(db, id, body, options);

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

    private _checkUpdateBody(body: IUpdateBody): void {
        try {
            const { description, is_required, system, apis } = body;

            if (!system) {
                throw new Error('system is required');
            }
            if (!apis) {
                throw new Error('apis is required');
            }
            if (!!description && !_.isString(description)) {
                throw new Error('description type error');
            }
            if (is_required !== undefined) {
                if (!_.isBoolean(is_required)) {
                    throw new Error('is_required type error');
                }
            }
            if (!_.isArray(apis)) {
                throw new Error('apis type error');
            }
        } catch (err) {
            throw err;
        }
    }

    async dbUpdate(db: Connection, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<{ ID: string }> {
        const { user: { user_id } } = options;
        const { description = '', is_required, system, apis } = body;
        try {
            this._checkUpdateBody(body);
            let [rows] = <[IApiScopeDao[], FieldPacket[]]> await db.query('SELECT * FROM api_scope WHERE ID = ?', [id]);
            if (rows.length === 0) {
                throw new Error(`[${id}] not find`);
            }

            await db.query(`
                UPDATE api_scope SET ? WHERE ID = ?
            `, [{
                DESCRIPTION: description,
                SYSTEM: system,
                APIS: apis,
                IS_REQUIRED: is_required || false,
                UPDATE_BY: user_id
            },  id]);

            return {
                ID: id
            };
        } catch (err) {
            throw err;
        }
    }

    async updates(database: IMysqlDatabase, body: IUpdatesBody[], options: TAnyObj & IJWTCotext): Promise<{ ID: string }[]> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbUpdates(db, body, options);

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

    private _checkUpdatesBody(body: IUpdatesBody[]): void {
        try {
            body.forEach((data) => {
                const { id, description, is_required, system, apis } = data;
                if (!id) {
                    throw new Error('id is required');
                }
                if (!system) {
                    throw new Error('system is required');
                }
                if (!apis) {
                    throw new Error('apis is required');
                }
                if (!!description && !_.isString(description)) {
                    throw new Error('description type error');
                }
                if (is_required !== undefined) {
                    if (!_.isBoolean(is_required)) {
                        throw new Error('is_required type error');
                    }
                }
                if (!_.isArray(apis)) {
                    throw new Error('apis type error');
                }
            });
        } catch (err) {
            throw err;
        }
    }

    async dbUpdates(db: Connection, body: IUpdatesBody[], options: TAnyObj & IJWTCotext): Promise<{ ID: string }[]> {
        const { user: { user_id } } = options;
        try {
            this._checkUpdatesBody(body);
            let sql = 'UPDATE api_scope SET ? WHERE ID = ?';
            let ids: { ID: string }[] = await Q.all(body.map(async (data) => {
                const { id, description = '', is_required, system, apis } = data;
                let [rows] = <[IApiScopeDao[], FieldPacket[]]> await db.query('SELECT * FROM api_scope WHERE ID = ?', [id]);
                if (rows.length === 0) {
                    throw new Error(`[${id}] not find`);
                }

                let params = [];
                params.push(<IApiScopeDao> {
                    DESCRIPTION: description,
                    SYSTEM: system,
                    APIS: apis,
                    IS_REQUIRED: is_required || false,
                    UPDATE_BY: user_id
                });
                params.push(id);
                await db.query(sql, params);

                return {
                    ID: id
                };
            }));

            return ids;
        } catch (err) {
            throw err;
        }
    }

    async remove(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<{ ID: string }> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbRemove(db, id, options);

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

    async dbRemove(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<{ ID: string }> {
        try {
            let [rows] = <[IApiScopeDao[], FieldPacket[]]> await db.query('SELECT * FROM api_scope WHERE ID = ?', [id]);
            if (rows.length === 0) {
                throw new Error(`[${id}] not find`);
            }

            await db.query('DELETE FROM api_scope WHERE ID = ?', [id]);

            return {
                ID: id
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
                const { name, description, is_required, apis } = data;
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
        const { user: { client_id } } = options;
        const COLUMNS = ['ID', '`SYSTEM`', 'NAME', 'DESCRIPTION', 'APIS', 'IS_REQUIRED', 'CREATE_BY'];
        try {
            this._checkRegistBody(body);
            let oauth = Oauth.getInstance(this.options);
            let oauthApplicaion = await oauth.checkOauthApplication(db, client_id, options);
            let sql = `INSERT INTO api_scope (${COLUMNS.join(', ')})`;
            let params = body.map((data) => {
                const { name, description = '', is_required, apis } = data;
                let id = uuid();

                return [
                    id, system, name, description,
                    JSON.stringify(apis),
                    is_required || false,
                    oauthApplicaion.USER_ID
                ];
            });

            sql += `
                VALUES (${params.map(() => '?').join('), (')})
                ON DUPLICATE KEY UPDATE
                NAME = VALUES(NAME), DESCRIPTION = VALUES(DESCRIPTION),
                APIS = VALUES(APIS), UPDATE_BY = VALUES(CREATE_BY)
            `;

            await db.query(sql, params);
            let [rows] = <[IApiScopeDao[], FieldPacket[]]> await db.query('SELECT * FROM api_scope WHERE `SYSTEM` = ?', [system]);

            return rows;
        } catch (err) {
            throw err;
        }
    }
}

export {
    Scope
};
