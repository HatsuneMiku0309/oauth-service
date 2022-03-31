import { DefaultContext, DefaultState, Next, ParameterizedContext } from 'koa';
import Router = require('koa-router');
import { TAnyObj } from '../utils.interface';

// ParameterizedContext
// Koa.ParameterizedContext<Koa.DefaultState, Koa.DefaultContext, any>
export type TContext = ParameterizedContext<DefaultState, DefaultContext, any>;
export type TRouterMiddle = (ctx: TContext, next?: Next) => any | Promise<any>;

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