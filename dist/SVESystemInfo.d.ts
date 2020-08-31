import mysql from 'mysql';
import mongoose from 'mongoose';
export interface SVESources {
    sveService?: string;
    persistentDatabase?: string | mysql.Connection;
    volatileDatabase?: string | typeof mongoose;
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
    private static instance;
    private systemState;
    private constructor();
    static getInstance(): SVESystemInfo;
    static initSystem(): Promise<boolean>;
    sources: SVESources;
    SQLCredentials: SQLInfo;
    static getSystemStatus(): SVESystemState;
}
export { SVESystemInfo };
//# sourceMappingURL=SVESystemInfo.d.ts.map