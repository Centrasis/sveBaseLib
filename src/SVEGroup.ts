import { SessionUserInitializer, SVEAccount} from './SVEAccount';
import { SVEProject } from './SVEProject';
import {SVESystemInfo} from './SVESystemInfo';
import { SVEToken, TokenType } from './SVEToken';

export interface UserRights {
    read: boolean;
    write: boolean;
    admin: boolean;
}

export interface GroupInitializer {
    id?: number,
    name?: string
}

export class SVEGroup {
    protected handler: SVEAccount;
    protected id: number = NaN;
    protected name: string = "";
    protected projects: number[] = [];

    public getID(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getProjects(): Promise<SVEProject[]> {
        return new Promise<SVEProject[]>((resolve, reject) => {
            let r: SVEProject[] = [];
            let i = 0;
            this.projects.forEach(pid => {
                new SVEProject(pid, this.handler, (prj) => {
                    r.push(prj);
                    i++;
                    if (i >= this.projects.length) {
                        resolve(r);
                    }
                });
            });

            if (this.projects.length === 0) {
                resolve([]);
            }
        });
    }

    public getUsers(): Promise<SVEAccount[]> {
        return new Promise<SVEAccount[]>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + '/group/' + this.id + '/users?sessionID=' + encodeURI(this.handler.getInitializer().sessionID), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
            }).then(response => {;
                if (response.status < 400) {
                    response.json().then((val) => {
                        let r: SVEAccount[] = [];
                        val.forEach((v:any) => {
                            r.push(new SVEAccount(v as SessionUserInitializer));
                        });
                        resolve(r);
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

    public setRightsForUser(handler: SVEAccount, rights: UserRights): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + '/group/' + this.id + "/user/" + handler.getID() + "/rights?sessionID=" + encodeURI(this.handler.getInitializer().sessionID), {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(rights)
            }).then(response => {
                resolve(response.status < 400);
            });
        });
    }

    public getRightsForUser(handler: SVEAccount): Promise<UserRights> {
        return new Promise<UserRights>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + '/group/' + this.id + "/user/" + handler.getID() + "/rights?sessionID=" + encodeURI(this.handler.getInitializer().sessionID), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
            }).then(response => {
                if (response.status < 400) {
                    response.json().then((val) => {
                        resolve({
                            admin: val.admin as boolean,
                            read: val.read as boolean,
                            write: val.write as boolean
                        } as UserRights);
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

    public constructor(init: GroupInitializer, handler: SVEAccount, onReady?: (self?: SVEGroup) => void) {
        this.id = (init.id !== undefined && init.id !== null) ? init.id : NaN;
        this.name = (init.name !== undefined && init.name !== null) ? init.name : "";
        this.handler = handler;

        if (!SVESystemInfo.getIsServer()) {
            if(!isNaN(this.id)) {
                fetch(SVESystemInfo.getAPIRoot() + '/group/' + this.id + "?sessionID=" + encodeURI(this.handler.getInitializer().sessionID), {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json' 
                        }
                }).then(response => {
                    if (response.status < 400) {
                        response.json().then((val) => {
                            if("group" in val) {
                                this.id = val.group.id;
                                this.name = (init.name === undefined) ? val.group.name : init.name;
                                this.projects = val.projects as number[];
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
                this.name = init.name!;
                onReady!(this);
            }
        } else {
            onReady!(this);
        }
    }

    public getAsInitializer(): GroupInitializer {
        return {
            id: this.id,
            name: this.name
        };
    }

    public store() {
        return new Promise<boolean>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + '/group/' + ((!isNaN(this.id)) ? this.id : "new") + "?sessionID=" + encodeURI(this.handler.getInitializer().sessionID), {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(this.getAsInitializer())
            }).then(response => {
                if(response.status < 400) {
                    response.json().then(val => {
                        this.id = Number(val.id);
                        this.name = val.name;
                        resolve(true);
                    });
                } else {
                    resolve(false);
                }
            });
        });
    }

    // remove from server
    public remove(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + '/group/' + this.id + "?sessionID=" + encodeURI(this.handler.getInitializer().sessionID), {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                }
            }).then(response => {
                resolve(response.status == 200);
            });
        });
    }

    public createInviteToken(): Promise<string> {
        return SVEToken.register(this.handler, TokenType.RessourceToken, this);
    }

    public static getGroupsOf(handler: SVEAccount): Promise<SVEGroup[]> {
        return new Promise<SVEGroup[]>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + '/groups?sessionID=' + encodeURI(handler.getInitializer().sessionID), {
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
                            gs.push(new SVEGroup({id: gid}, handler, (s) => {
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