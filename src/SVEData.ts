import {BasicUserInitializer, SVEAccount} from './SVEAccount';
import {SVEProject} from './SVEProject';
import {SVESystemInfo} from './SVESystemInfo';
import { Stream } from 'stream';
import { basename } from 'path';

export enum SVEDataType {
    Image,
    Video,
    PDF,
    CSV,
    BLOB
}

export enum SVEDataVersion {
    Full,
    Small,
    Preview
}

export interface SVEDataInitializer {
    id?: number,
    data?: ArrayBuffer | Stream, 
    path?: SVELocalDataInfo,
    type: SVEDataType,
    parentProject?: SVEProject,
    owner?: SVEAccount | number,
    creation?: Date,
    name?: string,
    classifiedAs?: string
}

export interface SVELocalDataInfo {
    filePath: string,
    thumbnailPath: string
}

var mimeMap: Map<string, string> = new Map();
mimeMap.set("html", 'text/html');
mimeMap.set("txt", 'text/css');
mimeMap.set("css", 'text/html');
mimeMap.set("gif", 'image/gif');
mimeMap.set("jpg", 'image/jpeg');
mimeMap.set("jpeg", 'image/jpeg');
mimeMap.set("png", 'image/png');
mimeMap.set("svg", 'image/svg+xml');
mimeMap.set("js", 'application/javascript');
mimeMap.set("mp4", 'video/mp4');
mimeMap.set("mov", 'video/quicktime');
mimeMap.set("mpeg", 'video/mpeg');
mimeMap.set("mpg", 'video/mpeg');
mimeMap.set("mpe", 'video/mpeg');
mimeMap.set("avi", 'video/x-msvideo');
mimeMap.set("ogg", 'video/ogg');
mimeMap.set("pdf", 'application/pdf');
mimeMap.set("tiff", 'image/tiff');
mimeMap.set("tif", 'image/tiff');

