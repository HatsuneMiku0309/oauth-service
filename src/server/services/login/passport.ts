import { install } from 'source-map-support';
install();

import * as jwt from 'jsonwebtoken';
// import { ISignupBody } from './passport.interface';
import { IJWTConfig, TAnyObj } from '../../utils.interface';
import { TContext } from '../utils.interface';
import { Next } from 'koa';

class Passport {
    constructor() { }

    static async signup(): Promise<any> {

    }

    static async passport(config: IJWTConfig, options: TAnyObj = { }) {
        return async (ctx: TContext, next: Next) => {
            try {
                if (!config.UNLESS.test(ctx.url)) {
                    let token = await Passport.resolveHeaderToken(ctx);
                    if (token === undefined || token === null || token === '') {
                        throw new Error('Authentication Error');
                    }

                    const payload = jwt.verify(token, config.KEY);

                    ctx.state.user = payload;
                }
                await next();
            } catch (err: any) {
                ctx.throw(401, err.message);
            }
        };
    }

    static async resolveHeaderToken(ctx: TContext): Promise<any> {
        try {
            const parts = ctx.header.authorization?.split(' ');

            if (parts && parts.length === 2) {
                const scheme = parts[0];
                const credentials = parts[1];

                if (/^Bearer$/i.test(scheme)) {
                    return credentials;
                }
            }
        } catch (err) {
            ctx.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"');
        }
    }
}

export {
    Passport
};
