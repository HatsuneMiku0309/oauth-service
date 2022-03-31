import { install } from 'source-map-support';
import { TAnyObj } from '../../utils.interface';
install();

import { ILogin } from './login.interface';
import { Passport } from './passport';

class Login implements ILogin {
    private static instance: ILogin;
    options: TAnyObj;
    private constructor(options: TAnyObj = { }) {
        this.options = options;
    }

    static getInstance(options: TAnyObj = { }): ILogin {
        if (!Login.instance) {
            Login.instance = new Login(options);
        }

        return Login.instance;
    }

    async login(): Promise<any> {
        return {
            tt: 3211
        };
    }
}

export {
    Login
};
