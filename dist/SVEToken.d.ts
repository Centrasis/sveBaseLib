import { SVEAccount } from './SVEAccount';
import { SVEGroup } from './SVEGroup';
export declare enum TokenType {
    RessourceToken = 1,
    DeviceToken = 2
}
export interface TokenUserLoginInfo {
    name: string;
    token: string;
}
export interface Token {
    user: String;
    token: String;
    type: TokenType;
    time: Date;
    ressource: String;
}
export declare class SVEToken {
    static register(type: TokenType, target: SVEGroup | SVEAccount): Promise<string>;
}
//# sourceMappingURL=SVEToken.d.ts.map