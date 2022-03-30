require('dotenv').config();
import { install } from 'source-map-support';
install();

import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import { IConfig, IMainConfig, IServerConfig, TAnyObj } from './utils.interface';


const {
    HTTP_PORT = '3000',
    HTTPS_PORT = '3001',
    HTTPS = 'FALSE',
    KEY = fs.readFileSync(path.resolve(process.cwd(), 'config', 'key.pem')).toString(),
    CERT  = fs.readFileSync(path.resolve(process.cwd(), 'config', 'cert.pem')).toString()
} = process.env;


class Config implements IConfig {
    readonly config: IMainConfig;
    constructor() {
        this.config = {
            optionConfig: { },
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
