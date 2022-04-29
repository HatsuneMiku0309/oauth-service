import { install } from 'source-map-support';
install();

import * as Router from 'koa-router';
import { IRouter, TContext } from '../utils.interface';
import { IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { Oauth } from './oauth';
import { BaseRouter } from '../utils';
import { Passport } from '../jwt/passport';

class OauthRouter extends BaseRouter implements IRouter {
    readonly api: string = '/oauth';
    readonly name: string = 'Oauth';
    readonly router: Router = new Router();
    readonly options: TAnyObj;
    readonly database: IMysqlDatabase;
    constructor(database: IMysqlDatabase, options: TAnyObj = { }) {
        super();
        this.options = options;
        this.database = database;
        this.registerAPIs();
    }

    registerAPIs(): void {
        let oauth = Oauth.getInstance(this.options);
        let api = super._getRootApi('grant-code-token').join('/');
        this.router.post(api, async (ctx: TContext) => {
            const { body } = ctx.request;
            try {
                let result = await oauth.grantCodeToken(this.database, body, ctx.state);

                ctx.set('Cache-Control', 'no-store');
                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        api = super._getRootApi('access-token').join('/');
        this.router.post(api, async (ctx: TContext) => {
            const { body } = ctx.request;
            try {
                let basicObj = await Passport.basicPassport(this.database, ctx);
                let result = await oauth.accessToken(this.database, body, { user: basicObj });

                ctx.set('Cache-Control', 'no-store');
                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi('refresh-token').join('/');
        this.router.post(api, async (ctx: TContext) => {
            const { body } = ctx.request;
            try {
                let basicObj = await Passport.basicPassport(this.database, ctx);
                let result = await oauth.refreshToken(this.database, body, { user: basicObj });

                ctx.set('Cache-Control', 'no-store');
                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi('verify-token').join('/');
        this.router.post(api, async (ctx: TContext) => {
            const { body } = ctx.request;
            try {
                let basicObj = await Passport.basicPassport(this.database, ctx);
                let result = await oauth.verifyToken(this.database, body, { user: basicObj });

                ctx.set('Cache-Control', 'no-store');
                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi(':client_id').join('/');
        this.router.get(api, async (ctx: TContext) => {
            const { params: { client_id } } = ctx;
            try {
                let result = await oauth.getOauthApplicationScope(this.database, client_id, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });
    }
}

export {
    OauthRouter
};
