export declare enum TokenType {
    RessourceToken = 1,
    DeviceToken = 2
}
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
    constructor(user: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo, onLogin?: (state: SVEAccount) => void);
    protected init(initObj: any, state: LoginState): void;
    protected getByID(id: number): Promise<boolean>;
    protected doLogin(info: BasicUserLoginInfo): Promise<LoginState>;
    createTokenFor(ressource: String, user: String): Promise<Token>;
    protected doTokenLogin(token: Token): Promise<LoginState>;
    getState(): LoginState;
}
export { LoginState };
//# sourceMappingURL=SVEAccount.d.ts.map