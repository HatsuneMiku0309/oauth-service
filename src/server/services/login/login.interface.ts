import { TAnyObj } from "../../utils.interface";

export interface ILogin {
    options: TAnyObj;
    login(): Promise<any>;
}