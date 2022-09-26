import { install } from 'source-map-support';
install();

import * as Router from 'koa-router';
import { IRouter, TContext } from '../utils.interface';
import { IConfig, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { Scope } from './scope';
import { BaseRouter } from '../utils';
import { Passport } from '../jwt/passport';

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

        api = super._getRootApi(['register', ':system']).join('/');
        this.router.post(api, async (ctx: TContext) => {
            const { params: { system }, request: { body } } = ctx;
            try {
                let basicObj = await Passport.basicPassport(this.database, ctx);
                let result = await scope.regist(this.database, system, body, { user: basicObj });

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
