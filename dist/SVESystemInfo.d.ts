export interface SVESources {
    sveService?: string;
    persistentDatabase?: string | any;
    volatileDatabase?: string | any;
    sveDataPath?: string;
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
}
export { SVESystemInfo };
//# sourceMappingURL=SVESystemInfo.d.ts.map