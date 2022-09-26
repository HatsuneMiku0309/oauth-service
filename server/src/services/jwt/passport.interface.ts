import { JwtPayload } from "jsonwebtoken";
import { TSOURCE, TUSER_TYPE } from "../login/login.interface";
import { IOauthApplicationDao } from "../oauth-app/oauth-app.interface";

export interface ISignupBody extends JwtPayload {
    user_id: string; // uuid
    account: string;
    source: TSOURCE;
    user_type: TUSER_TYPE;
}

export interface IBasicPassportRes extends IOauthApplicationDao {
    user_id: string; // 並非 Basic token 解出的信息，而是依據 client_id 去查找的
    client_id: string;
    client_secret: string;
}
