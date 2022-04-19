import { install } from 'source-map-support';
install();

import * as Koa from 'koa';
import { IConfig, IError, IMiddleware, IMysqlDatabase } from './utils.interface';
import * as bodyParser from 'koa-bodyparser';
import * as json from 'koa-json';
import { Passport } from './services/jwt/passport';
import * as cors from '@koa/cors';
import { TContext } from './services/utils.interface';

class Middleware implements IMiddleware {
    app: Koa<Koa.DefaultState, Koa.DefaultContext>;
    database: IMysqlDatabase;
    config: IConfig;
    constructor(app: Koa, database: IMysqlDatabase, config: IConfig) {
        this.app = app;
        this.database = database;
        this.config = config;
    }

    private readonly _errorHandle = async (
        ctx: TContext,
        next: () => Promise<any>) => {
        try {
            return await next();
        } catch (err: any) {
            // if (this.config.DEBUG) {
            //     console.error(err);
            // }
            // // 進入的pid
            // console.log(`
            //     ${SHELL_GOREGROUND_COLOR.ligthYellow}[RETURN::PID] ${process.pid}${SHELL_RESET.resetAllAttributes}
            // `.trim());
            // // 返回時間
            // this._endDateTime = new Date();
            // console.log(`${SHELL_GOREGROUND_COLOR.lightCyan}[RETURN] ${dayjs(this._endDateTime).format('YYYY-MM-DD HH:mm:ss')}${SHELL_RESET.resetAllAttributes}`);

            // // 這部份應該通過內部code轉換http code以及相關訊息。
            // // ex. input: 9487, output: httpCode = 404 { code: 9487, errMsg: '找不到', info: { } }
            // // ex. input: 5487, output: httpCode = 500 { code: 5487, errMsg: '錯誤囉', info: { } }
            // // ex. input: ?, output:
            let _err: IError = err;

            // 如果沒有serverCode, 則跟隨httpCode
            _err.state = _err.state !== undefined ? _err.state : 500;

            // let { httpCode, body } = this._StatusCode.sendError(_err);

            // response
            ctx.status = Number(_err.state);
            ctx.body = {
                errMsg: err.message,
                extErrMsg: undefined,
                info: err.data || { }
            };
        }
    }

    async registerMiddleware(): Promise<void> {
        Passport.config = this.config.getJWTConfig();
        const middles: any[] = [
            this._errorHandle,
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
            cors(),
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
