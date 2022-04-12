import { JwtPayload } from "jsonwebtoken";

export interface ISignupBody extends JwtPayload {
    user_id: string; // uuid
    account: string;
}

export interface IBasicPassportRes {
    user_id: string;
    client_id: string;
    client_secret: string;
}