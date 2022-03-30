import { TAnyObj } from "../../utils.interface";

export interface IOAuth {
    options: TAnyObj;
    grantToken(): Promise<any>;
    accessToken(): Promise<any>;
}
