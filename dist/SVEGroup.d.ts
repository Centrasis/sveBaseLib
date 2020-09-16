import { SVEAccount } from './SVEAccount';
import { SVEProject } from './SVEProject';
export interface UserRights {
    read: boolean;
    write: boolean;
    admin: boolean;
}
export declare class SVEGroup {
    protected handler?: SVEAccount;
    protected id: number;
    protected name: string;
    protected projects: number[];
    getID(): number;
    getName(): string;
    getProjects(): Promise<SVEProject[]>;
    getUsers(): Promise<SVEAccount[]>;
    setRightsForUser(handler: SVEAccount, rights: UserRights): Promise<boolean>;
    getRightsForUser(handler: SVEAccount): Promise<UserRights>;
    constructor(id: number, handler: SVEAccount, onReady?: (self?: SVEGroup) => void);
    static getGroupsOf(handler: SVEAccount): Promise<SVEGroup[]>;
}
//# sourceMappingURL=SVEGroup.d.ts.map