require('dotenv').config();
import { install } from 'source-map-support';
install();

import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import { IConfig, IDatabaseConfig, IJWTConfig, IMainConfig, IOptionConfig, IServerConfig, TExpiresType } from './utils.interface';
import { Algorithm } from 'jsonwebtoken';


const {
    HTTP_PORT = '3000',
    HTTPS_PORT = '3001',
    HTTPS = 'FALSE',
    KEY = fs.readFileSync(path.resolve(process.cwd(), 'config', 'server.key')).toString(),
    CERT  = fs.readFileSync(path.resolve(process.cwd(), 'config', 'server.crt')).toString(),
    EXPIRES_IN = 1,
    EXPIRES_TYPE = 'd',
    ALGORITHM = 'RS512',
    JWT_PRIVATE = fs.readFileSync(path.resolve(process.cwd(), 'config', 'jwtRS512.key')),
    JWT_PUBLIC = fs.readFileSync(path.resolve(process.cwd(), 'config', 'jwtRS512.key.pub')),
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_DATABASE,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_CONNECT_TIMEOUT,
    MYSQL_WAIT_FOR_CONNECTIONS,
    MYSQL_CONNECTION_LIMIT,
    MYSQL_QUEUE_LIMIT,
    MYSQL_DEBUE,
    MYSQL_TRACE
} = process.env;


class Config implements IConfig {
    readonly config: IMainConfig;
    constructor() {
        this.config = {
            optionConfig: {
                EMAIL_IP: 'http://10.129.137.37',
                EMAIL_PORT: '9999',
                EMAIL_CALLER_NOTIFY: ['cosmo_dai@compal.com'],
                EMAIL_SYSTEM: 'AC'
            },
            jwtConfig: {
                PRIVATE_KEY: JWT_PRIVATE,
                PUBLIC_KEY: JWT_PUBLIC,
                EXPIRES_IN: Number(EXPIRES_IN),
                EXPIRES_TYPE: <TExpiresType> EXPIRES_TYPE,
                ALGORITHM: <Algorithm> ALGORITHM,
                UNLESS: [
                    '^\/api\/login$',
                    '^\/api\/register$',
                    '^\/api\/oauth\/access-token$',
                    '^\/api\/oauth\/refresh-token$',
                    '^\/api\/oauth\/verify-token$'
                ],
                VIEWER_WHITE_LIST: [
                    '^\/api\/oauth\/grant-code-token$'
                ]
            },
            databaseConfig: {
                host: MYSQL_HOST,
                port: Number(MYSQL_PORT),
                database: MYSQL_DATABASE,
                user: MYSQL_USER,
                password: MYSQL_PASSWORD,
                connectTimeout: Number(MYSQL_CONNECT_TIMEOUT),
                waitForConnections: MYSQL_WAIT_FOR_CONNECTIONS === 'TRUE' ? true : false,
                connectionLimit: Number(MYSQL_CONNECTION_LIMIT),
                queueLimit: Number(MYSQL_QUEUE_LIMIT),
                debug: MYSQL_DEBUE === 'TRUE' ? true : false,
                trace: MYSQL_TRACE === 'TRUE' ? true : false,
                typeCast: (field: any, next: () => void): any => {
                    // change TINYINT to boolean
                    if (field.type === 'TINY' && field.length === 1) {
                        return (field.string() === '1');
                    }

                    return next();
                }
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

    getOptionConfig<T extends IOptionConfig>(): IOptionConfig {
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
