import { JwtPayload } from "jsonwebtoken";

export interface ISignupBody extends JwtPayload {
    user_id: string; // uuid
    account: string;
}

export interface IBasicPassportRes {
    user_id: string; // 並非 Basic token 解出的信息，而是依據 client_id 去查找的
    client_id: string;
    client_secret: string;
}