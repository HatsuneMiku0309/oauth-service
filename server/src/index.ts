//// @ts-nocheck 
// when on the top of the file,it will not check the below.
import { install } from 'source-map-support';
install();

import { app } from './koa-server';
import { Server } from './server';
import { Config } from './config';
import { Service } from './services/index';
import { Middleware } from './middleware';
import { MysqlDatabase } from './mysql-db';

(async () => {
    // let _app = app;
    let config = new Config();
    let database = new MysqlDatabase(config.getDatabaseConfig());
    let middleware = new Middleware(app, database, config);
    await middleware.registerMiddleware();
    // @ts-ignore
    let services = new Service(app, database, { config: config });
    let server = new Server(app, config.getServerConfig());
    server.serve();
})();
