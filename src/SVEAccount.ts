import {SVESystemInfo} from './SVESystemInfo';
import {TokenUserLoginInfo, Token, TokenType, SVEToken} from './SVEToken';

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

    public getInitializer(): SessionUserInitializer {
        return {
            id: this.id,
            loginState: this.loginState,
            name: this.name,
            sessionID: ""
        };
    }

    public static registerNewUser(login: BasicUserLoginInfo, token: SVEToken): Promise<SVEAccount> {
        return new Promise<SVEAccount>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + '/user/new', {
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
            fetch(SVESystemInfo.getAPIRoot() + '/user/change/pw', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    oldPassword: oldPw,
                    newPassword: newPw
                })
            }).then(response => {
                resolve(response.status < 400);
            }, err => reject(err));
        });
    }

    public setEmail(email: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fetch(SVESystemInfo.getAPIRoot() + '/user/change/email', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    email: email
                })
            }).then(response => {
                resolve(response.status < 400);
            }, err => reject(err));
        });
    }

    // if onLogin is set a login will be perfomed. Otherwise the class will only be created
    public constructor(user: SessionUserInitializer | BasicUserLoginInfo | BasicUserInitializer | TokenUserLoginInfo, onLogin?: (state: SVEAccount) => void) {
        if(isLoginInfo(user) || isTokenInfo(user)) {
            this.init(LoginState.NotLoggedIn);

            if (isTokenInfo(user)) {
                this.doTokenLogin({
                    user: (user as TokenUserLoginInfo).user,
                    token: (user as TokenUserLoginInfo).token,
                    ressource: this.id,
                    type: TokenType.DeviceToken,
                    time: new Date()
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

    protected init(state: LoginState) {
        if (state !== LoginState.NotLoggedIn) {
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
            if (SVESystemInfo.getInstance().sources.sveService !== undefined) {
                fetch(SVESystemInfo.getInstance().sources.sveService + '/doLogin', {
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
        return SVEToken.register(TokenType.DeviceToken, this);
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
                                this.name = val.user;
                                this.id = val.id;
                                this.init(LoginState.LoggedInByToken);
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