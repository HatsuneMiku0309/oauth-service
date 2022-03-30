import { install } from 'source-map-support';
install();

import * as Koa from 'koa';
import { IService } from './utils.interface';
import { TAnyObj } from '../utils.interface';

class Service implements IService {
    private _app: Koa;
    private _options: TAnyObj;
    constructor(app: Koa, options: TAnyObj = { }) {
        this._app = app;
        this._options = options;
        this.registerAPI();
    }

    registerAPI(): void {
        this._app.use(() => { });
    }
}

export {
    Service
};
