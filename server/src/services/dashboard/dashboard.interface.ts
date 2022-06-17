import { Connection } from "mysql2/promise";
import { IConfig, IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { TResponseType, TTokenType } from "../oauth/oauth.interface";
import { IJWTCotext } from "../utils.interface";

export type TDateType = 'min' | 'hour' | '6hour' | '12hour' | 'day';

export interface IGetUserdRateQuery {
    date_type: TDateType;
    count: number;
}

export interface IGetApplicationUsersRes {
    APPLICATION: string;
    USER_COUNT: number;
};

export interface IGetUsedRateRes {
    DATE_TIME: Date;
    USED_COUNT: number;
};

export interface IGetApplicationUserdRateQuery {
    date_type: TDateType;
}

export interface IApplicationUsedRate {
    NAME: string;
    USED_COUNT: number;
}

export interface IGetApplicationUsedRateRes extends IGetUsedRateRes {
    APPLICATION: IApplicationUsedRate[]
}


export interface IDashboard {
    options: TAnyObj & { config: IConfig };
    getUsedRate(database: IMysqlDatabase, query: IGetUserdRateQuery, options: TAnyObj & IJWTCotext): Promise<IGetUsedRateRes[]>;
    dbGetUsedRate(db: Connection, query: IGetUserdRateQuery, options: TAnyObj & IJWTCotext): Promise<IGetUsedRateRes[]>;
    getApplicationUesdRate(database: IMysqlDatabase, query: IGetApplicationUserdRateQuery, options: TAnyObj & IJWTCotext): Promise<IGetApplicationUsedRateRes[]>;
    dbGetApplicationUesdRate(db: Connection, query: IGetApplicationUserdRateQuery, options: TAnyObj & IJWTCotext): Promise<IGetApplicationUsedRateRes[]>;
    getApplicationUsers(database: IMysqlDatabase, options: TAnyObj & IJWTCotext): Promise<IGetApplicationUsersRes[]>;
    dbGetApplicationUsers(db: Connection, options: TAnyObj & IJWTCotext): Promise<IGetApplicationUsersRes[]>;
}


// ---------- DAO -----------

export interface IOauthTokenUsedRateDao {
    ID: string;
    OAUTH_APPLICATION_USER_ID: string;
    OAUTH_APPLICATION_ID: string;
    GRANT_TYPE: TResponseType;
    TOKEN_TYPE: TTokenType;
    ACCESS_TOKEN: string;
    CREATE_TIME?: Date;
    CREATE_BY: string;
}
