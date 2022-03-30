//// @ts-nocheck 
// when on the top of the file,it will not check the below.
import { install } from 'source-map-support';
install();

import { app } from './koa-server';
import { Server } from './server';
import { Config } from './config';
import { Service } from './services/index';

(async () => {
    let config = new Config();
    // @ts-ignore
    let services = new Service(app);
    let server = new Server(app, config.getServerConfig());
    server.serve();
})();
