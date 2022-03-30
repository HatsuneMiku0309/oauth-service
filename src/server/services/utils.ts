import { install } from 'source-map-support';
install();

import { TAnyObj } from '../utils.interface';
import { IApiObj, IBaseRouter } from './utils.interface';
import * as Router from 'koa-router';


abstract class BaseRouter implements IBaseRouter {
    abstract api: string;
    abstract name: string;
    abstract router: Router;
    abstract options: TAnyObj;
    constructor() { }

    protected get apiObj(): IApiObj {
        return {
            api: this.api,
            name: this.name,
            router: this.router
        };
    }

    abstract registerAPIs(): void;

}

export {
    BaseRouter
};
