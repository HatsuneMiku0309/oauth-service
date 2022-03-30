import { install } from 'source-map-support';
install();

import * as Router from 'koa-router';
import { IRouter } from '../utils.interface';
import { TAnyObj } from '../../utils.interface';
import { OAuth } from './oauth';
import { BaseRouter } from '../utils';

class OAuthRouter extends BaseRouter implements IRouter {
    readonly api: string = '/ouath';
    readonly name: string = 'Oauth';
    readonly router: Router = new Router();
    readonly options: TAnyObj;
    constructor(options: TAnyObj = { }) {
        super();
        this.options = options;
    }

    private _getRootApi(api: string) {
        return `${this.api}${api}`;
    }

    registerAPIs(): void {
        let oauth = OAuth.getInstance(this.options);
        this.router.get(this._getRootApi('grant-token'), async (ctx, next) => {
            try {
                let result = oauth.grantToken();

                ctx.body = result;
            } catch (err: any) {
                ctx.throw(500, err.message);
            }
        });
    }
}

export {
    OAuthRouter
};
