import { Connection } from "mysql2/promise";
import { IConfig, IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IJWTCotext, TContext } from "../utils.interface";

export interface ILoginBody {
    account: string;
    password: string;
}

export interface IRegistBody {
    empNo?: string;
    account: string;
    password: string; // base64
    email: string;
    phone?: string;
}

export interface ILoginRes {
    ID: string;
    ACCOUNT: string;
    EMP_NO: string;
    EMAIL: string;
    PHONE: string;
    SOURCE: TSOURCE;
    USER_TYPE: TUSER_TYPE;
}

export interface IForgetBody {
    account: string;
}

export interface IResetPasswordBody {
    password: string;
}

export interface ILogin {
    options: TAnyObj & { config: IConfig };
    login(ctx: TContext, database: IMysqlDatabase, options?: TAnyObj): Promise<ILoginRes>;
    tokenLogin(database: IMysqlDatabase, options: TAnyObj & IJWTCotext): Promise<ILoginRes>; 
    regist(database: IMysqlDatabase, body: IRegistBody, options?: TAnyObj): Promise<{ ID: string }>;
    dbRegist(db: Connection, body: IRegistBody, options?: TAnyObj): Promise<{ ID: string }>;
    forget(database: IMysqlDatabase, body: IForgetBody, options: TAnyObj & { origin: string }): Promise<{ MESSAGE: string }>;
    dbForget(db: Connection, body: IForgetBody, options: TAnyObj & { origin: string }): Promise<{ MESSAGE: string }>;
    resetPassword(database: IMysqlDatabase, resetToken: string, body: IResetPasswordBody, options?: TAnyObj): Promise<{ ID: string }>;
    dbResetPassword(db: Connection, resetToken: string, body: IResetPasswordBody, options?: TAnyObj): Promise<{ ID: string }>;
}

export type TSOURCE = 'SELF' | 'COMPAL';
export type TUSER_TYPE = 'VIEWER' | 'DEVELOPER' | 'ADMIN' | 'ROOT';

export interface IUserDAO {
    ID: string; // uuid
    SOURCE?: TSOURCE; // varchar(100)
    USER_TYPE?: TUSER_TYPE; // varchar(100) default: 'VIEWER'
    EMP_NO?: string; // varchar(100) default: ''
    ACCOUNT: string; // varchar(12)
    PASSWORD: string; //varchar(100)
    EMAIL: string; // varchar(255)
    PHONE?: string; // varchar(100)
    TOKEN: string; // varchar(1000)
    RESET_TOKEN?: string; // varchar(100)
    CREATE_TIME: Date; // Datetime
    CREATE_BY: string; // varchar(100)
    UPDATE_BY: string; // varchar(100)
    RESET_TIME?: Date; // Datetime
    RESET_TIMES: number; // u_int
    BLACK: 'T' | 'F'; // varchar(10)
}

export interface ILdapUserDao {
    auth: boolean;
    depart_code: string;
    depart_name: string;
    emp_name: string;
    emp_no: string;
    email: string;
    phone: string;
}