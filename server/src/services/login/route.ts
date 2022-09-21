import { install } from 'source-map-support';
install();

import * as Router from 'koa-router';
import { IRouter, TContext } from '../utils.interface';
import { IConfig, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { Login } from './login';
import { BaseRouter } from '../utils';

class LoginRouter extends BaseRouter implements IRouter {
    readonly api: string = '/login';
    readonly name: string = 'Login';
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
        let login = Login.getInstance(this.options);
        let api = super._getRootApi().join('/');
        this.router.get(api, async (ctx: TContext) => {
            try {
                ctx.redirect('https://www.google.com.tw/');
            } catch (err: any) {
                throw err;
            }
        });

        this.router.post(api, async (ctx: TContext) => {
            try {
                let result = await login.login(ctx, this.database);
                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        api = super._getRootApi('token').join('/');
        this.router.get(api, async (ctx: TContext) => {
            try {
                let result = await login.tokenLogin(this.database, ctx.state);
                // ctx.cookies.set('location', '/', {
                //     signed: true,
                //     maxAge: 5 * 1000,
                //     httpOnly: false,
                //     overwrite: false
                // });
                // ctx.status = 302;
                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        this.router.post('/register', async (ctx: TContext) => {
            const { body } = ctx.request;
            try {
                let result = await login.regist(this.database, body, this.options);

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        this.router.post('/forget', async (ctx: TContext) => {
            const { body } = ctx.request;
            try {
                let result = await login.forget(this.database, body, {
                    ...this.options,
                    origin: ctx.request.headers.origin || ''
                });

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        this.router.put('/reset-password/:reset_token', async (ctx: TContext) => {
            const { reset_token } = ctx.params;
            const { body } = ctx.request;
            try {
                let result = await login.resetPassword(this.database, reset_token, body, this.options);

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
    LoginRouter
};
