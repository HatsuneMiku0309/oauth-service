import { install } from 'source-map-support';
install();

import * as Koa from 'koa';
import * as Router from 'koa-router';
import { IService } from './utils.interface';
import { TAnyObj } from '../utils.interface';

import { LoginRouter } from './login/route';

class Service implements IService {
    private _app: Koa;
    private _router: Router = new Router();
    private _options: TAnyObj;
    constructor(app: Koa, options: TAnyObj = { }) {
        this._app = app;
        this._options = options;
        this.registerAPIs();
    }

    registerAPIs(): void {
        let routers = [
            new LoginRouter(this._options)
        ];
        routers.forEach((router) => {
            this._router.use('/api', router.router.routes(), router.router.allowedMethods());
        });

        this._app.use(this._router.routes()).use(this._router.allowedMethods());
    }
}

export {
    Service
};
