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
export interface Token {
    user?: number;
    token: string;
    type: TokenType;
    time: Date;
    ressource?: number;
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
    use(user?: SVEAccount | undefined): Promise<SVEAccount | undefined>;
}
//# sourceMappingURL=SVEToken.d.ts.map