//// @ts-nocheck 
// when on the top of the file,it will not check the below.
import { install } from 'source-map-support';
install();

import { app } from './koa-server';
import { Server } from './server';
import { Config } from './config';
import { Service } from './services/index';
import { Middleware } from './middleware';

(async () => {
    // let _app = app;
    let config = new Config();
    let middleware = new Middleware(app, config);
    await middleware.registerMiddleware();
    // @ts-ignore
    let services = new Service(app);
    let server = new Server(app, config.getServerConfig());
    server.serve();
})();
