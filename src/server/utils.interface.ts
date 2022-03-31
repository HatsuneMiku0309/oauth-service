import * as http from 'http';
import { Algorithm, Secret } from 'jsonwebtoken';
import * as Koa from 'koa';

export type TAnyObj = { [key: string]: any };

export interface IMainConfig {
    optionConfig: TAnyObj;
    serverConfig: IServerConfig;
    jwtConfig: IJWTConfig;
}

export type TExpiresType = 'd' | ' day' | 'h' | ' hrs' | 's' | 'y';
export interface IJWTConfig {
    KEY: Secret;
    EXPIRES_IN: number;
    EXPIRES_TYPE: TExpiresType;
    ALGORITHM: Algorithm;
    UNLESS: RegExp
}

export interface IServerConfig {
    HTTP_PORT: number;
    HTTPS_PORT: number;
    HTTPS: boolean;
    HTTPS_CONFIG: {
        KEY: string;
        CERT: string;
    }
}

export interface IConfig {
    config: IMainConfig;
    getServerConfig(): IServerConfig;
    getOptionConfig<T extends TAnyObj>(): TAnyObj;    
    getJWTConfig(): IJWTConfig;
}

export interface IServer {
    app: Koa;
    config: IServerConfig;
    httpServer: http.Server;
    serveHTTP(options: IServerConfig): void;
    serveHTTPS(options: IServerConfig): void;
    serve(options: IServerConfig): void;
}

export interface IMiddleware {
    app: Koa;
    config: IConfig;
    registerMiddleware(): void;
}