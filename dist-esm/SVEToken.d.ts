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
    name: string;
    time: Date;
    type: TokenType;
    target: number;
    deviceAgent: string;
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
    static invalidateByInfo(user: SVEAccount, tokenInfo: TokenInfo): void;
    invalidate(user: SVEAccount): void;
    static listDevices(user: SVEAccount): Promise<TokenInfo[]>;
    use(user?: SVEAccount | undefined): Promise<SVEAccount | undefined>;
}
//# sourceMappingURL=SVEToken.d.ts.map