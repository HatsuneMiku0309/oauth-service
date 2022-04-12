import { install } from 'source-map-support';
install();

import * as Q from 'q';
import { v4 as uuid } from 'uuid';
import { Connection, FieldPacket } from 'mysql2/promise';
import { TAnyObj, IMysqlDatabase } from '../../utils.interface';
import { IJWTCotext } from '../utils.interface';
import { ICreateBody, IListQuery, IRegistBody, IScope, IApiScopeDao, IUpdateBody, IUpdatesBody } from './scope.interface';
import { IBasicPassportRes } from '../jwt/passport.interface';

class Scope implements IScope {
    static instance: IScope;
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

    async dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IApiScopeDao[]> {
        const { user: { user_id } } = options;
        const { name, system } = query;
        try {
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

    async dbCreate(db: Connection, body: ICreateBody, options: TAnyObj & IJWTCotext): Promise<{ ID: string }> {
        const { user: { user_id } } = options;
        const { name, description = '', system, apis } = body;
        try {
            let id = uuid();
            let sql = `
                INSERT INTO api_scope SET ?
            `;
            let params = <IApiScopeDao[]> [{
                ID: id,
                NAME: name,
                DESCRIPTION: description,
                SYSTEM: system,
                APIS: apis,
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

    async dbCreates(db: Connection, body: ICreateBody[], options: TAnyObj & IJWTCotext): Promise<{ ID: string }[]> {
        const { user: { user_id } } = options;
        try {
            let sql = `
                INSERT INTO api_scope SET ?
            `;

            let ids: { ID: string }[] = [];
            let params = <IApiScopeDao[]> [];
            body.forEach((data) => {
                const { name, description = '', system, apis } = data;
                let id = uuid();
                ids.push({ ID: id });
                params.push(<IApiScopeDao> {
                    ID: id,
                    NAME: name,
                    DESCRIPTION: description,
                    SYSTEM: system,
                    APIS: apis,
                    CREATE_BY: user_id
                });
            });

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

    async dbUpdate(db: Connection, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<{ ID: string }> {
        const { user: { user_id } } = options;
        const { description = '', system, apis } = body;
        try {
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

    async dbUpdates(db: Connection, body: IUpdatesBody[], options: TAnyObj & IJWTCotext): Promise<{ ID: string }[]> {
        const { user: { user_id } } = options;
        try {
            let sql = 'UPDATE api_scope SET ? WHERE ID = ?';
            let ids: { ID: string }[] = await Q.all(body.map(async (data) => {
                const { id, description = '', system, apis } = data;
                let [rows] = <[IApiScopeDao[], FieldPacket[]]> await db.query('SELECT * FROM api_scope WHERE ID = ?', [id]);
                if (rows.length === 0) {
                    throw new Error(`[${id}] not find`);
                }

                let params = [];
                params.push(<IApiScopeDao> {
                    DESCRIPTION: description,
                    SYSTEM: system,
                    APIS: apis,
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

    async dbRegist(db: Connection, system: string, body: IRegistBody[], options: TAnyObj & { user: IBasicPassportRes }): Promise<IApiScopeDao[]> {
        const { user: { client_id } } = options;
        try {
            let sql = `
                INSERT INTO api_scope SET ?
                ON DUPLICATE KEY UPDATE
                NAME = VALUES(NAME), DESCRIPTION = VALUES(DESCRIPTION),
                APIS = VALUES(APIS), UPDATE_BY = VALUES(CREATE_BY)
            `;
            let params = body.map((data) => {
                const { name, description = '', apis } = data;
                let id = uuid();
                return {
                    ID: id,
                    SYSTEM: system,
                    NAME: name,
                    DESCRIPTION: description,
                    APIS: apis,
                    CREATE_BY: client_id
                };
            });

            await db.query(sql, params);
            let [rows] = <[IApiScopeDao[], FieldPacket[]]> await db.query('SELECT * FROM api_scope WHERE SYSTEM = ?', [system]);

            return rows;
        } catch (err) {
            throw err;
        }
    }
}

export {
    Scope
};
