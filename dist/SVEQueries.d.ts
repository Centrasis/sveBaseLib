import { SVEAccount } from './SVEAccount';
import { SVEGroup } from './SVEGroup';
import { SVEProject } from './SVEProject';
export declare enum QueryResultType {
    Project = 0,
    Group = 1
}
export interface RawQueryResult {
    typ: QueryResultType;
    id: number;
    distance: number;
}
export declare class SVEQuery {
    static query(str: string, requester: SVEAccount): Promise<(SVEProject | SVEGroup)[]>;
}
export declare class SVEProjectQuery extends SVEQuery {
    static query(str: string, requester: SVEAccount): Promise<(SVEProject | SVEGroup)[]>;
}
//# sourceMappingURL=SVEQueries.d.ts.map