var typeMap: Map<SVEDataType, string[]> = new Map();
typeMap.set(SVEDataType.CSV, ['.csv', '.xlsx']);
typeMap.set(SVEDataType.Image, [".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".raw", ".gif"]);
typeMap.set(SVEDataType.Video, [".avi", ".mp4", ".mpg", ".mpeg", ".m4v", ".mov", ".ogg"]);
typeMap.set(SVEDataType.PDF, [".pdf"]);
typeMap.set(SVEDataType.BLOB, []);

export class SVEData {
    protected type: SVEDataType = SVEDataType.Image;
    protected id: number = -1;
    protected name: string = "";
    protected data?: ArrayBuffer | Stream;
    protected parentProject?: SVEProject;
    protected handler: SVEAccount;
    protected owner?: SVEAccount | number;
    protected localDataInfo?: SVELocalDataInfo;
    protected lastAccess: Date = new Date();
    protected creation: Date = new Date();
    protected currentDataVersion?: SVEDataVersion;
    protected classifiedAs?: string = undefined;

    public static getMimeTypeMap(): Map<string, string> {
        return mimeMap;
    }

    public initFromResult(result: any, parentProject: SVEProject | undefined, onComplete: () => void) {
        this.localDataInfo = {
            filePath: result.path,
            thumbnailPath: result.thumbnail
        };

        this.creation = result.creation;
        this.lastAccess = result.lastAccess;
        this.parentProject = parentProject;

        this.type = SVEData.getTypeFrom(result.type);

        this.owner = new SVEAccount({id: Number(result.user_id)} as BasicUserInitializer, (s) => {
            onComplete();
        });
    }

    public pullClassification(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if(SVESystemInfo.getInstance().sources.aiService !== undefined) {
                fetch(SVESystemInfo.getInstance().sources.aiService! + '/model/documents/class', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        file: this.id
                    })
                }).then(response => {
                    if (response.status < 400) {
                        response.json().then((val) => {
                            this.classifiedAs = ((val.success as boolean) == true) ? val.class as string : undefined;
                            resolve();
                        }, err => reject(err));
                    } else {
                        this.classifiedAs = undefined;
                        reject();
                    }
                }, err => reject(err));
            } else {
                this.classifiedAs = undefined;
                resolve();
            }
        });
    }

    public isClassfied(): boolean {
        return this.classifiedAs !== undefined;
    }

    public getClassName(): string {
        return this.classifiedAs!;
    }

    public static getTypeFrom(str: string): SVEDataType {
        if(str === "Image") {
            return SVEDataType.Image;
        }
        if(str === "Video") {
            return SVEDataType.Video;
        }
        if(str === "PDF") {
            return SVEDataType.PDF;
        }
        if(str === "CSV") {
            return SVEDataType.CSV;
        }
        return SVEDataType.Image;
    }

    // gets the data by index if initInfo is number. Else a new data record is created on server
    public constructor(handler: SVEAccount, initInfo: number | SVEDataInitializer, onComplete: (self: SVEData) => void) {
        this.handler = handler;

        if (typeof initInfo === "number") {
            this.id = initInfo as number;

            if (typeof SVESystemInfo.getInstance().sources.sveService !== undefined && !SVESystemInfo.getIsServer()) {
                try {
                    fetch(SVESystemInfo.getInstance().sources.sveService + '/data/' + this.id, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json' 
                            }
                    }).then(response => {
                        if (response.status < 400) {
                            response.json().then((val) => {
                                this.id = val.id;
                                this.type = val.type as SVEDataType;
                                this.creation = val.creation;
                                this.lastAccess = val.lastAccess;
                                this.name = val.name;
                                new SVEProject(Number(val.project), this.handler, (prj: SVEProject) => {
                                    this.parentProject = prj;
                                    this.pullClassification().then(() => onComplete(this), err => onComplete(this));
                                });
                            });
                        } else {
                            this.id = NaN;
                            onComplete(this);
                        }
                    }, err => onComplete(this));
                } catch {
                    onComplete(this);
                }
            } else {
                onComplete(this);
            }
        } else {
            if ((initInfo as SVEDataInitializer).id !== undefined) {
                this.id = (initInfo as SVEDataInitializer).id!;
            }
            this.type = (initInfo as SVEDataInitializer).type;
            this.data = (initInfo as SVEDataInitializer).data;
            this.name = ((initInfo as SVEDataInitializer).name !== undefined) ? (initInfo as SVEDataInitializer).name! : "";
            if((initInfo as SVEDataInitializer).path !== undefined)
                this.localDataInfo = (initInfo as SVEDataInitializer).path;
            this.parentProject = (initInfo as SVEDataInitializer).parentProject;
            this.owner = (initInfo as SVEDataInitializer).owner;
            if((initInfo as SVEDataInitializer).creation !== undefined)
                this.creation = (initInfo as SVEDataInitializer).creation!;

            onComplete(this);
        }
    }

    public getID(): number {
        return this.id;
    }

    public getOwnerID(): number {
        if(this.owner !== undefined) {
            if (typeof this.owner! === "number") {
                return this.owner! as number;
            } else {
                return (this.owner! as SVEAccount).getID();
            }
        } else {
            return NaN;
        }
    }

    //returns -1 when called by client
    public getSize(version: SVEDataVersion): number {
        return -1;
    }

    public getOwner(): Promise<SVEAccount> {
        if (typeof this.owner! === "number") {
            return new Promise<SVEAccount>((resolve, reject) => {
                this.owner = new SVEAccount({id: this.owner! as number} as BasicUserInitializer, (s) => { 
                    resolve(this.owner! as SVEAccount);
                });
            });
        } else {
            return new Promise<SVEAccount>((resolve, reject) => resolve(this.owner! as SVEAccount));
        }
    }

    public getCreationDate(): Date {
        return this.creation;
    }

    public getLastAccessDate(): Date {
        return this.lastAccess;
    }

    public getCacheType(): string {
        let r = "private";

        if (this.type === SVEDataType.PDF) {
            r = "no-store";
        }

        return r;
    }

    public getContentType(version: SVEDataVersion): string {
        let r = "application/octet-stream";

        if (this.localDataInfo !== undefined || this.name.length > 0) {
            let bname = this.name;
            if(this.localDataInfo !== undefined) {
                bname = (version === SVEDataVersion.Full) ? this.localDataInfo.filePath : this.localDataInfo.thumbnailPath;
            }
            r = mimeMap.get((bname.split('.').pop() as string).toLowerCase()) as string;
        } else {
            if (this.type === SVEDataType.Image) {
                r = "image/png";
            }
            if (this.type === SVEDataType.Video) {
                r = "video/mp4";
            }
            if (this.type === SVEDataType.PDF) {
                r = "application/pdf";
            }
        }

        return r;
    }

    public static type2Str(t: SVEDataType): string {
        if(t === SVEDataType.Image) {
            return "Image";
        }
        if(t === SVEDataType.Video) {
            return "Video";
        }
        if(t === SVEDataType.PDF) {
            return "PDF";
        }
        if(t === SVEDataType.CSV) {
            return "CSV";
        }
        return "BLOB";
    }

    public static getTypeFromExt(str: string): SVEDataType {
        let inStr = str.toLowerCase();
        let retType = SVEDataType.BLOB;
        [SVEDataType.CSV, SVEDataType.Image, SVEDataType.PDF, SVEDataType.Video].forEach(type => {
            typeMap.get(type)!.forEach(ext => {
                if (inStr.endsWith(ext)) {
                    retType = type;
                }
            });
        });

        return retType;
    }

    public getName(): string {
        if (this.localDataInfo === undefined) {
            return this.name;
        } else {
            var path = require('path');
            return path.basename(this.localDataInfo.filePath);
        }
    }

    public getType(): SVEDataType {
        return this.type;
    }

    public getProject(): SVEProject {
        return this.parentProject!;
    }

    public store(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(false);
        });
    }

    public static getLatestUpload(user: SVEAccount): Promise<SVEData> {
        return new Promise<SVEData>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + "/data/latest", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                }
            }).then(response => {
                if(response.status < 400) {
                    response.json().then(val => {
                        if (val.project !== undefined) {
                            new SVEProject(Number(val.project), user, (prj) => {
                                new SVEData(user, {
                                    type: Number(val.type) as SVEDataType,
                                    creation: new Date(val.creation),
                                    id: Number(val.id),
                                    name: val.name,
                                    owner: Number(val.owner),
                                    parentProject: prj,
                                } as SVEDataInitializer, (data) => resolve(data));
                            });
                        } else {
                            new SVEData(user, {
                                type: Number(val.type) as SVEDataType,
                                creation: new Date(val.creation),
                                id: Number(val.id),
                                name: val.name,
                                owner: Number(val.owner),
                                parentProject: undefined,
                            } as SVEDataInitializer, (data) => resolve(data));
                        }
                    });
                } else {
                    reject();
                }
            });
        });
    }

    public remove(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + "/project/" + this.parentProject!.getID() + "/data/" + this.id + "/", {
                method: 'DELETE',
                headers: {
                    'Accept': '*'
                }
            }).then(response => {
                resolve(response.status == 200);
            });
        });
    }

    public getURI(version: SVEDataVersion, download: boolean = false): string {
        return (SVESystemInfo.getAPIRoot() + "/project/" + this.parentProject!.getID() + "/data/" + this.id + "/") + ((download) ? "download" : ((SVEDataVersion.Full === version) ? "full" : "preview"));
    }

    public getBLOB(version: SVEDataVersion): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>((resolve, reject) => {
            if(this.data === undefined || this.currentDataVersion !== version) {
                this.currentDataVersion = version;
                var self = this;
                fetch(this.getURI(version), {
                        method: 'GET',
                        headers: {
                            'Accept': '*'
                        }
                }).then(response => {
                    if (response.status < 400) {
                        response.arrayBuffer().then((val) => {
                            self.data = val;
                            resolve(self.data);
                        });
                    } else {
                        reject(null);
                    }
                }, err => reject(err));
                return;
            }

            if(this.data !== undefined) {
                resolve(this.data! as ArrayBuffer);
            } else {
                reject(null);
            }
        });
    }

    public getStream(version: SVEDataVersion): Promise<Stream> {
        return new Promise<Stream>((resolve, reject) => {
            if(this.data !== undefined && this.currentDataVersion === version) {
                var self = this;
                (this.data! as Stream).on('error', function(err) {
                    reject(null);
                });
                (this.data! as Stream).on('open', function() {
                    resolve(self.data! as Stream);
                });
            } else {
                reject(null);
            }
        });
    }

    public getLocalPath(version: SVEDataVersion): string {
        return "";
    }
}