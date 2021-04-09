/// <reference types="node" />
import { SVEAccount } from './SVEAccount';
import { SVEProject } from './SVEProject';
import { Stream } from 'stream';
export declare enum SVEDataType {
    Image = 0,
    Video = 1,
    PDF = 2,
    CSV = 3,
    BLOB = 4
}
export declare enum SVEDataVersion {
    Full = 0,
    Small = 1,
    Preview = 2
}
export interface SVEDataInitializer {
    id?: number;
    data?: ArrayBuffer | Stream;
    path?: SVELocalDataInfo;
    type: SVEDataType;
    parentProject?: SVEProject;
    owner?: SVEAccount | number;
    creation?: Date;
    name?: string;
    classifiedAs?: string;
}
export interface SVELocalDataInfo {
    filePath: string;
    thumbnailPath: string;
}
export declare class SVEData {
    protected type: SVEDataType;
    protected id: number;
    protected name: string;
    protected data?: ArrayBuffer | Stream;
    protected parentProject?: SVEProject;
    protected handler: SVEAccount;
    protected owner?: SVEAccount | number;
    protected localDataInfo?: SVELocalDataInfo;
    protected lastAccess: Date;
    protected creation: Date;
    protected currentDataVersion?: SVEDataVersion;
    protected classifiedAs?: string;
    static getMimeTypeMap(): Map<string, string>;
    initFromResult(result: any, parentProject: SVEProject | undefined, onComplete: () => void): void;
    pullClassification(modelName?: string): Promise<void>;
    isClassfied(): boolean;
    getClassName(): string;
    static getTypeFrom(str: string): SVEDataType;
    constructor(handler: SVEAccount, initInfo: number | SVEDataInitializer, onComplete?: ((self: SVEData) => void) | undefined);
    getID(): number;
    getOwnerID(): number;
    getSize(version: SVEDataVersion): number;
    getOwner(): Promise<SVEAccount>;
    getCreationDate(): Date;
    getLastAccessDate(): Date;
    getCacheType(): string;
    getContentType(version: SVEDataVersion): string;
    static type2Str(t: SVEDataType): string;
    static getTypeFromExt(str: string): SVEDataType;
    getName(): string;
    getType(): SVEDataType;
    getProject(): SVEProject;
    store(): Promise<boolean>;
    static getLatestUpload(user: SVEAccount): Promise<SVEData>;
    remove(): Promise<boolean>;
    getURI(version: SVEDataVersion, download?: boolean): string;
    getBLOB(version: SVEDataVersion): Promise<ArrayBuffer>;
    getStream(version: SVEDataVersion): Promise<Stream>;
    getLocalPath(version: SVEDataVersion): string;
}
//# sourceMappingURL=SVEData.d.ts.map