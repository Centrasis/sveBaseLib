import { SessionUserInitializer, SVEAccount } from "./SVEAccount";

export interface SVESources {
    sveService?: string;
    persistentDatabase?: string | any;
    volatileDatabase?: string | any;
    sveDataPath?: string;
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
            sveService: undefined,
            persistentDatabase: undefined,
            volatileDatabase: undefined
        };
        SVESystemInfo.isServer = false;
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
                async () => {
                    const response = await fetch(this.getInstance().sources.sveService + '/check',
                    {
                        method: "GET"
                    });

                    if (response.status < 400) {
                        response.json().then(val => {
                            this.instance.systemState = val.status as SVESystemState;
                            resolve(true);
                        }, err => reject(false));
                    } else {
                        reject(false);
                    }
                };
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
                            if (!("loggedInAs" in val)) {
                                resolve({
                                    authorizationSystem: val.status.authorizationSystem as boolean,
                                    basicSystem: val.status.basicSystem as boolean,
                                    tokenSystem: val.status.tokenSystem as boolean
                                });
                            } else {
                                let loggedInAs = new SVEAccount(val.loggedInAs as SessionUserInitializer, (s) => {
                                    resolve({
                                        authorizationSystem: val.status.authorizationSystem as boolean,
                                        basicSystem: val.status.basicSystem as boolean,
                                        tokenSystem: val.status.tokenSystem as boolean,
                                        user: loggedInAs
                                    });
                                });
                            }
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
        return (SVESystemInfo.getInstance().sources.sveService !== undefined) ? SVESystemInfo.getInstance().sources.sveService! : "";
    }
}

export {
    SVESystemInfo
}