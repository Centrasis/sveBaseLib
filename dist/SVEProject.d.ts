import { SVEAccount } from './SVEAccount';
import { SVEGroup } from './SVEGroup';
import { SVEData } from './SVEData';
export declare enum SVEProjectType {
    Vacation = 0,
    Sales = 1
}
export interface ProjectInitializer {
    id: number;
    name: string;
    group: SVEGroup;
    splashImg: string;
    owner: SVEAccount | number;
    state: string;
    resultsURI: string;
    type: SVEProjectType;
}
export declare class SVEProject {
    protected id: number;
    protected name: string;
    protected group?: SVEGroup;
    protected owner?: SVEAccount;
    protected handler?: SVEAccount;
    protected type: SVEProjectType;
    getID(): number;
    getName(): string;
    getType(): SVEProjectType;
    getOwner(): SVEAccount;
    constructor(idx: number | ProjectInitializer, handler: SVEAccount, onReady?: (self: SVEProject) => void);
    getGroup(): SVEGroup;
    getData(): Promise<SVEData[]>;
}
//# sourceMappingURL=SVEProject.d.ts.map