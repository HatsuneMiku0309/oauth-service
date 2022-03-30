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
    serveHTTP(options: IServerConfig): void {
        const { HTTP_PORT } = options;
        this.httpServer = http.createServer(this.app.callback());
        let port = HTTP_PORT ? HTTP_PORT : this.config.HTTP_PORT;
        this.httpServer.listen(port, () => {
            console.log(`Server http port: ${port}`);
        });
    }

    serveHTTPS(options: IServerConfig): void {
        const { HTTPS_PORT } = options;
        const { KEY = '', CERT = '' } = this.config.HTTPS_CONFIG;
        this.httpsServer = https.createServer({
            key: KEY,
            cert: CERT
        }, this.app.callback());
        let port = HTTPS_PORT ? HTTPS_PORT : this.config.HTTPS_PORT;
        this.httpServer.listen(port, () => {
            console.log(`Server http port: ${port}`);
        });
    }

    serve(options?: IServerConfig): void {
        const { HTTPS = false } = options!;
        this.serveHTTP(options!);
        HTTPS && this.serveHTTPS(options!);
    }
}

export {
    Server
};
