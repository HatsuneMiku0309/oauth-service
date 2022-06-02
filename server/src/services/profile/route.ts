import { install } from 'source-map-support';
install();

import * as Router from 'koa-router';
import { IRouter, TContext } from '../utils.interface';
import { IConfig, IMysqlDatabase, TAnyObj } from '../../utils.interface';
import { Profile } from './profile';
import { BaseRouter } from '../utils';

class ProfileRouter extends BaseRouter implements IRouter {
    readonly api: string = '/profile';
    readonly name: string = 'Profile';
    readonly router: Router = new Router();
    readonly options: TAnyObj & { config: IConfig };
    readonly database: IMysqlDatabase;
    constructor(database: IMysqlDatabase, options: TAnyObj & { config: IConfig }) {
        super();
        this.options = options;
        this.database = database;
        this.registerAPIs();
    }

    registerAPIs(): void {
        let profile = Profile.getInstance(this.options);
        let api = super._getRootApi().join('/');
        this.router.get(api, async (ctx: TContext) => {
            try {
                let result = await profile.getProfile(this.database, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });

        api = super._getRootApi(':id').join('/');
        this.router.put(api, async (ctx: TContext) => {
            const { params: { id }, request: { body } } = ctx;
            try {
                let result = await profile.update(ctx, this.database, id, body, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err: any) {
                throw err;
            }
        });


        api = super._getRootApi(['oauth_application_user']).join('/');
        this.router.get(api, async (ctx: TContext) => {
            try {
                let result = await profile.userApps(this.database, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });

        api = super._getRootApi(['oauth_application_user', ':id']).join('/');
        this.router.delete(api, async (ctx: TContext) => {
            const { id } = ctx.params;
            try {
                let result = await profile.userRemoveApps(this.database, id, ctx.state);

                ctx.body = {
                    data: result
                };
            } catch (err) {
                throw err;
            }
        });
    }
}

export {
    ProfileRouter
};
