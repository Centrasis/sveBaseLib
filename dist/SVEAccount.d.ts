import { TokenUserLoginInfo, Token, SVEToken } from './SVEToken';
export interface BasicUserInitializer {
    name: string;
    id: number;
}
declare enum LoginState {
    NotLoggedIn = 1,
    LoggedInByUser = 2,
    LoggedInByToken = 3
}
export interface SessionUserInitializer extends BasicUserInitializer {
    sessionID: string;
    loginState: LoginState;
}
export interface BasicUserLoginInfo {
    name: string;
    pass: string;
}
export declare function isLoginInfo(info: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo): boolean;
export declare function isTokenInfo(info: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo): boolean;
export declare function isSessionUserInitializer(info: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo): boolean;
export declare function isBasicUserInitializer(info: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo): boolean;
export declare class SVEAccount {
    protected loginState: LoginState;
    protected name: string;
    protected id: number;
    protected sessionID: string;
    getID(): number;
    getName(): string;
    setSessionID(id: string): void;
    getLoginState(): LoginState;
    getInitializer(): SessionUserInitializer;
    static registerNewUser(login: BasicUserLoginInfo, token: SVEToken): Promise<SVEAccount>;
    changePassword(oldPw: string, newPw: string): Promise<boolean>;
    constructor(user: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo, onLogin?: (state: SVEAccount) => void);
    protected init(state: LoginState): void;
    protected getByID(id: number): Promise<boolean>;
    protected doLogin(info: BasicUserLoginInfo): Promise<LoginState>;
    createLoginToken(): Promise<string>;
    protected doTokenLogin(token: Token): Promise<LoginState>;
    getState(): LoginState;
}
export { LoginState };
//# sourceMappingURL=SVEAccount.d.ts.map