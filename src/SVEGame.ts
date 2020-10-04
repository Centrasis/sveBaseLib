import { promises } from "fs";
import { SVEAccount } from "./SVEAccount";
import { SVESystemInfo } from "./SVESystemInfo";

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

export class SVEGame {
    public host: string;
    public name: string;
    public gameType: string;
    public maxPlayers: number;
    protected socket: WebSocket | undefined;

    constructor(host: string, name: string, gameType: string, maxPlayers: number) {
        this.host = host;
        this.name = name;
        this.gameType = gameType;
        this.maxPlayers = maxPlayers;
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
                            list.push(new SVEGame(gi.host, gi.name, gi.gameType, gi.maxPlayers));
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
            name: this.name
        }
    }
}