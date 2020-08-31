import {BasicUserInitializer, SVEAccount} from './SVEAccount';
import {ProjectInitializer, SVEProject, SVEProjectType} from './SVEProject';
import mysql from 'mysql';
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
            let ret: SVEProject[] = [];
            if (typeof SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
                (SVESystemInfo.getInstance().sources.persistentDatabase! as mysql.Connection).query("SELECT * FROM projects WHERE context = ?", [this.id], (err, results) => {
                    if(err) {
                        console.log("SQL error on getting SVE Projects!");
                        reject({
                            success: false,
                            msg: err
                        });
                    } else {
                        let i = 0;
                        results.forEach((element: any) => {
                            let init: ProjectInitializer = {
                                group: this,
                                name: element.name,
                                splashImg: element.splash_img,
                                id: element.id,
                                resultsURI: element.results_uri,
                                state: element.state,
                                type: SVEProjectType.Vacation,
                                owner: element.owner
                            };
                            ret.push(new SVEProject(init, this.handler!, (p) => {
                                i++;
                                if (i >= results.length) {
                                    resolve(ret);
                                }
                            }));
                        });
                        if (results.length == 0) {
                            resolve([]);
                        }
                    }
                });
            } else {
                async () => {
                    const response = await fetch(SVESystemInfo.getInstance().sources.sveService + '/group/' + this.id, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json' 
                        }
                    });
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
                };
            }
        });
    }

    public getRightsForUser(handler: SVEAccount): Promise<UserRights> {
        return new Promise<UserRights>((resolve, reject) => {
            if (typeof SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
                (SVESystemInfo.getInstance().sources.persistentDatabase! as mysql.Connection).query("SELECT user_id, context as context_id, write_access, read_access, admin_access FROM user INNER JOIN rights ON user.id = rights.user_id WHERE user_id = ? AND context = ?", [handler.getID(), this.id], (err, results) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve({
                            read: results[0].read_access as boolean,
                            write: results[0].write_access as boolean,
                            admin: results[0].admin_access as boolean
                        });
                    }
                });
            } else {
                async () => {
                    const response = await fetch(SVESystemInfo.getInstance().sources.sveService + '/group/' + this.id + "/rights", {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json' 
                        }
                    });
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
                };
            }
        });
    }

    public constructor(id: number, handler: SVEAccount, onReady?: (self?: SVEGroup) => void) {
        if (SVESystemInfo.getInstance().sources.sveService !== undefined) {
            async () => {
                const response = await fetch(SVESystemInfo.getInstance().sources.sveService + '/group/' + id, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
                });
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
            };
        } else {
            if (typeof SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
                (SVESystemInfo.getInstance().sources.persistentDatabase! as mysql.Connection).query("SELECT * FROM contexts WHERE id = ?", [id], (err, results) => {
                    if(err) {
                        console.log("Error in SQL: " + JSON.stringify(err));
                        if(onReady !== undefined)
                            onReady!(undefined);
                    } else {
                        this.id = id;
                        this.name = results[0].context;
                        this.handler = handler;

                        if(onReady !== undefined)
                            onReady!(this);
                    }
                });
            }
        }
    }

    public static getGroupsOf(handler: SVEAccount): Promise<SVEGroup[]> {
        return new Promise<SVEGroup[]>((resolve, reject) => {
            let ret: SVEGroup[] = [];
            if (typeof SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
                (SVESystemInfo.getInstance().sources.persistentDatabase! as mysql.Connection).query("SELECT user_id, context as context_id, write_access, read_access, admin_access FROM user INNER JOIN rights ON user.id = rights.user_id WHERE user_id = ? AND read_access = 1", [handler.getID()], (err, results) => {
                    if(err) {
                        console.log("SQL error on getting SVE Groups!");
                        reject({
                            success: false,
                            msg: err
                        });
                    } else {
                        let i = 0;
                        results.forEach((element: any) => {
                            ret.push(new SVEGroup(element.context_id, handler, (s) => {
                                i++;
                                if(i >= results.length) {
                                    resolve(ret);
                                }
                            }));
                        });
                        if (results.length == 0) {
                            resolve([]);
                        }
                    }
                });
            } else {
                console.log("Error getting SVE Groups!");
                reject({
                    success: false, 
                    msg: "DB not valid!"
                });
            }
        });
    }
};