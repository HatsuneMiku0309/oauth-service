import { JwtPayload } from 'jsonwebtoken';
import { Next, ParameterizedContext } from 'koa';
import * as Router from 'koa-router';
import { IConfig, IMysqlDatabase, TAnyObj } from '../utils.interface';
import { ISignupBody } from './jwt/passport.interface';

export interface IJWTData extends JwtPayload, ISignupBody {
}

export interface IJWTCotext {
    user: IJWTData;
    jwt: string;
}

export type TContext = ParameterizedContext<IJWTCotext, Router.IRouterParamContext<any, {}>, any>;
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
    readonly api: string;
    readonly name: string;
    readonly router: Router;
    readonly options: TAnyObj & { config: IConfig };
}

export interface IRouter extends IBaseRouter {
    readonly database: IMysqlDatabase;
    registerAPIs(): void;
}