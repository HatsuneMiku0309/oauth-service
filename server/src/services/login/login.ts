import { install } from 'source-map-support';
import { IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { TContext } from '../utils.interface';
install();

import { IRegistBody, ILogin, ILoginBody, IUserDAO } from './login.interface';
import { Passport } from '../jwt/passport';
import { FieldPacket } from 'mysql2';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { Connection } from 'mysql2/promise';

class Login implements ILogin {
    private static instance: ILogin;
    options: TAnyObj;
    private constructor(options: TAnyObj = { }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj = { }): ILogin {
        if (!Login.instance) {
            Login.instance = new Login(options);
        }

        return Login.instance;
    }

    async login(ctx: TContext, database: IMysqlDatabase, options: TAnyObj = { }): Promise<IUserDAO> {
        const { body } = <{ body: ILoginBody }> ctx.request;
        try {
            let db = await database.getConnection();
            try {
                let [rows] = <[IUserDAO[], FieldPacket[]]> await db.query('SELECT * FROM USER WHERE ACCOUNT = ? AND PASSWORD = ?', [body.account, body.password]);
                if (rows.length === 0) {
                    throw new Error('Can\'t find user');
                }
                let row = rows[0];
                let token = await Passport.signup({
                    user_id: row.ID,
                    account: body.account
                    // iss: 'cosmo_serives',
                    // sub: body.account,
                    // nbf: Math.ceil((+new Date()) / 1000),
                    // nonce: '123123fds'
                }, options);
                ctx.set('Authorization', `${Passport.TOKEN_TYPE} ${token}`);

                return <any> {
                    ID: row.ID,
                    ACCOUNT: row.ACCOUNT,
                    EMAIL: row.EMAIL,
                    PHONE: row.PHONE
                };
            } catch (err) {
                throw err;
            } finally {
                await database.end(db);
            }
        } catch (err) {
            throw err;
        }
    }

    private _checkRegistBody(body: IRegistBody): void {
        const { account, password, email, phone } = body;
        try {
            if (!account) {
                throw new Error('account is required');
            } else if (!password) {
                throw new Error('password is required');
            } else if (!email) {
                throw new Error('email is required');
            }

            if (!!account && !_.isString(account)) {
                throw new Error('account type error');
            }
            if (!!password && !_.isString(password)) {
                throw new Error('password type error');
            }
            if (!!email && !_.isString(email)) {
                throw new Error('email type error');
            }
            if (!!phone && !_.isString(phone)) {
                throw new Error('phone type error');
            }
        } catch (err) {
            throw err;
        }
    }

    private async _checkDuplicationRegist(db: Connection, body: IRegistBody): Promise<void> {
        const { account } = body;
        try {
            let [rows] = <[IUserDAO[], FieldPacket[]]> await db.query('SELECT * FROM USER WHERE ACCOUNT = ?', [ account ]);
            if (rows.length !== 0) {
                throw new Error(`[${account}] account is duplication regist`);
            }
        } catch (err) {
            throw err;
        }
    }

    async regist(database: IMysqlDatabase, body: IRegistBody, options?: TAnyObj): Promise<{ ACCOUNT: string; }> {
        const { account, password, email, phone } = body;
        try {
            this._checkRegistBody(body);
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                await this._checkDuplicationRegist(db, body);
                let sql = `
                    INSERT INTO USER SET ?
                `;
                let id = uuid();
                let params = <IUserDAO> {
                    ID: id,
                    ACCOUNT: account,
                    PASSWORD: Buffer.from(password).toString('base64'),
                    EMAIL: email
                };
                !!phone && (params.PHONE = phone);

                await db.query(sql, params);
                await db.commit();

                return {
                    ACCOUNT: account
                };
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
}

export {
    Login
};
