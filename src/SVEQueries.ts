import { SVEAccount } from './SVEAccount';
import {SVEGroup} from './SVEGroup';
import {SVEProject} from './SVEProject';
import {SVESystemInfo} from './SVESystemInfo';

export enum QueryResultType {
    Project,
    Group
}

export interface RawQueryResult {
    typ: QueryResultType,
    id: number,
    distance: number
}

export class SVEQuery {
    public static query(str: string, requester: SVEAccount): Promise<(SVEProject | SVEGroup)[]> {
        return new Promise<(SVEProject | SVEGroup)[]>((res, rej) => {
            res([]);
        });
    }
}

export class SVEProjectQuery extends SVEQuery {
    public static query(str: string, requester: SVEAccount): Promise<(SVEProject | SVEGroup)[]> {
        return new Promise<(SVEProject | SVEGroup)[]>((resolve, reject) => {
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
                            let results: RawQueryResult[] = [];
                            val.forEach((res: RawQueryResult) => {
                                results.push({
                                    typ: res.typ as QueryResultType,
                                    id: Number(res.id),
                                    distance: Number(res.distance)
                                });
                            });
                            
                            results = results.sort((a,b) => a.distance - b.distance);
                            let r: (SVEProject | SVEGroup)[] = [];
                            let i = 0;
                            for (let j = 0; j < results.length; j++) {
                                let res = results[j];
                                if (res.typ === QueryResultType.Project) {
                                    new SVEProject(res.id, requester, (prj) => {
                                        r.push(prj);
                                        i++;
                                        if (i >= results.length) {
                                            resolve(r);
                                        }
                                    });
                                } else {
                                    new SVEGroup({id: res.id}, requester, (group) => {
                                        if(group !== undefined)
                                            r.push(group!);
                                        i++;
                                        if (i >= results.length) {
                                            resolve(r);
                                        }
                                    });
                                }
                            };

                            if (results.length === 0) {
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