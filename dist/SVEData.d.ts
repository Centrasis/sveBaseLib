/// <reference types="node" />
import { SVEAccount } from './SVEAccount';
import { SVEProject } from './SVEProject';
import { Stream } from 'stream';
export declare enum SVEDataType {
    Image = 0,
    Video = 1,
    PDF = 2,
    CSV = 3
}
export interface SVEDataInitializer {
    id?: number;
    data?: ArrayBuffer | Stream;
    path?: SVELocalDataInfo;
    type: SVEDataType;
    parentProject?: SVEProject;
}
export interface SVELocalDataInfo {
    filePath: string;
    thumbnailPath: string;
}
export declare class SVEData {
    protected type: SVEDataType;
    protected id: number;
    protected data?: ArrayBuffer | Stream;
    protected parentProject?: SVEProject;
    protected handler: SVEAccount;
    protected owner?: SVEAccount;
    protected localDataInfo?: SVELocalDataInfo;
    protected lastAccess: Date;
    protected creation: Date;
    static getMimeTypeMap(): Map<string, string>;
    initFromResult(result: any, parentProject: SVEProject | undefined, onComplete: () => void): void;
    static getTypeFrom(str: string): SVEDataType;
    constructor(handler: SVEAccount, initInfo: number | SVEDataInitializer, onComplete: (self: SVEData) => void);
    getID(): number;
    getOwner(): SVEAccount;
    getCreationDate(): Date;
    getLastAccessDate(): Date;
    getCacheType(): string;
    getContentType(): string;
    getName(): string;
    getType(): SVEDataType;
    getProject(): SVEProject;
    store(): Promise<boolean>;
    getBLOB(): Promise<ArrayBuffer>;
    getStream(): Promise<Stream>;
}
//# sourceMappingURL=SVEData.d.ts.map