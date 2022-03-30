import * as http from 'http';
import * as Koa from 'koa';

export type TAnyObj = { [key: string]: any };

export interface IMainConfig {
    optionConfig: TAnyObj;
    serverConfig: IServerConfig;
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
    registerMiddleware(): void;
}