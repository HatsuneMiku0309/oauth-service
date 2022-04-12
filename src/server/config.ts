require('dotenv').config();
import { install } from 'source-map-support';
install();

import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import { IConfig, IDatabaseConfig, IJWTConfig, IMainConfig, IServerConfig, TAnyObj, TExpiresType } from './utils.interface';
import { Algorithm } from 'jsonwebtoken';


const {
    HTTP_PORT = '3000',
    HTTPS_PORT = '3001',
    HTTPS = 'FALSE',
    KEY = fs.readFileSync(path.resolve(process.cwd(), 'config', 'key.pem')).toString(),
    CERT  = fs.readFileSync(path.resolve(process.cwd(), 'config', 'cert.pem')).toString(),
    EXPIRES_IN = 1,
    EXPIRES_TYPE = 'd',
    ALGORITHM = 'RS512',
    JWT_PRIVATE = fs.readFileSync(path.resolve(process.cwd(), 'config', 'jwtRS512.key')),
    JWT_PUBLIC = fs.readFileSync(path.resolve(process.cwd(), 'config', 'jwtRS512.key.pub'))
} = process.env;


class Config implements IConfig {
    readonly config: IMainConfig;
    constructor() {
        this.config = {
            optionConfig: { },
            jwtConfig: {
                PRIVATE_KEY: JWT_PRIVATE,
                PUBLIC_KEY: JWT_PUBLIC,
                EXPIRES_IN: Number(EXPIRES_IN),
                EXPIRES_TYPE: <TExpiresType> EXPIRES_TYPE,
                ALGORITHM: <Algorithm> ALGORITHM,
                UNLESS: /^\/api\/login|^\/api\/oauth\/access-token|^\/api\/oauth\/refresh-token|^\/api\/oauth\/verify-token/
            },
            databaseConfig: {
                host: 'localhost',
                port: 23306,
                database: 'test',
                user: 'root',
                password: 'hatsunemiku01',
                connectTimeout: 10000,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                debug: false,
                trace: true
            },
            serverConfig: {
                HTTPS: HTTPS.toUpperCase() === 'TRUE' ? true : false,
                HTTP_PORT: Number(HTTP_PORT),
                HTTPS_PORT: Number(HTTPS_PORT),
                HTTPS_CONFIG: {
                    KEY: KEY,
                    CERT: CERT
                }
            }
        };
    }
    getDatabaseConfig(): IDatabaseConfig {
        return this.config.databaseConfig;
    }
    getJWTConfig(): IJWTConfig {
        return this.config.jwtConfig;
    }

    getOptionConfig<T extends TAnyObj>(): TAnyObj {
        let config: T = <T> this.config.optionConfig;

        return config;
    }

    getServerConfig(): IServerConfig {
        return this.config.serverConfig;
    }

}

export {
    Config
};
