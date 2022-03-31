import * as jwt from 'jsonwebtoken';
import { TAnyObj } from '../../utils.interface';

export interface ISignupBody {
    account: string;
    password: string;
}

export interface IPassport {
    signup(body: ISignupBody, privateKey: string, options: TAnyObj & jwt.SignOptions): Promise<any>;
    verify(): Promise<any>;
    decode(): Promise<any>;
}