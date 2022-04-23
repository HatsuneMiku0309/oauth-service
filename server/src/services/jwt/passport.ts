import { install } from 'source-map-support';
install();

import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';
import { IError, IJWTConfig, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { TContext } from '../utils.interface';
import { Next } from 'koa';
import { IUserDAO } from '../login/login.interface';
import { FieldPacket } from 'mysql2';
import { IBasicPassportRes, ISignupBody } from './passport.interface';
import { TTokenType } from '../oauth/oauth.interface';
import { IOauthApplicationDao } from '../oauth-app/oauth-app.interface';

class Passport {
    static readonly TOKEN_TYPE: string = 'Bearer';
    static readonly BASIC_TOKEN_TYPE: string = 'Basic';
    /**
     * don't reset config.
     */
    static config: IJWTConfig;
    private constructor() { }

    static grantJWTToken(body: any, options: TAnyObj & jwt.SignOptions): string {
        const { ALGORITHM, PRIVATE_KEY } = Passport.config;
        const { expiresIn } = options;
        try {
            const token = jwt.sign(body, PRIVATE_KEY, {
                algorithm: ALGORITHM,
                expiresIn: expiresIn
            });

            return token;
        } catch (err) {
            throw err;
        }
    }

    static decodeJWTPayload<T extends TAnyObj = TAnyObj>(token: string): T {
        const { PUBLIC_KEY } = Passport.config;
        try {
            const payload: T = <T> jwt.verify(token, PUBLIC_KEY);

            return payload;
        } catch (err) {
            throw err;
        }
    }

    static async signup(body: ISignupBody, options: TAnyObj = { }): Promise<string> {
        try {
            const { ALGORITHM, EXPIRES_IN, EXPIRES_TYPE, PRIVATE_KEY } = Passport.config;
            const token = jwt.sign(body, PRIVATE_KEY, {
                algorithm: ALGORITHM,
                expiresIn: `${EXPIRES_IN}${EXPIRES_TYPE}`
            });

            return token;
        } catch (err) {
            throw err;
        }
    }

    static async basicPassport(
        database: IMysqlDatabase, ctx: TContext, options: TAnyObj = { }
    ): Promise<IBasicPassportRes> {
        let _err: IError = new Error();
        const NOW_DATE = new Date();
        try {
            const COLUMNS = ['client_id', 'client_secret'];
            let token = await Passport.resolveHeaderToken('basic', ctx);
            if (token === undefined || token === null || token === '') {
                _err.state = 401;
                _err.message = 'Bad Authorization header format. Format is "Authorization: Basic <token>"';

                throw _err;
            }

            let decodeToken = Buffer.from(token, 'base64').toString('ascii');
            let splitToken = decodeToken.split(':');
            if (splitToken.length !== COLUMNS.length) {
                _err.state = 401;
                _err.message = 'Bad token format. Format is <client_id:client_secret> base64 encode';
            }
            let result = <IBasicPassportRes> _.reduce(COLUMNS, (_r, column, index) => {
                _r[column] = splitToken[index];

                return _r;
            }, <any> { });
            const db = await database.getConnection();
            try {
                let [rows] = <[IOauthApplicationDao[], FieldPacket[]]> await db.query(`
                    SELECT * FROM OAUTH_APPLICATION WHERE CLIENT_ID = ? AND CLIENT_SECRET = ?
                `, [
                    result.client_id, result.client_secret
                ]);
                if (rows.length === 0) {
                    _err.state = 401;
                    _err.message = 'Authorization Error';

                    throw _err;
                }
                let row = rows[0];
                if (!row.IS_CHECKED) {
                    _err.state = 401;
                    _err.message = 'Authorization Error. not check';

                    throw _err;
                } else if (row.IS_DISABLED) {
                    _err.state = 401;
                    _err.message = 'Authorization Error. disabled';

                    throw _err;
                } else if (row.EXPIRES_DATE && +new Date(row.EXPIRES_DATE) <= +NOW_DATE) {
                    _err.state = 401;
                    _err.message = 'Authorization Error. expires';

                    throw _err;
                } else if (row.NOT_BEFORE && +new Date(row.NOT_BEFORE) >= +NOW_DATE ) {
                    _err.state = 401;
                    _err.message = 'Authorization Error. not before';

                    throw _err;
                }
                result.user_id = row.USER_ID;
            } catch (err) {
                throw err;
            } finally {
                await database.end(db);
            }

            return result;
        } catch (err: any) {
            _err = err;
            _err.state = _err.state ? _err.state : 500;
            ctx.throw(_err.state, _err, { expose: true });
        }
    }

    static async passport(database: IMysqlDatabase, config?: IJWTConfig, options: TAnyObj = { }) {
        return async (ctx: TContext, next: Next) => {
            let _err: IError = new Error();
            try {
                const { UNLESS, PUBLIC_KEY } = config ? config : Passport.config;
                if (!new RegExp(UNLESS.join('|')).test(ctx.url)) {
                    let token = await Passport.resolveHeaderToken('bearer', ctx);
                    if (token === undefined || token === null || token === '') {
                        _err.state = 401;
                        _err.message = 'Bad Authorization header format. Format is "Authorization: Bearer <token>"';

                        throw _err;
                    }
                    try {
                        let payload: jwt.JwtPayload & ISignupBody;
                        try {
                            payload = <jwt.JwtPayload & ISignupBody> jwt.verify(token, PUBLIC_KEY, {
                                // issuer: 'cosmo_serives',
                                // subject: 'cosmo',
                                // nonce: '123123fds'
                            });
                        } catch (err: any) {
                            _err = err;
                            _err.state = 401;

                            throw _err;
                        }
                        const db = await database.getConnection();
                        try {
                            let [rows] = <[IUserDAO[], FieldPacket[]]> await db.query('SELECT * FROM USER WHERE ID = ?', [payload.user_id]);
                            if (rows.length === 0) {
                                _err.state = 401;
                                _err.message = 'Authentication Error';

                                throw _err;
                            }
                        } catch (err: any) {
                            _err = err;
                            _err.state = _err.state ? _err.state : 500;

                            throw _err;
                        } finally {
                            await database.end(db);
                        }

                        ctx.state.jwt = token;
                        ctx.state.user = payload;
                    } catch (err: any) {
                        _err = err;
                        _err.state = _err.state ? _err.state : 500;

                        throw _err;
                    }
                }

                await next();
            } catch (err: any) {
                _err = err;
                _err.state = _err.state ? _err.state : 500;

                ctx.throw(_err.state, _err, { expose: true });
            }
        };
    }

    static async resolveHeaderToken(type: TTokenType, ctx: TContext): Promise<any> {
        const TOKEN_TYPE = type === 'basic'
            ? Passport.BASIC_TOKEN_TYPE
            : Passport.TOKEN_TYPE;
        try {
            const parts = ctx.header.authorization?.split(' ');

            if (parts && parts.length === 2) {
                const scheme = parts[0];
                const credentials = parts[1];
                const re = new RegExp('^' + TOKEN_TYPE + '$', 'i');
                if (re.test(scheme)) {
                    return credentials;
                }
            }
        } catch (err) {
            ctx.throw(401, `Bad Authorization header format. Format is "Authorization: ${TOKEN_TYPE} <token>"`);
        }
    }
}

export {
    Passport
};