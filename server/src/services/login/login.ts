import { install } from 'source-map-support';
install();

import { IConfig, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { IJWTCotext, TContext } from '../utils.interface';
import * as ldap from 'ldapjs';
import { IRegistBody, ILogin, ILoginBody, IUserDAO, ILdapUserDao, TSource, ILoginRes, TUSER_TYPE } from './login.interface';
import { Passport } from '../jwt/passport';
import { FieldPacket } from 'mysql2';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { Connection } from 'mysql2/promise';
import { ISignupBody } from '../jwt/passport.interface';

class Login implements ILogin {
    private static instance: ILogin;
    options: TAnyObj & { config: IConfig };
    private constructor(options: TAnyObj & { config: IConfig }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj & { config: IConfig }): ILogin {
        if (!Login.instance) {
            Login.instance = new Login(options);
        }

        return Login.instance;
    }

    private _getUserDomainIps(domain: string) {
        let res: { dcs: string, ips: string[] } = {
            dcs: '',
            ips: []
        };

        let tmp_domain = _.toLower(domain);

        switch (tmp_domain) {
            case 'gi':
                res.ips = ['10.129.2.1', '10.128.2.100'];
                res.dcs = 'dc=gi,dc=compal,dc=com';
                break;
            case 'tpe':
            case 'compal':
                res.ips = ['10.110.15.1', 'compal.com'];
                res.dcs = 'dc=compal,dc=com';
                break;
            case 'vn':
                res.ips = ['10.144.2.101'];
                res.dcs = 'dc=vn,dc=compal,dc=com';
                break;
            default:
                res.ips = ['10.129.2.1', '10.128.2.100'];
                res.dcs = 'dc=gi,dc=compal,dc=com';
                break;
        }
        return res;
    }

    private async _ldapLogin(
        userInfo: {
            domain: string;
            username: string;
            pass: string;
            ip: string;
        },
        domainServerIp: string,
        dcs: string
    ) {
        let client = ldap.createClient({
            url: 'ldap://' + domainServerIp
        });

        let opts: ldap.SearchOptions = {
            filter: '(&(sAMAccountName=' + userInfo.username + '))',
            scope: 'sub',
            timeLimit: 500
        };

        return new Promise((resolve) => {
            client.bind(userInfo.domain + '\\' + userInfo.username, userInfo.pass, (err, res1) => {
                client.search(dcs, opts, (_err, res2) => {
                    res2.on('searchEntry', (entry) => {
                        let us = entry.object;
                        let phoneRe = /.*\(([0-9]*)\)/;
                        let ldapPhone = (<string> us.telephoneNumber).match(phoneRe);
                        resolve({
                            auth: true,
                            emp_name: userInfo.username,
                            emp_no: (us.employeeID === null ? us.extensionAttribute3 : us.employeeID),
                            depart_code: us.extensionAttribute5,
                            depart_name: us.department,
                            email: us.mail,
                            phone: ldapPhone === null ? '' : ldapPhone[1]
                        });
                    });

                    res2.on('error', (__err) => {
                        resolve({
                            auth: false,
                            message: __err.message
                        });
                        client.unbind();
                    });

                    res2.on('end', (result) => {
                        client.unbind();
                    });
                });
            });
        });
    }

    private async ldapLogin(
        db: Connection, body: ILoginBody,
        options: TAnyObj & { ip: string }
    ): Promise<ILdapUserDao> {
        const { ip } = options;
        const { account, password } = body;
        try {
            let _ip = '';
            if (!!ip) {
                if (ip === '::1') {
                    _ip = '127.0.0.1';
                }  else {
                    if (ip.substr(0, 7) === '::ffff:') {
                        _ip = ip.substr(7);
                    } else {
                        _ip = ip.substr(0, 20);
                    }
                }
            }
            let splitAccount = account.split('\\');
            if (splitAccount.length !== 2) {
                throw new Error('[LDAP] Account format error');
            }
            const [domain, username] = splitAccount;
            let userInfo = {
                domain: _.toLower(domain) === 'tpe' ? 'compal' : domain,
                username: username,
                pass: password,
                ip: _ip
            };

            let domainServer = this._getUserDomainIps(domain);
            let domainServerIps = domainServer.ips;
            let res: any;
            for (let dip of domainServerIps) {
                res = await this._ldapLogin(userInfo, dip, domainServer.dcs);
                if (res.auth) {
                    break;
                }
            }

            return res;
        } catch (err) {
            throw err;
        }
    }

    private async _grantLoginToken(
        db: Connection, body: ISignupBody, options: TAnyObj = { }
    ): Promise<string> {
        const { user_id: id } = body;
        try {
            let token = await Passport.signup(body, options);
            await db.query('UPDATE USER SET ? WHERE ID = ?', [{ TOKEN: token }, id]);

            return token;
        } catch (err) {
            throw err;
        }
    }

    private async _dbLdapLogin(ctx: TContext, db: Connection, options: TAnyObj): Promise<ILoginRes> {
        const { body: { account, password }, ip } = <{ body: ILoginBody, ip: string }> ctx.request;
        try {
            let res = await this.ldapLogin(db, { account, password }, { ip });
            if (res.auth) {
                let _password = Buffer.from(`${res.auth};${res.emp_name};${res.email};${res.phone}`).toString('base64');
                let [rows] = <[IUserDAO[], FieldPacket[]]> await db.query(`
                    SELECT * FROM USER WHERE ACCOUNT = ? AND SOURCE = ?
                `, [account, 'COMPAL']);
                if (rows.length === 0) { // if not find use, auto register
                    let { ID } = await this.dbRegist(db, {
                        empNo: res.emp_no,
                        account: account,
                        password: _password,
                        email: res.email,
                        phone: res.phone
                    }, { source: 'COMPAL' });
                    let token = await this._grantLoginToken(db, {
                        user_id: ID, account: account,
                        source: 'COMPAL', user_type: 'VIEWER'
                    }, options);
                    ctx.set('Authorization', `${Passport.TOKEN_TYPE} ${token}`);

                    return {
                        ID,
                        ACCOUNT: account,
                        EMP_NO: res.emp_no,
                        EMAIL: res.email,
                        PHONE: res.phone,
                        SOURCE: 'COMPAL',
                        USER_TYPE: 'VIEWER'
                    };
                } else { // find use, check password and go!
                    let row = rows[0];
                    // base data update.
                    if (row.PASSWORD !== Buffer.from(_password).toString('base64')) {
                        await db.query(`
                            UPDATE USER SET PASSWORD = ? WHERE ID = ?
                        `, [Buffer.from(_password).toString('base64'), row.ID]);
                        let [_rows] = <[IUserDAO[], FieldPacket[]]> await db.query('SELECT * FROM USER WHERE ACCOUNT = ? AND SOURCE = ?', [account, 'COMPAL']);
                        rows = _rows;
                        row = rows[0];
                    }
                    let token = await this._grantLoginToken(db, {
                        user_id: row.ID, account: row.ACCOUNT,
                        source: <TSource> row.SOURCE, user_type: <TUSER_TYPE> row.USER_TYPE
                    }, options);
                    ctx.set('Authorization', `${Passport.TOKEN_TYPE} ${token}`);

                    return {
                        ID: row.ID,
                        ACCOUNT: row.ACCOUNT,
                        EMP_NO: row.EMP_NO || '',
                        EMAIL: row.EMAIL,
                        PHONE: <string> row.PHONE,
                        SOURCE: <TSource> row.SOURCE,
                        USER_TYPE: <TUSER_TYPE> row.USER_TYPE
                    };
                }
            } else {
                throw new Error('[LDAP] Account or password error');
            }
        } catch (err) {
            throw err;
        }
    }

    async login(ctx: TContext, database: IMysqlDatabase, options: TAnyObj = { }): Promise<ILoginRes> {
        const { body: { account } } = <{ body: ILoginBody }> ctx.request;
        try {
            let db = await database.getConnection();
            await db.beginTransaction();
            try {
                if (account.indexOf('\\') !== -1) {
                    let result = await this._dbLdapLogin(ctx, db, options);
                    await db.commit();

                    return result;
                } else {
                    let result = await this._dbLogin(ctx, db, options);
                    await db.commit();

                    return result;
                }
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

    private async _dbLogin(ctx: TContext, db: Connection, options?: TAnyObj): Promise<ILoginRes> {
        const { body: { account, password } } = <{ body: ILoginBody }> ctx.request;
        try {
            let [rows] = <[IUserDAO[], FieldPacket[]]> await db.query(`
                SELECT * FROM USER WHERE ACCOUNT = ? AND SOURCE = ?
            `, [account, 'SELF']);
            if (rows.length === 0) {
                throw new Error('Account or password error');
            }
            let row = rows[0];
            if (row.PASSWORD !== Buffer.from(password).toString('base64')) {
                throw new Error('Account or password error');
            }
            let token = await this._grantLoginToken(db, {
                user_id: row.ID,
                account: account,
                source: <TSource> row.SOURCE,
                user_type: <TUSER_TYPE> row.USER_TYPE
                // iss: 'cosmo_serives',
                // sub: body.account,
                // nbf: Math.ceil((+new Date()) / 1000),
                // nonce: '123123fds'
            }, options);
            ctx.set('Authorization', `${Passport.TOKEN_TYPE} ${token}`);

            return {
                ID: row.ID,
                ACCOUNT: row.ACCOUNT,
                EMP_NO: row.EMP_NO || '',
                EMAIL: row.EMAIL,
                PHONE: row.PHONE || '',
                SOURCE: <TSource> row.SOURCE,
                USER_TYPE: <TUSER_TYPE> row.USER_TYPE
            };
        } catch (err) {
            throw err;
        }
    }

    async tokenLogin(database: IMysqlDatabase, options: TAnyObj & IJWTCotext): Promise<ILoginRes> {
        const { user: { user_id } } = options;
        try {
            let db = await database.getConnection();
            await db.beginTransaction();
            try {
                let sql = 'SELECT * FROM USER WHERE ID = ?';
                let [rows] = <[IUserDAO[], FieldPacket[]]> await db.query(sql, [ user_id ]);
                if (rows.length === 0) {
                    throw new Error('token check fail');
                }
                let row = rows[0];
                // if (row.TOKEN !== jwt) {
                //     throw new Error('token check fail');
                // }
                await db.commit();

                return {
                    ID: row.ID,
                    ACCOUNT: row.ACCOUNT,
                    EMP_NO: row.EMP_NO || '',
                    EMAIL: row.EMAIL,
                    PHONE: row.PHONE || '',
                    SOURCE: <TSource> row.SOURCE,
                    USER_TYPE: <TUSER_TYPE> row.USER_TYPE
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

    private _checkRegistBody(body: IRegistBody): void {
        const { empNo = '', account, password, email, phone } = body;
        try {
            if (!account) {
                throw new Error('account is required');
            } else if (!password) {
                throw new Error('password is required');
            } else if (!email) {
                throw new Error('email is required');
            }

            if (!!empNo && !_.isString(empNo)) {
                throw new Error('empNo type error');
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

    private async _checkDuplicationRegist(db: Connection, body: IRegistBody, options?: TAnyObj & { source?: TSource; }): Promise<void> {
        const { account } = body;
        const { source = 'SELF' } = options || { };
        try {
            let [rows] = <[IUserDAO[], FieldPacket[]]> await db.query(`
                SELECT * FROM USER WHERE ACCOUNT = ? AND SOURCE = ?
            `, [ account, source ]);
            if (rows.length !== 0) {
                throw new Error(`[${account}] account is duplication regist`);
            }
        } catch (err) {
            throw err;
        }
    }

    async regist(database: IMysqlDatabase, body: IRegistBody, options?: TAnyObj): Promise<{ ID: string; }> {
        try {
            let db = await database.getConnection();
            try {
                await db.beginTransaction();
                let result = await this.dbRegist(db, body, options);
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

    async dbRegist(db: Connection, body: IRegistBody, options?: TAnyObj & { source?: TSource; }): Promise<{ ID: string; }> {
        const { empNo = '', account, password, email, phone } = body;
        const { source = 'SELF' } = options || { };
        try {
            this._checkRegistBody(body);
            await this._checkDuplicationRegist(db, body, options);
            let sql = `
                INSERT INTO USER SET ?
            `;
            let id = uuid();
            let params = <IUserDAO> {
                ID: id,
                EMP_NO: empNo,
                ACCOUNT: account,
                PASSWORD: Buffer.from(password).toString('base64'),
                EMAIL: email,
                SOURCE: source,
                USER_TYPE: source === 'SELF' ? 'DEVELOPER' : 'VIEWER'
            };
            !!phone && (params.PHONE = phone);

            await db.query(sql, params);

            return {
                ID: id
            };
        } catch (err) {
            throw err;
        }
    }
}

export {
    Login
};
