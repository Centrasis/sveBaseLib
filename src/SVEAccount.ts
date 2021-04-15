import {SVESystemInfo} from './SVESystemInfo';
import {TokenUserLoginInfo, Token, TokenType, SVEToken} from './SVEToken';

export interface BasicUserInitializer {
    name: string;
    id: number;
    requester?: SVEAccount;
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

export class SessionUserInitializerType implements SessionUserInitializer {
    public sessionID: string = "";
    public loginState: LoginState = LoginState.NotLoggedIn;
    public name: string = "";
    public id: number = -1;

    constructor(init: SessionUserInitializer) {
        this.id = init.id;
        this.name = init.name;
        this.loginState = init.loginState;
        this.sessionID = init.sessionID;
    }
}

export interface BasicUserLoginInfo {
    name: string,
    pass: string
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

    public getInitializer(): SessionUserInitializerType {
        return {
            id: this.id,
            loginState: this.loginState,
            name: this.name,
            sessionID: this.sessionID
        };
    }

    public static registerNewUser(login: BasicUserLoginInfo, token: SVEToken): Promise<SVEAccount> {
        return new Promise<SVEAccount>((resolve, reject) => {
            fetch(SVESystemInfo.getAccountServiceRoot() + '/user/new', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    newUser: login.name,
                    newPassword: login.pass,
                    token: token
                })
            }).then(response => {
                if(response.status < 400) {
                    response.json().then(val => {
                        new SVEAccount({ pass: login.pass, name: login.name } as BasicUserLoginInfo, (usr) => {
                            resolve(usr);
                        });
                    });
                } else {
                    reject();
                }
            }, err => reject(err));
        });
    }

    public changePassword(oldPw: string, newPw: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fetch(SVESystemInfo.getAccountServiceRoot() + '/user/change/pw', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    oldPassword: oldPw,
                    newPassword: newPw,
                    sessionID: this.sessionID
                })
            }).then(response => {
                resolve(response.status < 400);
            }, err => reject(err));
        });
    }

    public setEmail(email: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fetch(SVESystemInfo.getAccountServiceRoot() + '/user/change/email', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    email: email,
                    sessionID: this.sessionID
                })
            }).then(response => {
                resolve(response.status < 400);
            }, err => reject(err));
        });
    }

    public getSessionID(): string {
        return this.sessionID;
    }

    // if onLogin is set a login will be perfomed. Otherwise the class will only be created
    public constructor(user: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo | string, onLogin?: (state: SVEAccount) => void) {
        if(user === undefined || user === null) {
            this.loginState = LoginState.NotLoggedIn;
            if(onLogin !== undefined)
                onLogin(this);
            return;
        }
        
        if (typeof user === "string") {
            this.loginState = LoginState.NotLoggedIn;
            fetch(SVESystemInfo.getAccountServiceRoot() + '/check?sessionID=' + user, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
            }).then(response => {
                if (response.status < 400) {
                    response.json().then(r => {
                        if (r.loggedInAs !== undefined) {
                            this.loginState = LoginState.LoggedInByUser;
                            this.sessionID = (r.loggedInAs as SessionUserInitializer).sessionID;
                            this.loginState = (r.loggedInAs as SessionUserInitializer).loginState;
                            this.name = (r.loggedInAs as SessionUserInitializer).name;
                            this.id = (r.loggedInAs as SessionUserInitializer).id;
                        }

                        if(onLogin !== undefined) 
                            onLogin(this);
                    }, err => {
                        if(onLogin !== undefined) 
                            onLogin(this);
                    });
                }
            }, err => {
                if(onLogin !== undefined) 
                    onLogin(this);
            });
        } else {
            if(isLoginInfo(user) || isTokenInfo(user)) {
                this.init(LoginState.NotLoggedIn);

                if (isTokenInfo(user)) {
                    this.doTokenLogin({
                        target: (user as TokenUserLoginInfo).user!,
                        type: TokenType.DeviceToken,
                        time: new Date(),
                        deviceAgent: "",
                        name: "",
                        token: (user as TokenUserLoginInfo).token
                    }).then((val: LoginState) => {
                        this.loginState = val as LoginState;
                        if(onLogin !== undefined)
                            onLogin!(this);
                    }, (val: LoginState) => {
                        this.loginState = val;
                        if(onLogin !== undefined)
                            onLogin!(this);
                    });
                } else {
                    this.doLogin(user as BasicUserLoginInfo).then((val: LoginState) => {
                        this.loginState = val as LoginState;
                        if(onLogin !== undefined)
                            onLogin!(this);
                    }, (val: any) => {
                        this.loginState = LoginState.NotLoggedIn;
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
                    this.getByID((user as BasicUserInitializer).id, (user as BasicUserInitializer).requester!).then(val => {
                        if(onLogin !== undefined)
                            onLogin!(this);
                    }, err => {
                        if(onLogin !== undefined)
                            onLogin!(this);
                    });
                }
            }
        }
    }

    protected init(state: LoginState) {
        if (state !== LoginState.NotLoggedIn) {
            this.loginState = state;
        } else {
            this.name = "";
            this.id = NaN;
            this.loginState = LoginState.NotLoggedIn;
        }
    }

    protected getByID(id: number, requester: SVEAccount): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fetch(SVESystemInfo.getAccountServiceRoot() + '/user/' + id + '?sessionID=' + encodeURI(requester.getSessionID()), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    }
            }).then(response => {
                if (response.status < 400) {
                    response.json().then((val) => {
                        this.init(LoginState.NotLoggedIn);
                        this.name = val.name;
                        this.id = val.id;
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
            if (SVESystemInfo.getAccountServiceRoot() !== undefined) {
                fetch(SVESystemInfo.getAccountServiceRoot() + '/doLogin', {
                        method: 'POST',
                        body: JSON.stringify({
                            user: info.name,
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
                                this.name = val.user;
                                this.id = val.id;
                                this.sessionID = val.sessionID;
                                this.init(LoginState.LoggedInByUser);
                            }
                            resolve(this.loginState);
                        }, err => reject(err));  
                    }
                }, err => reject(err));
            } else {
                reject(this.loginState);
            }
        });
    }

    public createLoginToken(): Promise<string> {
        return SVEToken.register(this, TokenType.DeviceToken, this);
    }

    protected doTokenLogin(token: Token): Promise<LoginState> {
        token.type = TokenType.DeviceToken;
        return new Promise<LoginState>((resolve, reject) => {
            if (SVESystemInfo.getAuthRoot() !== undefined) {
                fetch(SVESystemInfo.getAuthRoot() + '/token/use', {
                        method: 'POST',
                        body: JSON.stringify(token),
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json' 
                        }
                }).then(response => {
                    if (response.status < 400) {
                        response.json().then((val) => {
                            let userInit = val as SessionUserInitializer;
                            this.name = userInit.name;
                            this.id = userInit.id;
                            this.sessionID = userInit.sessionID;
                            this.init(LoginState.LoggedInByToken);
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