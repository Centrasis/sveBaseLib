import { SessionUserInitializer, SVEAccount } from "./SVEAccount";

export interface SVESources {
    sveService?: string;
    accountService?: string;
    authService?: string;
    gameService?: string;
    aiService?: string;
    persistentDatabase?: string | any;
    volatileDatabase?: string | any;
    sveDataPath?: string;
    protocol: "http" | "https";
}

export interface SQLInfo {
    MySQL_User: string;
    MySQL_Password: string;
    MySQL_DB: string;
}

export interface SVESystemState {
    basicSystem: boolean;
    tokenSystem: boolean;
    authorizationSystem: boolean;
}

export interface SVEFullSystemState extends SVESystemState {
    user?: SVEAccount
}

export interface APIStatus {
    status: boolean,
    version: string,
    loggedInAs?: SessionUserInitializer
}

class SVESystemInfo {
    protected static instance: SVESystemInfo;
    protected systemState: SVESystemState = {
        authorizationSystem: false,
        basicSystem: false,
        tokenSystem: false
    };
    protected static isServer: boolean;

    protected constructor() { 
        this.sources = {
            protocol: "https",
            sveService: undefined,
            persistentDatabase: undefined,
            volatileDatabase: undefined
        };
        SVESystemInfo.isServer = false;
    }

    public static checkAPI(api: string): Promise<APIStatus> {
        return new Promise<APIStatus>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.protocol + "://" + api + '/check', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
            }).then(response => {
                if(response.status < 400) {
                    response.json().then(val => {
                        resolve(val as APIStatus);
                    }, err => reject(err));
                } else {
                    reject();
                }
            }, err => reject(err));
        });
    }

    public static getIsServer(): boolean {
        return SVESystemInfo.isServer;
    }

    public static getInstance(): SVESystemInfo {
        if (!SVESystemInfo.instance) {
            SVESystemInfo.instance = new SVESystemInfo();
        }

        return SVESystemInfo.instance;
    }

    public static initSystem(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.instance.systemState = {
                authorizationSystem: false,
                basicSystem: false,
                tokenSystem: false
            };

            if(this.getInstance().sources.sveService !== undefined) {
                fetch(this.getInstance().sources.protocol + "://" + this.getInstance().sources.sveService + '/check',
                    {
                        method: "GET"
                    }).then(response => {
                        if (response.status < 400) {
                            response.json().then(val => {
                                this.instance.systemState = val.status as SVESystemState;
                                resolve(true);
                            }, err => reject(false));
                        } else {
                            reject(false);
                        }
                    }, err => reject(err));
            } else {
                reject(false);
            }
        });
    }

    public sources: SVESources;
    public SQLCredentials: SQLInfo = {
        MySQL_DB: "",
        MySQL_Password: "",
        MySQL_User: ""
    };

    public static getSystemStatus(): SVESystemState {
        return this.getInstance().systemState;
    }

    public static getFullSystemState(): Promise<SVEFullSystemState> {
        return new Promise<SVEFullSystemState>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + "/check", {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
                }).then((response) => {
                    if (response.status < 400) {
                        response.json().then(val => {
                            resolve({
                                authorizationSystem: val.status.authorizationSystem as boolean,
                                basicSystem: val.status.basicSystem as boolean,
                                tokenSystem: val.status.tokenSystem as boolean
                            });
                        }, err => reject({
                            error: "Server response was no valid JSON!",
                            err: err
                        }));
                    } else {
                        reject({
                            error: "Server Status: " + response.status
                        });
                    }
                }, err => {
                    reject(err);
            });
        });
    }

    public static getAPIRoot(): string {
        return (SVESystemInfo.getInstance().sources.sveService !== undefined) ? ((SVESystemInfo.getInstance().sources.sveService!.includes("://")) ? "" : (SVESystemInfo.getInstance().sources.protocol + "://")) + SVESystemInfo.getInstance().sources.sveService! : "";
    }

    public static getAccountServiceRoot(): string {
        return (SVESystemInfo.getInstance().sources.accountService !== undefined) ? ((SVESystemInfo.getInstance().sources.accountService!.includes("://")) ? "" : SVESystemInfo.getInstance().sources.protocol + "://") + SVESystemInfo.getInstance().sources.accountService! : "";
    }

    public static getAuthRoot(): string {
        return (SVESystemInfo.getInstance().sources.authService !== undefined) ? ((SVESystemInfo.getInstance().sources.authService!.includes("://")) ? "" : SVESystemInfo.getInstance().sources.protocol + "://") + SVESystemInfo.getInstance().sources.authService! : "";
    }

    public static getGameRoot(useWebSocket: boolean = false): string {
        let prot: "ws" | "wss" | "http" | "https" | "" = "";
        if (SVESystemInfo.getInstance().sources.gameService !== undefined && !SVESystemInfo.getInstance().sources.gameService!.includes("://")) {
            prot = SVESystemInfo.getInstance().sources.protocol;
            if (useWebSocket) {
                prot = (prot == "http") ? "ws" : "wss";
            }
        }
        let root = (SVESystemInfo.getInstance().sources.gameService !== undefined) ? ((prot.length > 0) ? (prot + "://") : "") + SVESystemInfo.getInstance().sources.gameService! : "";
        if (useWebSocket && (root.includes("http://") || root.includes("https://"))) {
            root = root.replace("https://", "wss://");
            root = root.replace("http://", "ws://");
        }

        return root;
    }

    public static getAIRoot(): string {
        return (SVESystemInfo.getInstance().sources.aiService !== undefined) ? ((SVESystemInfo.getInstance().sources.aiService!.includes("://")) ? "" : SVESystemInfo.getInstance().sources.protocol + "://") + SVESystemInfo.getInstance().sources.aiService! : "";
    }
}

export {
    SVESystemInfo
}