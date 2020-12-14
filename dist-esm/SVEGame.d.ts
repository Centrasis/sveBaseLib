export interface GameInfo {
    name: string;
    host: string;
    maxPlayers: number;
    minPlayers?: number;
    playersCount?: number;
    gameType: string;
    gameState: GameState;
    peerID?: string;
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
export declare enum GameRejectReason {
    GameNotPresent = 0,
    PlayerLimitExceeded = 1
}
//# sourceMappingURL=SVEGame.d.ts.map