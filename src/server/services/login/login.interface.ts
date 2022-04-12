import { IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { TContext } from "../utils.interface";

export interface ILoginBody {
    account: string;
    password: string;
}

export interface IRegistBody {
    account: string;
    password: string; // base64
    email: string;
    phone?: string;
}

export interface ILogin {
    options: TAnyObj;
    login(ctx: TContext, database: IMysqlDatabase, options?: TAnyObj): Promise<IUserDAO[]>;
    regist(database: IMysqlDatabase, body: IRegistBody, options?: TAnyObj): Promise<{ ACCOUNT: string }>;
}

export interface IUserDAO {
    ID: string; // uuid
    ACCOUNT: string; // varchar(12)
    PASSWORD: string; //varchar(100)
    EMAIL: string; // varchar(255)
    PHONE?: string; // varchar(100)
    CREATE_TIME: Date; // Datetime
    CREATE_BY: string; // varchar(100)
}