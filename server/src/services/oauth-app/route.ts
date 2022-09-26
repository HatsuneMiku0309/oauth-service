import { install } from 'source-map-support';
install();

import * as Router from 'koa-router';
import { IRouter, TContext } from '../utils.interface';
import { IConfig, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { OauthApplication } from './oauth-app';
import { OauthApplicationScope } from './oauth-app-scope';
import { BaseRouter } from '../utils';
import { OauthApplicationUser } from './oauth-app-user';
import { Oauth } from '../oauth/oauth';

class OauthApplicationRouter extends BaseRouter implements IRouter {
    readonly api: string = '/oauth-app';
    readonly name: string = 'OauthApp';
    readonly router: Router = new Router();
    readonly options: TAnyObj & { config: IConfig };
    readonly database: IMysqlDatabase;
    constructor(database: IMysqlDatabase, options: TAnyObj & { config: IConfig }) {
        super();
        this.options = options;
        this.database = database;
        this.registerAPIs();
    }

    registerAPIs(): void {
        let oauthApplication = OauthApplication.getInstance(this.options);
        let oauthApplicationScope = OauthApplicationScope.getInstance(this.options);
        let oauthApplicationUser = OauthApplicationUser.getInstance(this.options);
        let oauth = Oauth.getInstance(this.options);

        let api = super._getRootApi().join('/');
        this.router.get(api, async (ctx: TContext) => {
            const { query } = ctx.request;
            try {
                let result = await oauthApplication.list(this.database, <any> query, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        api = super._getRootApi(':id').join('/');
        this.router.get(api, async (ctx: TContext) => {
            const { id } = ctx.params;
            try {
                let result = await oauthApplication.detail(this.database, id, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        api = super._getRootApi().join('/');
        this.router.post(api, async (ctx: TContext) => {
            const { body } = ctx.request;
            try {
                let result = await oauthApplication.create(this.database, body, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi(':id').join('/');
        this.router.put(api, async (ctx: TContext) => {
            const { params: { id }, request: { body } } = ctx;
            try {
                let result = await oauthApplication.update(this.database, id, body, {
                    ...ctx.state,
                    oauthApplicationScope,
                    oauth
                });

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi([':id', 'api-key']).join('/');
        this.router.put(api, async (ctx: TContext) => {
            const { params: { id } } = ctx;
            try {
                let result = await oauthApplication.reloadApiKey(this.database, id, {
                    ...ctx.state,
                    oauth
                });

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi([':id', 'client-secret']).join('/');
        this.router.put(api, async (ctx: TContext) => {
            const { params: { id } } = ctx;
            try {
                let result = await oauthApplication.reloadClientSecret(this.database, id, {
                    ...ctx.state,
                    oauth
                });

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi(':id').join('/');
        this.router.delete(api, async (ctx: TContext) => {
            const { id } = ctx.params;
            try {
                let result = await oauthApplication.remove(this.database, id, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        // oauth_application_sceop

        api = super._getRootApi([':oa_id', 'oauth_app_scope']).join('/');
        this.router.get(api, async (ctx: TContext) => {
            const { params: { oa_id } } = ctx;
            try {
                let result = await oauthApplicationScope.list(this.database, oa_id, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        api = super._getRootApi([':oa_id', 'oauth_app_scope']).join('/');
        this.router.post(api, async (ctx: TContext) => {
            // const { params: { oa_id }, request: { body } } = ctx;
            try {
                ctx.status = 500;
                ctx.throw('Not yet allowed to use');
                // let result = await oauthApplicationScope.registScope(this.database, oa_id, body, ctx.state);

                // ctx.body = {
                //     data: result
                // };
            } catch (err: any) {
                throw err;
            }
        });

        // oauth_application_user

        api = super._getRootApi([':oa_id', 'oauth_application_user']).join('/');
        this.router.get(api, async (ctx: TContext) => {
            const { params: { oa_id }, request: { query } } = ctx;
            try {
                let result = await oauthApplicationUser.list(this.database, oa_id, <any> query, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi([':oa_id', 'oauth_application_user']).join('/');
        this.router.delete(api, async (ctx: TContext) => {
            const { oa_id } = ctx.params;
            const { body } = ctx.request;
            try {
                let result = await oauthApplicationUser.removeUsers(this.database, oa_id, body, ctx.state);

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
    OauthApplicationRouter
};
