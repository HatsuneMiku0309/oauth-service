import { install } from 'source-map-support';
install();

import { Next } from 'koa';
import * as Router from 'koa-router';
import { IRouter, TContext } from '../utils.interface';
import { IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { Login } from './login';
import { BaseRouter } from '../utils';

class LoginRouter extends BaseRouter implements IRouter {
    readonly api: string = '/login';
    readonly name: string = 'Login';
    readonly router: Router = new Router();
    readonly options: TAnyObj;
    readonly database: IMysqlDatabase;
    constructor(database: IMysqlDatabase, options: TAnyObj = { }) {
        super();
        this.database = database;
        this.options = options;
        this.registerAPIs();
    }

    registerAPIs(): void {
        let login = Login.getInstance(this.options);
        let api = super._getRootApi().join('/');
        this.router.post(api, async (ctx: TContext, next: Next) => {
            try {
                let result = await login.login(ctx, this.database);

                ctx.body = result;
            } catch (err: any) {
                throw err;
            }
        });

        this.router.post('/register', async (ctx: TContext, next: Next) => {
            const { body } = ctx.request;
            try {
                let result = await login.regist(this.database, body, this.options);

                ctx.body = result;
            } catch (err: any) {
                throw err;
            }
        });
    }
}

export {
    LoginRouter
};
