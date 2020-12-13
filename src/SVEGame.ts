import Peer from 'peerjs';
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

export class SVEGame {
    public host: string;
    public name: string;
    public gameType: string;
    public maxPlayers: number;
    public hostPeerID: string = "";
    protected socket?: Peer = undefined;
    protected localPlayer?: SVEAccount;
    protected playerList: SVEAccount[] = [];
    protected connections: Peer.DataConnection[] = [];
    private isHost: boolean = false;
    public gameState: GameState = GameState.Undetermined;
    protected peerOpts: Peer.PeerJSOption = {
        host:"/",
        path: "/peer",
        secure: true
    }

    constructor(info: GameInfo) {
        this.host = info.host;
        this.hostPeerID = (info.peerID !== undefined) ? info.peerID : "";
        this.name = info.name;
        this.gameType = info.gameType;
        this.maxPlayers = info.maxPlayers;
        this.gameState = info.gameState;
    }

    public getIsHost(): boolean {
        return this.isHost;
    }

    protected setupHostPeerConnection(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.socket!.on("connection", (c) => {
                c.on('open', () => {
                    console.log("New player connection");
                });

                c.on('close', () => {
                    console.log("A player connection was closed");
                });

                c.on('data', (e:any) => {
                    this.onRequest(JSON.parse(e as string) as GameRequest);
                });

                c.on('error', (err) => {
                    console.log("An peer error occured: " + JSON.stringify(err));
                });

                if (this.connections.length < this.maxPlayers - 1) {
                    this.connections.push(c);
                } else {
                    c.close();
                }
            });

            resolve();
        });
    }

    protected setupPeerConnection(peerID:string): Promise<Peer.DataConnection> {
        return new Promise<Peer.DataConnection>((resolve, reject) => {
            const conn = this.socket!.connect(peerID);
            let returned = false;
            conn.on('open', () => {
                console.log("Connected with game: " + this.name);
                returned = true;
                resolve(conn);
            });
    
            conn.on('data', (e:any) => {
                this.onRequest(e as GameRequest);
            });
    
            conn.on('close', () => {
                console.log("End game: " + this.name);
                this.onEnd();
                if (!returned) {
                    returned = true;
                    reject(null);
                }
            });
    
            conn.on('error', (err:any) => {
                console.log("Error with game connection: " + JSON.stringify(err));
                this.onEnd();
                if (!returned) {
                    returned = true;
                    reject(err);
                }
            });
        });
    }

    public join(localPlayer: SVEAccount): Peer {
        console.log("Try join game: " + this.name);
        this.socket = new Peer(this.peerOpts);

        this.setupPeerConnection(this.hostPeerID).then((c) => {
            this.connections = [c];
            this.localPlayer = localPlayer;
            this.sendGameRequest({
                action: "join",
                target: {
                    type: TargetType.Game,
                    id: ""
                },
                invoker: this.localPlayer.getName()
            });
        });

        return this.socket;
    }

    public onJoined(player: SVEAccount) {
        this.playerList.push(player);
    }

    public onEnd() {

    }

    public onRequest(req: GameRequest) {
        if (typeof req.action === "string") {
            if (req.action === "join" && req.target !== undefined) {
                if (req.target.type === TargetType.Game) {
                    if (this.connections.length <= this.maxPlayers) {
                        this.sendGameRequest({
                            action: "join:OK",
                            target: {
                                id: req.invoker,
                                type: TargetType.Player
                            },
                            invoker: this.localPlayer!.getName()
                        });
                    } else {
                        this.sendGameRequest({
                            action: "join:REJECT",
                            target: {
                                id: req.invoker,
                                type: TargetType.Player
                            },
                            invoker: this.localPlayer!.getName()
                        });
                    }
                }
            }
            if (req.action === "join:OK" && req.target !== undefined) {
                this.host = req.invoker;
                if (req.target.type === TargetType.Player) {
                    if (req.target.id === this.localPlayer!.getName()) {
                        this.onJoined(this.localPlayer!);
                    } else {
                        new SVEAccount({name: req.target.id, id: -1, sessionID: "", loginState: LoginState.NotLoggedIn}, (usr) => {
                            this.onJoined(usr);
                        });
                    }
                }
            }
            if (req.action === "playersList?" && this.getIsHost()) {
                let list: string[] = [];
                this.playerList.forEach(p => list.push(p.getName()));
                this.sendGameRequest({
                    action: {
                        field: "playersList",
                        value: JSON.stringify(list)
                    },
                    invoker: this.localPlayer!.getName()
                });
            }
        } else {
            if (req.action.field === "playersList") {
                this.host = req.invoker;
                this.playerList = [];
                (JSON.parse(req.action.value) as string[]).forEach(p => {
                    new SVEAccount({name: p, id: -1, sessionID: "", loginState: LoginState.NotLoggedIn}, (usr) => {
                        this.playerList.push(usr);
                    });
                });
            }
        }
    }

    public create(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.socket = new Peer(this.peerOpts);
            this.hostPeerID = this.socket.id;
            this.isHost = true;
            this.setupHostPeerConnection().then(() => {
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
        this.playerList = this.playerList.filter((v) => v.getName() === player.getName());
    }

    public getAsInitializer(): GameInfo {
        return {
            gameType: this.gameType,
            host: this.host,
            maxPlayers: this.maxPlayers,
            name: this.name,
            gameState: this.gameState,
            peerID: this.hostPeerID
        }
    }

    public sendGameRequest(req: GameRequest) {
        this.connections.forEach(c => c.send(req));
    }
}