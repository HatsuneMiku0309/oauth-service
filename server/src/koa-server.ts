import { install } from 'source-map-support';
install();

import * as Koa from 'koa';

const app = new Koa();

export {
    app
};
