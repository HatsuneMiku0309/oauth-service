import { install } from 'source-map-support';
install();

import * as Router from 'koa-router';
import { IRouter, TContext } from '../utils.interface';
import { IConfig, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { BaseRouter } from '../utils';
import { AuthorizationApp } from './authorization-app';

class AuthorizationAppRouter extends BaseRouter implements IRouter {
    readonly api: string = '/authorization-app';
    readonly name: string = 'AuthorizationApp';
    readonly router: Router = new Router();
    readonly options: TAnyObj & { config: IConfig };
    readonly database: IMysqlDatabase;
    constructor(database: IMysqlDatabase, options: TAnyObj & { config: IConfig }) {
        super();
        this.database = database;
        this.options = options;
        this.registerAPIs();
    }

    registerAPIs(): void {
        let authorizationApp = AuthorizationApp.getInstance(this.options);
        let api = super._getRootApi().join('/');
        this.router.get(api, async (ctx: TContext) => {
            const { query } = ctx;
            try {
                let result = await authorizationApp.list(this.database, <any> query, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        api = super._getRootApi(':oa_id').join('/');
        this.router.get(api, async (ctx: TContext) => {
            const { params: { oa_id } } = ctx;
            try {
                let result = await authorizationApp.detail(this.database, oa_id, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        api = super._getRootApi([':oa_id', 'reject-app']).join('/');
        this.router.put(api, async (ctx: TContext) => {
            const { params: { oa_id }, request: { body } } = ctx;
            try {
                let result = await authorizationApp.rejectApp(this.database, oa_id, body, ctx.state);

                return {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        api = super._getRootApi([':oa_id', 'approve-app']).join('/');
        this.router.put(api, async (ctx: TContext) => {
            const { params: { oa_id }, request: { body } } = ctx;
            try {
                let result = await authorizationApp.approveApp(this.database, oa_id, body, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });
    }
}

export {
    AuthorizationAppRouter
};
