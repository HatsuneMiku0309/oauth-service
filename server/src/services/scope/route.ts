import { install } from 'source-map-support';
install();

import * as Router from 'koa-router';
import { IRouter, TContext } from '../utils.interface';
import { IConfig, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { Scope } from './scope';
import { BaseRouter } from '../utils';

class ScopeRouter extends BaseRouter implements IRouter {
    readonly api: string = '/api-scope';
    readonly name: string = 'ApiScope';
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
        let scope = Scope.getInstance(this.options);
        let api = super._getRootApi().join('/');
        this.router.get(api, async (ctx: TContext) => {
            const { query } = ctx.request;
            try {
                let result = await scope.list(this.database, <any> query, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        api = super._getRootApi().join('/');
        this.router.post(api, async (ctx: TContext) => {
            // const { body } = ctx.request;
            try {
                ctx.status = 500;
                ctx.throw('Not yet allowed to use');
                // let result = await scope.create(this.database, body, ctx.state);

                // ctx.body = {
                //     data: result
                // };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi('creates').join('/');
        this.router.post(api, async (ctx: TContext) => {
            // const { body } = ctx.request;
            try {
                ctx.status = 500;
                ctx.throw('Not yet allowed to use');
                // let result = await scope.creates(this.database, body, ctx.state);

                // ctx.body = {
                //     data: result
                // };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi(':id').join('/');
        this.router.put(api, async (ctx: TContext) => {
            // const { params: { id }, request: { body } } = ctx;
            try {
                ctx.status = 500;
                ctx.throw('Not yet allowed to use');
                // let result = await scope.update(this.database, id, body, ctx.state);

                // ctx.body = {
                //     data: result
                // };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi(['updates']).join('/');
        this.router.put(api, async (ctx: TContext) => {
            // const { request: { body } } = ctx;
            try {
                ctx.status = 500;
                ctx.throw('Not yet allowed to use');
                // let result = await scope.updates(this.database, body, ctx.state);

                // ctx.body = {
                //     data: result
                // };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi(':id').join('/');
        this.router.delete(api, async (ctx: TContext) => {
            // const { id } = ctx.params;
            try {
                ctx.status = 500;
                ctx.throw('Not yet allowed to use');
                // let result = await scope.remove(this.database, id, ctx.state);

                // ctx.body = {
                //     data: result
                // };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi(['register', ':system']).join('/');
        this.router.post(api, async (ctx: TContext) => {
            const { params: { system }, request: { body } } = ctx;
            try {
                let result = await scope.regist(this.database, system, body, ctx.state);

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
    ScopeRouter
};
