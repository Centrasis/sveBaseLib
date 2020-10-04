import { SVEAccount } from "./SVEAccount";
export interface GameInfo {
    name: string;
    host: string;
    maxPlayers: number;
    minPlayers?: number;
    players?: number;
    gameType: string;
    gameState: GameState;
}
export declare enum GameState {
    Undetermined = 0,
    Won = 1,
    Lost = 2
}
export interface SetDataRequest {
    field: string;
    value: any;
}
export declare enum TargetType {
    Player = 0,
    Game = 1,
    Entity = 2
}
export interface ActionTarget {
    type: TargetType;
    id: string;
}
export interface GameRequest {
    invoker: string;
    target?: ActionTarget;
    action: string | SetDataRequest;
}
export declare class SVEGame {
    host: string;
    name: string;
    gameType: string;
    maxPlayers: number;
    protected socket: WebSocket | undefined;
    gameState: GameState;
    constructor(info: GameInfo);
    join(): WebSocket;
    onJoined(): void;
    onEnd(): void;
    onRequest(req: GameRequest): void;
    create(): Promise<void>;
    static getGames(): Promise<SVEGame[]>;
    leave(player: SVEAccount): void;
    getAsInitializer(): GameInfo;
    sendGameRequest(req: GameRequest): void;
}
//# sourceMappingURL=SVEGame.d.ts.map