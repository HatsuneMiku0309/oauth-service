import { Connection } from "mysql2/promise";
import { IConfig, IMysqlDatabase, TAnyObj } from "../../utils.interface";
import { IAPIs } from "../scope/scope.interface";
import { IJWTCotext } from "../utils.interface";

export interface IListQuery {
    q: string;
    offset?: number;
    count?: number;
}

export interface IListData {
    ID: string;
    NAME: string;
    USER_ID: string;
    USER_ACCOUNT: string;
    USER_EMAIL: string;
    USER_PHONE: string;
    HOMEPAGE_URL: string;
    APPLICATION_DESCRIPTION?: string;
}

export interface IListRes {
    datas: IListData[],
    offset: number;
    count: number;
    totalPage: number;
}

export interface IDetailRes {
    OAUTH_SCOPE_ID: string;
    SCOPE_ID: string;
    SCOPE_SYSTEM: string;
    SCOPE_NAME: string;
    SCOPE_DESCRIPTIOIN: string;
    SCOPE_APIS: IAPIs[];
}

export interface IReviewBody {
    description: string;
}

export interface IReviewRes {
    OAUTH_APPLICATION_ID: string
}

export interface IAuthorizationApp {
    options: TAnyObj & { config: IConfig };
    list(database: IMysqlDatabase, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    dbList(db: Connection, query: IListQuery, options: TAnyObj & IJWTCotext): Promise<IListRes>;
    detail(database: IMysqlDatabase, oa_id: string, options: TAnyObj & IJWTCotext): Promise<IDetailRes[]>;
    dbDetail(db: Connection, oa_id: string, options: TAnyObj & IJWTCotext): Promise<IDetailRes[]>;

    // reject or approve mail to app's user
    // reject will remove oauth-scope, should re-register.
    rejectApp(database: IMysqlDatabase, oa_id: string, body: IReviewBody, options: TAnyObj & IJWTCotext): Promise<IReviewRes>;
    dbRejectApp(db: Connection, oa_id: string, body: IReviewBody, options: TAnyObj & IJWTCotext): Promise<IReviewRes>;
    approveApp(database: IMysqlDatabase, oa_id: string, body: IReviewBody, options: TAnyObj & IJWTCotext): Promise<IReviewRes>;
    dbApproveApp(db: Connection, oa_id: string, body: IReviewBody, options: TAnyObj & IJWTCotext): Promise<IReviewRes>;
}
