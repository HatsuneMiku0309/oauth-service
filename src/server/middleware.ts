import { install } from 'source-map-support';
install();

import * as Koa from 'koa';
import { IMiddleware } from './utils.interface';

import * as bodyParser from 'koa-bodyparser';

class Middleware implements IMiddleware {
    app: Koa<Koa.DefaultState, Koa.DefaultContext>;
    constructor(app: Koa) {
        this.app = app;
    }

    registerMiddleware(): void {
        const middles: any[] = [
            bodyParser({
                onerror: (err, ctx) => {
                    ctx.throw('body parse error', 422);
                },
                jsonLimit: '10mb',
                textLimit: '10mb',
                formLimit: '10mb',
                strict: true
            })
        ];
        middles.forEach((middle) => {
            this.app.use(middle);
        });
    }
}

export {
    Middleware
};
