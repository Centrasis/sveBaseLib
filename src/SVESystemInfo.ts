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
}

export {
    SVESystemInfo
}