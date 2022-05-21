import { install } from 'source-map-support';
install();

import { Connection } from 'mysql2/promise';
import { FieldPacket } from 'mysql2';
import { TAnyObj, IMysqlDatabase, IError } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import { IOauthApplicationScope, IOauthApplicationScopeAndApiScopeRes, IOauthApplicationScopeDao, IRegistBody } from './oauth-app-scope.interface';
import { IOauthApplicationDao } from './oauth-app.interface';
import { v4 as uuid } from 'uuid';
import { IApiScopeDao } from '../scope/scope.interface';
import * as _ from 'lodash';

class OauthApplicationScope implements IOauthApplicationScope {
    static instance: IOauthApplicationScope;
    options: TAnyObj;
    private constructor(options: TAnyObj = { }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj = { }): IOauthApplicationScope {
        if (!OauthApplicationScope.instance) {
            OauthApplicationScope.instance = new OauthApplicationScope(options);
        }

        return OauthApplicationScope.instance;
    }

    async list(database: IMysqlDatabase, oa_id: string, options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeAndApiScopeRes[]> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbList(db, oa_id, options);

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

    async dbList(db: Connection, oa_id: string, options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeAndApiScopeRes[]> {
        try {
            let sql = `
                SELECT
                    os.ID ,
                    os.OAUTH_APPLICATION_ID ,
                    os.SCOPE_ID ,
                    as2.NAME ,
                    as2.\`SYSTEM\` ,
                    as2.DESCRIPTION,
                    as2.APIS,
                    as2.IS_REQUIRED ,
                    as2.REQUIRE_CHECK ,
                    os.IS_DISABLED ,
                    os.IS_CHECKED ,
                    os.CREATE_TIME ,
                    os.CREATE_BY ,
                    os.UPDATE_TIME ,
                    os.UPDATE_BY
                FROM
                    OAUTH_SCOPE os,
                    API_SCOPE as2
                WHERE
                    OAUTH_APPLICATION_ID = ?
                    AND os.SCOPE_ID = as2.ID
            `;
            let params = [oa_id];
            let [rows] = <[IOauthApplicationScopeAndApiScopeRes[], FieldPacket[]]> await db.query(sql, params);

            return rows;
        } catch (err) {
            throw err;
        }
    }

    async registScope(database: IMysqlDatabase, oa_id: string, body: IRegistBody[], options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeAndApiScopeRes[]> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbRegistScope(db, oa_id, body, options);
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


    private async _registApiScope(
        db: Connection,  sql: string, body: IRegistBody[], oa_id: string,
        oauthApplicaion: IOauthApplicationDao
    ): Promise<void> {
        try {
            await db.query('DELETE FROM OAUTH_SCOPE WHERE OAUTH_APPLICATION_ID = ?', [oa_id]);
            let params = body.map((data) => {
                const { scope_id, is_disabled = false, is_checked = true } = data;
                let uid = uuid();

                return [uid, oa_id, scope_id, is_disabled, is_checked, oauthApplicaion.CLIENT_ID];
            });
            sql += `
                VALUES (${params.map(() => '?').join('), (')})
            `;

            await db.query(sql, params);
        } catch (err) {
            throw err;
        }
    }

    private async _checkOauthApplication(db: Connection, oa_id: string): Promise<IOauthApplicationDao> {
        try {
            let [oauthApplications] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM OAUTH_APPLICATION WHERE ID = ?
            `, [oa_id]);
            if (oauthApplications.length === 0) {
                throw new Error(`[${oa_id}] not find`);
            }
            let oauthApplicaion = oauthApplications[0];

            return oauthApplicaion;
        } catch (err) {
            throw err;
        }
    }

    private async _getRequiredApiScope(db: Connection, body: IRegistBody[], oauthApplicaion: IOauthApplicationDao, options: TAnyObj = { }) {
        try {
            let [oldAuthApplicationScopes] = <[IOauthApplicationScopeDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM OAUTH_SCOPE WHERE OAUTH_APPLICATION_ID = ?
            `, [oauthApplicaion.ID]);
            let scope_ids = body.map((data) => data.scope_id);
            let [apiScopes] = <[IApiScopeDao[], FieldPacket[]]> await db.query(`
            SELECT
                *
            FROM
                API_SCOPE
            WHERE
                ID IN (?)
            `, [scope_ids]);
            if (apiScopes.length !== scope_ids.length) {
                let err: IError = new Error();
                err.datas = [];
                err.message = `apiScope count error [${apiScopes.length}(db)/${scope_ids.length}(select)]`;
                let apiScopesId = apiScopes.map((apiScope) => apiScope.ID);
                scope_ids.forEach((scope_id) => {
                    !apiScopesId.includes(scope_id) && err.datas?.push(scope_id);
                });

                throw err;
            }
            apiScopes.forEach((apiScope) => {
                let index = scope_ids.indexOf(apiScope.ID);
                let findOldAuthScope = oldAuthApplicationScopes.find((oldAuthApplicationScope) => {
                    return oldAuthApplicationScope.SCOPE_ID === apiScope.ID;
                });
                body[index].is_checked = oauthApplicaion.IS_ORIGIN
                    ? true
                    : findOldAuthScope
                    ? findOldAuthScope.IS_CHECKED
                    : apiScope.REQUIRE_CHECK ? false : true;
                body[index].is_disabled = false;
            });
            let systems = _.union(apiScopes.map((apiScope) => {
                return apiScope.SYSTEM;
            }));
            let [rows] = <[IApiScopeDao[], FieldPacket[]]> await db.query(`
                SELECT
                    ID
                FROM
                    API_SCOPE as2
                WHERE
                    \`SYSTEM\` IN (?)
                    AND IS_REQUIRED = TRUE
                    AND ID NOT IN (?)
            `, [systems, scope_ids]);

            rows.forEach((row) => {
                let findOldAuthScope = oldAuthApplicationScopes.find((oldAuthApplicationScope) => {
                    return oldAuthApplicationScope.SCOPE_ID === row.ID;
                });
                body.push({
                    scope_id: row.ID,
                    is_disabled: false,
                    is_checked: oauthApplicaion.IS_ORIGIN
                        ? true
                        : findOldAuthScope
                        ? findOldAuthScope.IS_CHECKED
                        : row.REQUIRE_CHECK ? false : true
                });
            });

            return body;
        } catch (err) {
            throw err;
        }
    }

    async dbRegistScope(db: Connection, oa_id: string, body: IRegistBody[], options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeAndApiScopeRes[]> {
        const COLUMNS = ['ID', 'OAUTH_APPLICATION_ID', 'SCOPE_ID', 'IS_DISABLED', 'IS_CHECKED', 'CREATE_BY'];
        try {
            if (body.length === 0) {
                return [];
            }

            let oauthApplicaion = await this._checkOauthApplication(db, oa_id);
            let _body = await this._getRequiredApiScope(db, body, oauthApplicaion);

            let sql = `INSERT INTO OAUTH_SCOPE (${COLUMNS.join(', ')})`;
            await this._registApiScope(db, sql, _body, oa_id, oauthApplicaion);

            let rows = await this.dbList(db, oa_id, options);

            return rows;
        } catch (err) {
            throw err;
        }
    }
}

export {
    OauthApplicationScope
};
