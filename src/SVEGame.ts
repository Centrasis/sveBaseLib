import { LoginState, SVEAccount } from "./SVEAccount";
import { SVESystemInfo } from "./SVESystemInfo";

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

export enum GameState {
    Undetermined,
    Won,
    Lost
}

export interface SetDataRequest {
    field: string,
    value: any
}

export enum TargetType {
    Player,
    Game,
    Entity
}

export interface ActionTarget {
    type: TargetType,
    id: string
}

export interface GameRequest {
    invoker: string;
    target?: ActionTarget;
    action: string | SetDataRequest;
}

export enum GameRejectReason {
    GameNotPresent,
    PlayerLimitExceeded
}