import { SVEAccount } from "./SVEAccount";
export interface GameInfo {
    name: string;
    host: string;
    maxPlayers: number;
    players?: number;
    gameType: string;
}
export interface GameRequest {
    invoker: string;
    target?: string;
    action: any;
}
export declare class SVEGame {
    host: string;
    name: string;
    gameType: string;
    maxPlayers: number;
    constructor(host: string, name: string, gameType: string, maxPlayers: number);
    join(player: SVEAccount, game: string): void;
    create(): Promise<void>;
    static getGames(): Promise<SVEGame[]>;
    leave(player: SVEAccount): void;
    getAsInitializer(): GameInfo;
}
//# sourceMappingURL=SVEGame.d.ts.map