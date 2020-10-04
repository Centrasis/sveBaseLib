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

    constructor(host: string, name: string, gameType: string, maxPlayers: number) {
        this.host = host;
        this.name = name;
        this.gameType = gameType;
        this.maxPlayers = maxPlayers;
    }

    public join(player: SVEAccount, game: string) {
        
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