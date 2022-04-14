import { install } from 'source-map-support';
install();

import { Connection } from 'mysql2/promise';
import { FieldPacket } from 'mysql2';
import { TAnyObj, IMysqlDatabase } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import { IOauthApplicationScope, IOauthApplicationScopeDao, IRegistBody } from './oauth-app-scope.interface';
import { IOauthApplicationDao } from './oauth-app.interface';
import { v4 as uuid } from 'uuid';
import { IApiScopeDao } from '../scope/scope.interface';
import * as _ from 'lodash';

class OauthApplicationScope implements IOauthApplicationScope {
    options: TAnyObj;
    constructor(options: TAnyObj = { }) {
        this.options = options;
    }

    async registScope(database: IMysqlDatabase, id: string, body: IRegistBody[], options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeDao[]> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbRegistScope(db, id, body, options);
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

    private async _getRegistApiScopeSystem(db: Connection, id: string): Promise<{ SYSTEM: string, IS_REQUIRED: number }[]> {
        try {
            let [scopeSystems] = <[{ SYSTEM: string, IS_REQUIRED: number }[], FieldPacket[]]> await db.query(`
            SELECT
                DISTINCT as2.SYSTEM,
                as2.IS_REQUIRED
            FROM
                oauth_scope os,
                api_scope as2
            WHERE
                os.OAUTH_APPLICATION_ID = ?
                AND os.SCOPE_ID = as2.ID
        `, [id]);

            return scopeSystems;
        } catch (err) {
            throw err;
        }
    }

    private async _registRequiredApiScope(db: Connection, sql: string, id: string, oauthApplicaion: IOauthApplicationDao): Promise<void> {
        try {
            let scopeSystems = await this._getRegistApiScopeSystem(db, id);
            let groupScopeSystems = _.groupBy(scopeSystems, 'SYSTEM');
            let system = _.reduce(groupScopeSystems, (_system, groupScopeSystem, SYSTEM) => {
                if (groupScopeSystem.length === 1 && !groupScopeSystem[0].IS_REQUIRED) {
                    _system.push(SYSTEM);
                }

                return _system;
            }, <string[]> []);

            // auto regist required api-scopes, the system name of the api-scope registered according to the former
            let [scopes] = <[IApiScopeDao[], FieldPacket[]]> await db.query(`
                SELECT
                    *
                FROM
                    api_scope
                WHERE
                    \`SYSTEM\` IN (?)
                    AND IS_REQUIRED = true
            `, [system]);
            
            let params = scopes.map((scope) => {
                const { ID } = scope;
                let is_checked = true;
                let is_disabled = false;

                return {
                    id: ID,
                    is_disabled,
                    is_checked
                };
            });
            await this._registApiScope(db, sql, params, id, oauthApplicaion);

            await db.query(sql, params);
        } catch (err) {
            throw err;
        }
    }

    private async _registApiScope(
        db: Connection,  sql: string, body: IRegistBody[], id: string,
        oauthApplicaion: IOauthApplicationDao,
    ): Promise<void> {
        try {
            await db.query('DELETE FROM oauth_scope WHERE OAUTH_APPLICATION_ID = ?', [id]);
            let params = body.map((data) => {
                const { id: scope_id, is_disabled = false, is_checked = true } = data;
                let uid = uuid();

                return [uid, id, scope_id, is_disabled, is_checked, oauthApplicaion.CLIENT_ID];
            });
            sql += `
                VALUSE (${params.map(() => '?').join('), (')})
            `;

            await db.query(sql, params);
        } catch (err) {
            throw err;
        }
    }

    private async _checkOauthApplication(db: Connection, id: string): Promise<IOauthApplicationDao> {
        try {
            let [oauthApplications] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM oauth_application WHERE ID = ?
            `, [id]);
            if (oauthApplications.length === 0) {
                throw new Error(`[${id}] not find`);
            }
            let oauthApplicaion = oauthApplications[0];
            if (!!oauthApplicaion.IS_DISABLED) {
                throw new Error(`[${id}] id disabled`);
            }

            return oauthApplicaion;
        } catch (err) {
            throw err;
        }
    }

    async dbRegistScope(db: Connection, id: string, body: IRegistBody[], options: TAnyObj & IJWTCotext): Promise<IOauthApplicationScopeDao[]> {
        const COLUMNS = ['ID', 'OAUTH_APPLICATION_ID', 'SCOPE_ID', 'IS_DISABLED', 'IS_CHECKED', 'CREATE_BY'];
        try {
            let oauthApplicaion = await this._checkOauthApplication(db, id);

            let sql = `INSERT INTO oauth_scope (${COLUMNS.join(', ')})`;
            await this._registApiScope(db, sql, body, id, oauthApplicaion);
            await this._registRequiredApiScope(db, sql, id, oauthApplicaion);

            let [rows] = <[IOauthApplicationScopeDao[], FieldPacket[]]> await db.query(`
                SELECT * FROM oauth_scope WHERE OAUTH_APPLICATION_ID = ?
            `, [id]);

            return rows;
        } catch (err) {
            throw err;
        }
    }
}

export {
    OauthApplicationScope
};
