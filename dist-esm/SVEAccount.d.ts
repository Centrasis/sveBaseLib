import { TokenUserLoginInfo, Token, SVEToken } from './SVEToken';
export interface BasicUserInitializer {
    name: string;
    id: number;
    requester?: SVEAccount;
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
export declare class SessionUserInitializerType implements SessionUserInitializer {
    sessionID: string;
    loginState: LoginState;
    name: string;
    id: number;
    constructor(init: SessionUserInitializer);
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
    getInitializer(): SessionUserInitializerType;
    static registerNewUser(login: BasicUserLoginInfo, token: SVEToken): Promise<SVEAccount>;
    changePassword(oldPw: string, newPw: string): Promise<boolean>;
    setEmail(email: string): Promise<boolean>;
    constructor(user: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo | string, onLogin?: (state: SVEAccount) => void);
    protected init(state: LoginState): void;
    protected getByID(id: number, requester: SVEAccount): Promise<boolean>;
    protected doLogin(info: BasicUserLoginInfo): Promise<LoginState>;
    createLoginToken(): Promise<string>;
    protected doTokenLogin(token: Token): Promise<LoginState>;
    getState(): LoginState;
}
export { LoginState };
//# sourceMappingURL=SVEAccount.d.ts.map