import { install } from 'source-map-support';
install();

import { IConfig, TAnyObj } from '../utils.interface';
import { IApiObj, IBaseRouter } from './utils.interface';
import * as Router from 'koa-router';
import * as _ from 'lodash';


abstract class BaseRouter implements IBaseRouter {
    abstract api: string;
    abstract name: string;
    abstract router: Router;
    abstract options: TAnyObj & { config: IConfig };
    constructor() { }

    protected _getRootApi(api?: string | string[]): string[] {
        let result = [this.api];
        if (!!api && _.isString(api)) {
            result.push(api);
        } else if (!!api) {
            result.push(...api);
        }


        return result;
    }

    protected get apiObj(): IApiObj {
        return {
            api: this.api,
            name: this.name,
            router: this.router
        };
    }
}

export {
    BaseRouter
};
