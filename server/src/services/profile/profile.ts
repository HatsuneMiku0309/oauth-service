import { install } from 'source-map-support';
install();

import * as _ from 'lodash';
import { Connection, FieldPacket } from 'mysql2/promise';
import { IConfig, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { ILoginRes, IUserDAO, TUSER_TYPE } from '../login/login.interface';
import { IJWTCotext, TContext } from '../utils.interface';
import { IGetProfileRes, IProfile, IUpdateBody, IUserAppsRes } from './profile.interface';


class Profile implements IProfile {
    static instance: IProfile;
    options: TAnyObj & { config: IConfig };
    private constructor(options: TAnyObj & { config: IConfig }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj & { config: IConfig }): IProfile {
        if (!Profile.instance) {
            Profile.instance = new Profile(options);
        }

        return Profile.instance;
    }

    async getProfile(database: IMysqlDatabase, options: TAnyObj & IJWTCotext): Promise<IGetProfileRes> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbGetProfile(db, options);

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

    async dbGetProfile(db: Connection, options: TAnyObj & IJWTCotext): Promise<IGetProfileRes> {
        const { user: { user_id } } = options;
        try {
            let sql = 'SELECT ID, SOURCE, ACCOUNT, EMP_NO, EMAIL, PHONE, BLACK FROM USER WHERE ID = ?';
            let params = [user_id];
            let [rows] = <[
                IGetProfileRes[],
                FieldPacket[]
            ]> await db.query(sql, params);
            if (rows.length === 0) {
                throw new Error('Can\'t find profile');
            }
            let row = rows[0];

            return row;
        } catch (err) {
            throw err;
        }
    }

    async update(ctx: TContext, database: IMysqlDatabase, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<ILoginRes & { reload: boolean; }> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbUpdate(ctx, db, id, body, options);
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

    async dbUpdate(ctx: TContext, db: Connection, id: string, body: IUpdateBody, options: TAnyObj & IJWTCotext): Promise<ILoginRes & { reload: boolean; }> {
        const { account, password, email, phone } = body;
        try {
            let sql = 'SELECT * FROM USER WHERE ID = ?';
            let params = [id];
            let [rows] = <[IUserDAO[], FieldPacket[]]> await db.query(sql, params);
            if (rows.length === 0) {
                throw new Error('user not find');
            }
            let row = rows[0];
            if (row.SOURCE !== 'SELF') {
                throw new Error('Your account not allow modify');
            }

            if (!email) {
                throw new Error('email is required');
            }
            if (!!email && !_.isString(email)) {
                throw new Error('email type error');
            }
            if (!!phone && !_.isString(phone)) {
                throw new Error('phone type error');
            }
            if (!!password && !_.isString(password)) {
                throw new Error('password type error');
            }
            let updateSql = 'UPDATE USER SET ? WHERE ID = ?';
            let updateParams: TAnyObj = [{ EMAIL: email, PHONE: phone }, id];
            !!password && (updateParams[0].PASSWORD = Buffer.from(password).toString('base64'));
            await db.query(updateSql, updateParams);
            let result = {
                reload: false,
                ID: id,
                ACCOUNT: account,
                EMP_NO: row.EMP_NO || '',
                EMAIL: email,
                PHONE: phone || '',
                SOURCE: row.SOURCE,
                USER_TYPE: <TUSER_TYPE> row.USER_TYPE
            };
            !!password && (result.reload = true);

            return result;
        } catch (err) {
            throw err;
        }
    }

    async userApps(database: IMysqlDatabase, options: TAnyObj & IJWTCotext): Promise<IUserAppsRes[]> {
        try {
            let db = await database.getConnection();
            try {
                let result = await this.dbUserApps(db, options);

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

    async dbUserApps(db: Connection, options: TAnyObj & IJWTCotext): Promise<IUserAppsRes[]> {
        const { user: { user_id } } = options;
        try {
            let sql = `
                SELECT
                    oau.ID,
                    oa.NAME APP_NAME
                FROM
                    OAUTH_APPLICATION_USER oau,
                    OAUTH_APPLICATION oa
                WHERE
                    oau.OAUTH_APPLICATION_ID = oa.ID
                    AND oau.USER_ID = ?
            `;
            let params = [user_id];
            let [rows] = <[IUserAppsRes[], FieldPacket[]]> await db.query(sql, params);

            return rows;
        } catch (err) {
            throw err;
        }
    }

    async userRemoveApps(database: IMysqlDatabase, id: string, options: TAnyObj & IJWTCotext): Promise<{ ID: string; }> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbUserRemoveApps(db, id, options);
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

    async dbUserRemoveApps(db: Connection, id: string, options: TAnyObj & IJWTCotext): Promise<{ ID: string; }> {
        const { user: { user_id } } = options;
        try {
            await db.query(`
                DELETE FROM OAUTH_APPLICATION_USER WHERE ID = ? AND USER_ID = ?
            `, [ id, user_id ]);

            return {
                ID: id
            };
        } catch (err) {
            throw err;
        }
    }
}

export {
    Profile
};
