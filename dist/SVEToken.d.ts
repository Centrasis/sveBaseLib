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
    static register(type: TokenType, target: SVEGroup | SVEAccount): Promise<string>;
    protected isValid: boolean;
    protected token: string;
    protected type: TokenType;
    protected target: SVEAccount | SVEGroup;
    constructor(token: string, type: TokenType, target: SVEAccount | SVEGroup, onValidated: (token: SVEToken) => void);
    getIsValid(): boolean;
    setIsValid(): void;
    use(): Promise<void>;
}
//# sourceMappingURL=SVEToken.d.ts.map