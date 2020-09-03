import {SVESystemInfo} from './SVESystemInfo';

/*const user = sql.define<"user", { id: number; name: string; password: string }>({
    name: 'user',
    columns: { 
        id: {dataType: "number"}, 
        name: {dataType: "string"}, 
        password: {dataType: "string"}
    },
    schema: "snowvision_db"
});*/

export enum TokenType {
    RessourceToken = 1,
    DeviceToken
};

export interface BasicUserInitializer {
    name: string;
    id: number;
}

enum LoginState {
    NotLoggedIn = 1,
    LoggedInByUser,
    LoggedInByToken
};

export interface SessionUserInitializer extends BasicUserInitializer {
    sessionID: string;
    loginState: LoginState;
}

export interface BasicUserLoginInfo {
    name: string,
    pass: string
}

export interface TokenUserLoginInfo {
    name: string,
    token: string
}

export interface Token {
    user: String,
    token: String,
    type: TokenType,
    time: Date,
    ressource: String
}

export function isLoginInfo(info: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo): boolean {
    return "name" in info && "pass" in info;
}

export function isTokenInfo(info: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo): boolean {
    return "name" in info && "token" in info && !isLoginInfo(info);
}

export function isSessionUserInitializer(info: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo): boolean {
    return "sessionID" in info && "loginState" in info;
}

export function isBasicUserInitializer(info: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo): boolean {
    return "id" in info && !isLoginInfo(info) && !isSessionUserInitializer(info);
}

export class SVEAccount {
    protected loginState: LoginState = LoginState.NotLoggedIn;
    protected name: string = "";
    protected id: number = NaN;
    protected sessionID: string = "";

    public getID(): number {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public setSessionID(id: string) {
        this.sessionID = id;
    }

    public getLoginState(): LoginState {
        return this.loginState;
    }

    // if onLogin is set a login will be perfomed. Otherwise the class will only be created
    public constructor(user: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo, onLogin?: (state: SVEAccount) => void) {
        if(isLoginInfo(user) || isTokenInfo(user)) {
            this.init(null, LoginState.NotLoggedIn);

            if (isTokenInfo(user)) {
                this.doTokenLogin({
                    user: (user as TokenUserLoginInfo).name,
                    token: (user as TokenUserLoginInfo).token,
                    ressource: "LogIn",
                    type: TokenType.DeviceToken,
                    time: new Date()
                }).then((val: LoginState) => {
                    this.loginState = val;
                    if(onLogin !== undefined)
                        onLogin!(this);
                }, (val: LoginState) => {
                    this.loginState = val;
                    if(onLogin !== undefined)
                        onLogin!(this);
                });
            } else {
                this.doLogin(user as BasicUserLoginInfo).then((val: LoginState) => {
                    this.loginState = val;
                    if(onLogin !== undefined)
                        onLogin!(this);
                }, (val: LoginState) => {
                    this.loginState = val;
                    if(onLogin !== undefined)
                        onLogin!(this);
                });
            }
        } else {
            if (isSessionUserInitializer(user)) {
                this.sessionID = (user as SessionUserInitializer).sessionID;
                this.loginState = (user as SessionUserInitializer).loginState;
                this.name = (user as SessionUserInitializer).name;
                this.id = (user as SessionUserInitializer).id;
                if(onLogin !== undefined)
                    onLogin!(this);
            } else {
                this.getByID((user as BasicUserInitializer).id).then(val => {
                    if(onLogin !== undefined)
                        onLogin!(this);
                }, err => {
                    if(onLogin !== undefined)
                        onLogin!(this);
                });
            }
        }
    }

    protected init(initObj: any, state: LoginState) {
        if (initObj !== null) {
            this.name = initObj["name"];
            this.id = initObj["id"];
            this.loginState = state;
        } else {
            this.name = "";
            this.id = NaN;
            this.loginState = LoginState.NotLoggedIn;
        }
    }

    protected getByID(id: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.sveService + '/user/' + id, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
            }).then(response => {
                if (response.status < 400) {
                    response.json().then((val) => {
                        this.init(val, LoginState.NotLoggedIn);
                        resolve(true);
                    });
                } else {
                    reject(false);
                }
            }, err => reject(err));
        });
    }

    protected doLogin(info: BasicUserLoginInfo): Promise<LoginState> {
        return new Promise<LoginState>((resolve, reject) => {
            if (SVESystemInfo.getInstance().sources.sveService !== undefined) {
                fetch(SVESystemInfo.getInstance().sources.sveService + '/doLogin', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: info.name,
                            pw: info.pass
                        }),
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json' 
                        }
                }).then(response => {
                    if (response.status < 400) {
                        response.json().then((val) => {
                            if(val.success === true) {
                                this.init(val, LoginState.LoggedInByUser);
                            }
                            resolve(this.loginState);
                        });  
                    }
                }, err => reject(err));
            } else {
                reject(this.loginState);
            }
        });
    }

    public createTokenFor(ressource: String, user: String): Promise<Token> {
        return new Promise<Token>((resolve, reject) => {
            reject({});
        });
    }

    protected doTokenLogin(token: Token): Promise<LoginState> {
        return new Promise<LoginState>((resolve, reject) => {
            if (SVESystemInfo.getInstance().sources.sveService !== undefined) {
                fetch(SVESystemInfo.getInstance().sources.sveService + '/doLogin', {
                        method: 'POST',
                        body: JSON.stringify({token}),
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json' 
                        }
                }).then(response => {
                    if (response.status < 400) {
                        response.json().then((val) => {
                            if(val.success === true) {
                                this.init(val, LoginState.LoggedInByToken);
                            }
                            resolve(this.loginState);
                        });  
                    }
                }, err => reject(err));
            } else {
                reject(this.loginState);
            }
        });
    }

    public getState(): LoginState {
        return this.loginState;
    }
}

export {
    LoginState
}