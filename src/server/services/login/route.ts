import { install } from 'source-map-support';
install();

import { Next, ParameterizedContext } from 'koa';
import * as Router from 'koa-router';
import { IRouter } from '../utils.interface';
import { TAnyObj } from '../../utils.interface';
import { Login } from './login';
import { BaseRouter } from '../utils';

class LoginRouter extends BaseRouter implements IRouter {
    readonly api: string = '/login';
    readonly name: string = 'Login';
    readonly router: Router = new Router();
    readonly options: TAnyObj;
    constructor(options: TAnyObj = { }) {
        super();
        this.options = options;
        this.registerAPIs();
    }

    registerAPIs(): void {
        let login = Login.getInstance(this.options);
        this.router.get('/login', async (ctx: ParameterizedContext, next: Next) => {
            try {
                let result = await login.login();

                ctx.body = result;
            } catch (err: any) {
                ctx.throw(500, err.message);
            }
        });
    }
}

export {
    LoginRouter
};
