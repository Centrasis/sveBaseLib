import { SVEData } from './SVEData';
export interface AIClass {
    key: number;
    class: string;
}
export declare class SVEClassificator {
    static classify(model: string, data: SVEData, className: string): Promise<void>;
    static issueRelearn(model: string, forceNew: boolean): Promise<void>;
    static getClasses(model: string): Promise<AIClass[]>;
}
//# sourceMappingURL=SVEAI.d.ts.map