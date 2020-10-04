import { promises } from "fs";
import { SVEAccount } from "./SVEAccount";
import { SVESystemInfo } from "./SVESystemInfo";

export interface GameInfo {
    name: string;
    host: string;
    maxPlayers: number;
    minPlayers?: number;
    players?: number;
    gameType: string;
    gameState: GameState;
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

export class SVEGame {
    public host: string;
    public name: string;
    public gameType: string;
    public maxPlayers: number;
    protected socket: WebSocket | undefined;
    public gameState: GameState = GameState.Undetermined;

    constructor(info: GameInfo) {
        this.host = info.host;
        this.name = info.name;
        this.gameType = info.gameType;
        this.maxPlayers = info.maxPlayers;
        this.gameState = info.gameState;
    }

    public join(): WebSocket {
        this.socket = new WebSocket("wss://" + window.location.hostname + "/" + SVESystemInfo.getGameRoot() + "/join/" + this.name);
        this.socket.onopen = (e) => {
            this.onJoined();
        };

        this.socket.onmessage = (e) => {
            this.onRequest(JSON.parse(e.data) as GameRequest);
        };

        this.socket.onclose = (e) => {
            this.onEnd();
        };

        return this.socket;
    }

    public onJoined() {

    }

    public onEnd() {

    }

    public onRequest(req: GameRequest) {

    }

    public create(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fetch(SVESystemInfo.getGameRoot() + '/new', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(this.getAsInitializer())
            }).then(response => {
                if(response.status < 400) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    public static getGames(): Promise<SVEGame[]> {
        return new Promise<SVEGame[]>((resolve, reject) => {
            fetch(SVESystemInfo.getGameRoot() + '/list', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                }
            }).then(response => {
                if(response.status < 400) {
                    let list: SVEGame[] = [];
                    response.json().then(val => {
                        val.forEach((gi: GameInfo) => {
                            list.push(new SVEGame(gi));
                        });
                        resolve(list);
                    }, err => reject());
                } else {
                    reject();
                }
            });
        });
    }

    public leave(player: SVEAccount) {
    }

    public getAsInitializer(): GameInfo {
        return {
            gameType: this.gameType,
            host: this.host,
            maxPlayers: this.maxPlayers,
            name: this.name,
            gameState: this.gameState
        }
    }

    public sendGameRequest(req: GameRequest) {
        this.socket!.send(JSON.stringify(req));
    }
}