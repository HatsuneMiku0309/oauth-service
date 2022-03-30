import Router = require('koa-router');
import { TAnyObj } from '../utils.interface';

export interface IService {
    registerAPIs(): void;
}


export interface IApiObj {
    api: string;
    name: string;
    router: Router;
}

export interface IBaseRouter {
    api: string;
    name: string;
    router: Router;
    options: TAnyObj;
}

export interface IRouter extends IBaseRouter {
    registerAPIs(): void;
}