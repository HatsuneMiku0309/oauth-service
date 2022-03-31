import { install } from 'source-map-support';
install();

import * as Koa from 'koa';
import { IConfig, IMiddleware } from './utils.interface';
import * as bodyParser from 'koa-bodyparser';
import { Passport } from './services/login/passport';

class Middleware implements IMiddleware {
    app: Koa<Koa.DefaultState, Koa.DefaultContext>;
    config: IConfig;
    constructor(app: Koa, config: IConfig) {
        this.app = app;
        this.config = config;
    }

    async registerMiddleware(): Promise<void> {
        const middles: any[] = [
            bodyParser({
                onerror: (err, ctx) => {
                    ctx.throw('body parse error', 422);
                },
                jsonLimit: '10mb',
                textLimit: '10mb',
                formLimit: '10mb',
                strict: true
            }),
            await Passport.passport(this.config.getJWTConfig())
        ];
        middles.forEach((middle) => {
            this.app.use(middle);
        });
    }
}

export {
    Middleware
};
