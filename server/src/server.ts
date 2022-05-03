import { install } from 'source-map-support';
install();

import * as http from 'http';
import * as https from 'https';
import * as Koa from 'koa';
import { IServer, IServerConfig } from './utils.interface';

class Server implements IServer {
    readonly app: Koa;
    readonly config: IServerConfig;
    httpServer!: http.Server;
    httpsServer!: https.Server;
    constructor(app: Koa, config: IServerConfig) {
        this.app = app;
        this.config = config;
    }
    serveHTTP(config?: IServerConfig): void {
        const { HTTP_PORT } = config || { };
        this.httpServer = http.createServer(this.app.callback());
        let port = HTTP_PORT ? HTTP_PORT : this.config.HTTP_PORT;
        this.httpServer.listen(port, () => {
            console.log(`Server http port: ${port}`);
        });
    }

    serveHTTPS(config?: IServerConfig): void {
        const { HTTPS_PORT } = config || { };
        const { KEY = '', CERT = '' } = this.config.HTTPS_CONFIG;
        this.httpsServer = https.createServer({
            key: KEY,
            cert: CERT
        }, this.app.callback());
        let port = HTTPS_PORT ? HTTPS_PORT : this.config.HTTPS_PORT;
        this.httpsServer.listen(port, () => {
            console.log(`Server http port: ${port}`);
        });
    }

    serve(isHttps?: boolean): void {
        let _https = isHttps || this.config.HTTPS;
        this.serveHTTP(this.config);
        _https && this.serveHTTPS(this.config);
    }
}

export {
    Server
};
