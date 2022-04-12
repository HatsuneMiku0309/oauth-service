import { install } from 'source-map-support';
install();

import * as Koa from 'koa';
import { IConfig, IMiddleware, IMysqlDatabase } from './utils.interface';
import * as bodyParser from 'koa-bodyparser';
import * as json from 'koa-json';
import { Passport } from './services/jwt/passport';

class Middleware implements IMiddleware {
    app: Koa<Koa.DefaultState, Koa.DefaultContext>;
    database: IMysqlDatabase;
    config: IConfig;
    constructor(app: Koa, database: IMysqlDatabase, config: IConfig) {
        this.app = app;
        this.database = database;
        this.config = config;
    }

    async registerMiddleware(): Promise<void> {
        Passport.config = this.config.getJWTConfig();
        const middles: any[] = [
            json(),
            bodyParser({
                onerror: (err, ctx) => {
                    ctx.throw('body parse error', 422);
                },
                jsonLimit: '10mb',
                textLimit: '10mb',
                formLimit: '10mb',
                strict: true
            }),
            await Passport.passport(this.database, this.config.getJWTConfig())
        ];
        middles.forEach((middle) => {
            this.app.use(middle);
        });
    }
}

export {
    Middleware
};
