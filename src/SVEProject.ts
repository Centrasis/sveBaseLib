import {BasicUserInitializer, LoginState, SVEAccount} from './SVEAccount';
import {SVEGroup} from './SVEGroup';
import {SVESystemInfo} from './SVESystemInfo';
import { SVEData, SVEDataType } from './SVEData';
import { rejects } from 'assert';

export enum SVEProjectType {
    Vacation,
    Sales
}

export interface ProjectInitializer {
    id: number,
    name: string,
    group: SVEGroup,
    splashImg: string,
    owner: SVEAccount | number,
    state: string,
    resultsURI: string,
    type: SVEProjectType
}

export interface DateRange {
    begin: Date,
    end: Date
}

export function isProjectInitializer(init: number | ProjectInitializer): boolean {
    return typeof init !== "number";
}

export class SVEProject {
    protected id: number = NaN;
    protected name: string = "";
    protected group?: SVEGroup;
    protected owner?: SVEAccount | number;
    protected handler?: SVEAccount;
    protected splashImgID: number = 0;
    protected type: SVEProjectType = SVEProjectType.Vacation;
    protected dateRange?: DateRange;

    public getID(): number {
        return this.id;
    }

    public getSplashImgID(): number {
        return this.splashImgID;
    }

    public getDateRange(): DateRange | undefined {
        return this.dateRange;
    }

    public getSplashImageURI(): string {
        return SVESystemInfo.getAPIRoot() + "/project/" + this.id + "/data/" + this.splashImgID + "/preview";
    }

    public getName(): string {
        return this.name;
    }

    public getType(): SVEProjectType {
        return this.type;
    }

    public getOwner(): Promise<SVEAccount> {
        if (typeof this.owner! === "number") {
            return new Promise<SVEAccount>((resolve, reject) => {
                this.owner = new SVEAccount({id: this.owner! as number} as BasicUserInitializer, (s) => { 
                    resolve(this.owner! as SVEAccount);
                });
            });
        } else {
            return new Promise<SVEAccount>((resolve, reject) => {
                if (this.owner == undefined) {
                    reject();
                } else {
                    resolve(this.owner! as SVEAccount);
                }
            })
        }
    }

    public constructor(idx: number | ProjectInitializer, handler: SVEAccount, onReady?: (self: SVEProject) => void) {
        // if get by id
        if (!isProjectInitializer(idx)) {
            if (SVESystemInfo.getIsServer()) {
                if (onReady !== undefined)
                    onReady!(this);
            } else {
                fetch(SVESystemInfo.getInstance().sources.sveService + '/project/' + idx, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json' 
                        }
                }).then(response => {
                    if (response.status < 400) {
                        response.json().then((val) => {
                            this.id = val.id;
                            this.name = val.name;
                            this.type = val.type;
                            this.handler = handler;
                            this.splashImgID = val.splashImgID;
                            this.dateRange = ("dateRange" in val) ? val.dateRange as DateRange : undefined;
                            this.owner = new SVEAccount({id: val.owner} as BasicUserInitializer, (s) => {
                                this.group = new SVEGroup(val.group, handler, (self) => {
                                    if (onReady !== undefined)
                                        onReady!(this);
                                });
                            });
                        });
                    } else {
                        if (onReady !== undefined)
                            onReady!(this);
                    }
                }, err => {if (onReady !== undefined) onReady!(this)});
            }
        } else {
            this.id = (idx as ProjectInitializer).id;
            this.group = (idx as ProjectInitializer).group;
            this.name = (idx as ProjectInitializer).name;
            this.type = (idx as ProjectInitializer).type;
            this.handler = handler;
            this.owner = (idx as ProjectInitializer).owner;
            if (onReady !== undefined)
                onReady!(this);
        }
    }

    public getGroup(): SVEGroup {
        return this.group!;
    }

    public getData(): Promise<SVEData[]> {
        return new Promise<SVEData[]>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.sveService + '/project/' + this.id + '/data/list',
                {
                    method: "GET"
            }).then(response => {
                if (response.status < 400) {
                    response.json().then(val => {
                        let r: SVEData[] = [];
                        let i = 0;
                        if (val.length > 0) {
                            val.foreach((v: any) => {
                                r.push(new SVEData(this.handler!, {id: v.id as number, parentProject: this, type: v.type as SVEDataType }, (s) => {
                                    i++;
                                    if (i >= val.length) {
                                        resolve(r);
                                    }
                                }));
                            });
                        } else {
                            resolve(r);
                        }
                    }, err => reject(false));
                } else {
                    reject(false);
                }
            }, err => reject(err));
        });
    }
}