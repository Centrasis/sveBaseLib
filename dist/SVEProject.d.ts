import { SVEAccount } from './SVEAccount';
import { SVEGroup } from './SVEGroup';
import { SVEData } from './SVEData';
export declare enum SVEProjectType {
    Vacation = 0,
    Sales = 1
}
export declare enum SVEProjectState {
    Open = 0,
    Closed = 1
}
export interface ProjectInitializer {
    id: number;
    name: string;
    group: SVEGroup;
    splashImg?: number;
    owner: SVEAccount | number;
    state: SVEProjectState;
    resultsURI?: string;
    type: SVEProjectType;
    dateRange?: DateRange;
}
export interface DateRange {
    begin: Date;
    end: Date;
}
export declare function isProjectInitializer(init: number | ProjectInitializer): boolean;
export declare class SVEProject {
    protected id: number;
    protected name: string;
    protected group?: SVEGroup;
    protected owner?: SVEAccount | number;
    protected handler?: SVEAccount;
    protected splashImgID: number;
    protected type: SVEProjectType;
    protected dateRange?: DateRange;
    protected state: SVEProjectState;
    getID(): number;
    getState(): SVEProjectState;
    setState(state: SVEProjectState): void;
    getSplashImgID(): number;
    getDateRange(): DateRange | undefined;
    getSplashImageURI(): string;
    getName(): string;
    setName(name: string): void;
    setType(newType: SVEProjectType): void;
    setDateRange(range: DateRange): void;
    getType(): SVEProjectType;
    getOwner(): Promise<SVEAccount>;
    setSplashImgID(id: number): void;
    store(): Promise<boolean>;
    remove(): Promise<boolean>;
    constructor(idx: number | ProjectInitializer, handler: SVEAccount, onReady?: (self: SVEProject) => void);
    getAsInitializer(): ProjectInitializer;
    getGroup(): SVEGroup;
    getData(): Promise<SVEData[]>;
}
//# sourceMappingURL=SVEProject.d.ts.map