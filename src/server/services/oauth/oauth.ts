import { install } from 'source-map-support';
import { TAnyObj } from '../../utils.interface';
import { IOAuth } from './oauth.interface';
install();

class OAuth implements IOAuth {
    static instance: IOAuth;
    options: TAnyObj;
    private constructor(options: TAnyObj = { }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj = { }): IOAuth {
        if (!OAuth.instance) {
            OAuth.instance = new OAuth(options);
        }

        return OAuth.instance;
    }

    grantToken(): Promise<any> {
        throw new Error('Method not implemented.');
    }

    accessToken(): Promise<any> {
        throw new Error('Method not implemented.');
    }

}

export {
    OAuth
};
