import { rejects } from 'assert';
import { visitLexicalEnvironment } from 'typescript';
import {BasicUserInitializer, SVEAccount} from './SVEAccount';
import {ProjectInitializer, SVEProject, SVEProjectType} from './SVEProject';
import {SVESystemInfo} from './SVESystemInfo';

export interface UserRights {
    read: boolean;
    write: boolean;
    admin: boolean;
}

export class SVEGroup {
    protected handler?: SVEAccount;
    protected id: number = NaN;
    protected name: string = "";

    public getID(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getProjects(): Promise<SVEProject[]> {
        return new Promise<SVEProject[]>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.sveService + '/group/' + this.id, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
            }).then(response => {
                if (response.status < 400) {
                    response.json().then((val) => {
                        resolve(val.projects as SVEProject[]);
                    });
                } else {
                    reject({
                        success: false,
                        msg: "HTTP error"
                    });
                }
            }, err => reject(err));
        });
    }

    public getUsers(): Promise<SVEAccount[]> {
        return new Promise<SVEAccount[]>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.sveService + '/group/' + this.id + '/users', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
            }).then(response => {;
                if (response.status < 400) {
                    response.json().then((val) => {
                        resolve(val as SVEAccount[]);
                    });
                } else {
                    reject({
                        success: false,
                        msg: "HTTP error"
                    });
                }
            });
        });
    }

    public getRightsForUser(handler: SVEAccount): Promise<UserRights> {
        return new Promise<UserRights>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.sveService + '/group/' + this.id + "/rights", {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
            }).then(response => {
                if (response.status < 400) {
                    response.json().then((val) => {
                        resolve(val as UserRights);
                    });
                } else {
                    reject({
                        success: false,
                        msg: "HTTP error"
                    });
                }
            }, err => reject(err));
        });
    }

    public constructor(id: number, handler: SVEAccount, onReady?: (self?: SVEGroup) => void) {
        if (!SVESystemInfo.getIsServer()) {
            fetch(SVESystemInfo.getInstance().sources.sveService + '/group/' + id, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
            }).then(response => {
                if (response.status < 400) {
                    response.json().then((val) => {
                        if(val.success === true) {
                            this.id = val.group.id;
                            this.name = val.group.name;
                            this.handler = handler;
                        }
                        if(onReady !== undefined)
                            onReady!(this);
                    });
                } else {
                    if(onReady !== undefined)
                        onReady!(this);
                }
            }, err => { if(onReady !== undefined) onReady!(this) });
        } else {
            onReady!(this);
        }
    }

    public static getGroupsOf(handler: SVEAccount): Promise<SVEGroup[]> {
        return new Promise<SVEGroup[]>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.sveService + '/groups/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
            }).then(response => {
                if (response.status < 400) {
                    response.json().then((val) => {
                        let gs: SVEGroup[] = [];
                        let i = 0;
                        val.forEach((gid: number) => {
                            gs.push(new SVEGroup(gid, handler, (s) => {
                                i++;
                                if (i >= val.length) {
                                    resolve(gs);
                                }
                            }));
                        });
                    }, err => reject(err));
                } else {
                    reject({
                        success: false,
                        msg: "HTTP error"
                    });
                }
            }, err => reject(err));
        });
    }
};