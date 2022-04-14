import { install } from 'source-map-support';
install();

import * as Koa from 'koa';
import * as Router from 'koa-router';
import { IService } from './utils.interface';
import { IConfig, IMysqlDatabase, TAnyObj } from '../utils.interface';

import { LoginRouter } from './login/route';
import { OauthRouter } from './oauth/route';
import { OauthApplicationRouter } from './oauth-app/route';
import { ScopeRouter } from './scope/route';

class Service implements IService {
    private _app: Koa;
    private _router: Router = new Router();
    private _database: IMysqlDatabase;
    private _options: TAnyObj;
    constructor(app: Koa, database: IMysqlDatabase, options: TAnyObj & { config?: IConfig } = { }) {
        this._app = app;
        this._database = database;
        this._options = options;
        this.registerAPIs();
    }

    registerAPIs(): void {
        let routers = [
            new LoginRouter(this._database, this._options),
            new OauthRouter(this._database, this._options),
            new OauthApplicationRouter(this._database, this._options),
            new ScopeRouter(this._database, this._options)
        ];
        this._router.get('/api', (ctx) => { ctx.body = { aa: 123 }; });
        routers.forEach((router) => {
            this._router.use('/api', router.router.routes(), router.router.allowedMethods());
        });

        this._app.use(this._router.routes()).use(this._router.allowedMethods());
        // let apis = this._router.stack.map((d: any) => { return { methods: d.methods, path: d.path }; });
        // console.log('test');
    }
}

export {
    Service
};
