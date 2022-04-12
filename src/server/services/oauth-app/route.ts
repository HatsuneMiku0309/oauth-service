import { install } from 'source-map-support';
install();

import * as Router from 'koa-router';
import { IRouter, TContext } from '../utils.interface';
import { IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { OauthApplication } from './oauth-app';
import { BaseRouter } from '../utils';

class OauthApplicationRouter extends BaseRouter implements IRouter {
    readonly api: string = '/oauth-app';
    readonly name: string = 'OauthApp';
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
        let oauthApplication = OauthApplication.getInstance(this.options);
        let api = super._getRootApi().join('/');
        this.router.get(api, async (ctx: TContext) => {
            const { query } = ctx.request;
            try {
                let result = await oauthApplication.list(this.database, query, ctx.state);

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
                let result = await oauthApplication.update(this.database, id, body, ctx.state);

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

        api = super._getRootApi([':id', 'oauth_application_user', ':oau_id']).join('/');
        this.router.delete(api, async (ctx: TContext) => {
            const { id, oau_id } = ctx.params;
            try {
                let result = await oauthApplication.removeUser(this.database, id, oau_id, ctx.state);

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
