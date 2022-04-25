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

// { "web" | "installed" : { "client_id": "449095306728-hlj32gotq6n5cjpslll0hvohjlnf2iv3.apps.googleusercontent.com", "project_id": "quickstart-1594032425347", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs", "client_secret": "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", "redirect_uris": ["https://localhost/callback"], "javascript_origins": ["https://localhost"] } }


export interface IError extends Error {
    state?: number | string;
    datas?: any[];
    data?: any;
}

export interface IMainConfig {
    optionConfig: TAnyObj;
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
    UNLESS: string[]
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
    getOptionConfig<T extends TAnyObj>(): TAnyObj;    
    getJWTConfig(): IJWTConfig;
    getDatabaseConfig(): IDatabaseConfig;
}

export interface IServer {
    readonly app: Koa;
    readonly config: IServerConfig;
    httpServer: http.Server;
    httpsServer: https.Server;
    serveHTTP(options: IServerConfig): void;
    serveHTTPS(options: IServerConfig): void;
    serve(options: IServerConfig): void;
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
