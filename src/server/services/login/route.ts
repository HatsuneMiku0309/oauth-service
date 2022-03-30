import { install } from 'source-map-support';
install();

import * as Router from 'koa-router';
import { IRouter } from '../utils.interface';
import { TAnyObj } from '../../utils.interface';
import { Login } from './login';

class LoginRouter implements IRouter {
    readonly api: string = '/login';
    readonly name: string = 'Login';
    readonly router: Router = new Router();
    readonly options: TAnyObj;
    constructor(options: TAnyObj = { }) {
        this.options = options;
    }

    registerAPIs(): void {
        let login = Login.getInstance(this.options);
        this.router.get('/login', async (ctx, next) => {
            try {
                let result = login.login();

                ctx.body = result;
            } catch (err: any) {
                ctx.throw(500, err.message);
            }
        });
    }

    get apiObj() {
        return {
            api: this.api,
            name: this.name,
            router: this.router
        };
    }
}

export {
    LoginRouter
};
