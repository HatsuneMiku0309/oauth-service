require('dotenv').config();
import { install } from 'source-map-support';
install();

import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import { IConfig, IJWTConfig, IMainConfig, IServerConfig, TAnyObj, TExpiresType } from './utils.interface';
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
    JWT_KEY = fs.readFileSync(path.resolve(process.cwd(), 'config', 'jwt.key')).toString()
} = process.env;


class Config implements IConfig {
    readonly config: IMainConfig;
    constructor() {
        this.config = {
            optionConfig: { },
            jwtConfig: {
                KEY: JWT_KEY,
                EXPIRES_IN: Number(EXPIRES_IN),
                EXPIRES_TYPE: <TExpiresType> EXPIRES_TYPE,
                ALGORITHM: <Algorithm> ALGORITHM,
                UNLESS: /^\/api\/login/
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
