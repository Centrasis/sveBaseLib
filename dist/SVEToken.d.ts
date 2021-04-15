import { SVEAccount } from './SVEAccount';
import { SVEGroup } from './SVEGroup';
export declare enum TokenType {
    RessourceToken = 1,
    DeviceToken = 2
}
export interface TokenUserLoginInfo {
    user?: number;
    token: string;
}
export interface TokenInfo {
    name: String;
    time: Date;
    type: TokenType;
    target: Number;
    deviceAgent: String;
}
export interface Token extends TokenInfo {
    token: string;
}
export declare class SVEToken {
    static register(owner: SVEAccount, type: TokenType, target: SVEGroup | SVEAccount): Promise<string>;
    protected isValid: boolean;
    protected token: string;
    protected type: TokenType;
    protected target: SVEAccount | SVEGroup | number;
    constructor(token: string, type: TokenType, target: SVEAccount | SVEGroup | number, onValidated: (token: SVEToken) => void);
    getIsValid(): boolean;
    setIsValid(): void;
    invalidate(user: SVEAccount): void;
    listDevices(user: SVEAccount): Promise<TokenInfo[]>;
    use(user?: SVEAccount | undefined): Promise<SVEAccount | undefined>;
}
//# sourceMappingURL=SVEToken.d.ts.map