import { SVEAccount } from "./SVEAccount";
export interface SVESources {
    sveService?: string;
    accountService?: string;
    authService?: string;
    gameService?: string;
    aiService?: string;
    persistentDatabase?: string | any;
    volatileDatabase?: string | any;
    sveDataPath?: string;
    protocol: "http" | "https";
}
export interface SQLInfo {
    MySQL_User: string;
    MySQL_Password: string;
    MySQL_DB: string;
}
export interface SVESystemState {
    basicSystem: boolean;
    tokenSystem: boolean;
    authorizationSystem: boolean;
}
export interface SVEFullSystemState extends SVESystemState {
    user?: SVEAccount;
}
declare class SVESystemInfo {
    protected static instance: SVESystemInfo;
    protected systemState: SVESystemState;
    protected static isServer: boolean;
    protected constructor();
    static getIsServer(): boolean;
    static getInstance(): SVESystemInfo;
    static initSystem(): Promise<boolean>;
    sources: SVESources;
    SQLCredentials: SQLInfo;
    static getSystemStatus(): SVESystemState;
    static getFullSystemState(): Promise<SVEFullSystemState>;
    static getAPIRoot(): string;
    static getAccountServiceRoot(): string;
    static getAuthRoot(): string;
    static getGameRoot(): string;
    static getAIRoot(): string;
}
export { SVESystemInfo };
//# sourceMappingURL=SVESystemInfo.d.ts.map