import Peer from 'peerjs';
import { SVEAccount } from "./SVEAccount";
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
export declare class SVEGame {
    host: string;
    name: string;
    gameType: string;
    maxPlayers: number;
    hostPeerID: string;
    protected socket?: Peer;
    protected localUser?: SVEAccount;
    protected playerList: SVEAccount[];
    protected connections: Peer.DataConnection[];
    private bIsHost;
    private bIsRunning;
    gameState: GameState;
    protected peerOpts: Peer.PeerJSOption;
    constructor(info: GameInfo);
    OnGameRejected(reason: GameRejectReason): void;
    IsHostInstance(): boolean;
    IsRunning(): boolean;
    protected setupHostPeerConnection(): Promise<void>;
    protected setupPeerConnection(peerID: string): Promise<Peer.DataConnection>;
    join(localPlayer: SVEAccount): Peer;
    onJoined(player: SVEAccount): void;
    OnConnected(success: Boolean): void;
    onEnd(): void;
    onStart(): void;
    EndGame(): void;
    StartGame(): void;
    GiveUp(): void;
    SetGameState(gs: GameState): void;
    NotifyPlayer(player: SVEAccount, notification: String): void;
    protected OnGameStateChange(gs: GameState): void;
    onRequest(req: GameRequest): void;
    create(): Promise<void>;
    static getGames(): Promise<GameInfo[]>;
    leave(player: SVEAccount): void;
    getAsInitializer(): GameInfo;
    sendGameRequest(req: GameRequest): void;
}
//# sourceMappingURL=SVEGame.d.ts.map