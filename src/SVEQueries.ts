import { SVEAccount } from './SVEAccount';
import {SVEGroup} from './SVEGroup';
import {SVEProject} from './SVEProject';
import {SVESystemInfo} from './SVESystemInfo';

export class SVEQuery {
    public static query(str: string, requester: SVEAccount): Promise<SVEGroup[] | SVEProject[]> {
        return new Promise<SVEGroup[] | SVEProject[]>((res, rej) => {
            res([]);
        });
    }
}

export class SVEProjectQuery extends SVEQuery {
    public static query(str: string, requester: SVEAccount): Promise<SVEGroup[] | SVEProject[]> {
        return new Promise<SVEGroup[] | SVEProject[]>((resolve, reject) => {
            if (typeof SVESystemInfo.getInstance().sources.sveService !== undefined) {
                fetch(SVESystemInfo.getInstance().sources.sveService + '/query/' + encodeURI(str), {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json' 
                        }
                }).then(response => {
                    if (response.status < 400) {
                        response.json().then((val) => {
                            let projects: number[] = [];
                            val.forEach((pid: number) => {
                                projects.push(Number(pid));
                            });

                            let r: SVEProject[] = [];
                            let i = 0;
                            projects.forEach(pid => {
                                new SVEProject(pid, requester, (prj) => {
                                    r.push(prj);
                                    i++;
                                    if (i >= projects.length) {
                                        resolve(r);
                                    }
                                });
                            });

                            if (projects.length === 0) {
                                resolve([]);
                            }
                        });
                    } else {
                        resolve([]);
                    }
                });
            } else {
                resolve([]);
            }
        });
    }
}