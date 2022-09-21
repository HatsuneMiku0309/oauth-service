import * as http from 'http';
import * as https from 'https';
import { Algorithm, Secret } from 'jsonwebtoken';
import * as Koa from 'koa';
import * as mysql2 from 'mysql2/promise';

export type TAnyObj = { [key: string]: any };

export interface IBasicConfig {
    web: {
        client_id: string;
        project_id: string;

        // 為何區分者兩個，啥意思
        auth_uri: string;
        token_uri: string;

        auth_provider_x509_cert_url: string;

        client_secret: string;
        redirect_uris: string[];
        javascript_origins: string[];
    }
}

export interface IError extends Error {
    state?: number | string;
    datas?: any[];
    data?: any;
}

export interface IOptionConfig extends TAnyObj {
    EMAIL_IP: string;
    EMAIL_PORT: string | number;
    EMAIL_CALLER_NOTIFY: string[];
    EMAIL_SYSTEM: string;
    RESET_MAX_LIMIT: number;
    REST_TOKEN_LIMIT_TIME: number;
}

export interface IMainConfig {
    optionConfig: IOptionConfig;
    serverConfig: IServerConfig;
    jwtConfig: IJWTConfig;
    databaseConfig: IDatabaseConfig;
}

export type TExpiresType = 'd' | ' day' | 'h' | ' hrs' | 's' | 'y';
export interface IJWTConfig {
    PRIVATE_KEY: Secret;
    PUBLIC_KEY: Secret;
    EXPIRES_IN: number;
    EXPIRES_TYPE: TExpiresType;
    ALGORITHM: Algorithm;
    UNLESS: string[];
    VIEWER_WHITE_LIST: string[];
}

export interface IDatabaseConfig extends mysql2.ConnectionOptions, mysql2.PoolOptions  {
    
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
    readonly config: IMainConfig;
    getServerConfig(): IServerConfig;
    getOptionConfig<T extends IOptionConfig>(): IOptionConfig;    
    getJWTConfig(): IJWTConfig;
    getDatabaseConfig(): IDatabaseConfig;
}

export interface IServer {
    readonly app: Koa;
    readonly config: IServerConfig;
    httpServer: http.Server;
    httpsServer: https.Server;
    serveHTTP(config: IServerConfig): void;
    serveHTTPS(config: IServerConfig): void;
    serve(isHttps?: boolean): void;
}

export interface IMiddleware {
    app: Koa;
    database: IMysqlDatabase;
    config: IConfig;
    registerMiddleware(): void;
}

export interface IEndReturn {
    state: number;
    message: string;
}

export interface IMysqlDatabase {
    readonly config: IDatabaseConfig;

    getConnection(): Promise<mysql2.Connection>;
    getPool(): Promise<mysql2.Pool>;
    getPoolConnection(pool: mysql2.Pool): Promise<mysql2.PoolConnection>;
    end(conn: mysql2.Connection, force?: boolean): Promise<IEndReturn>;
    end(pool: mysql2.Pool): Promise<IEndReturn>;
    end(poolConn: mysql2.PoolConnection, force?: boolean): Promise<IEndReturn>;
    end(connection: mysql2.Connection | mysql2.Pool | mysql2.PoolConnection): Promise<any>;
    release(poolConn: mysql2.PoolConnection, force?: boolean): Promise<IEndReturn>;
}
