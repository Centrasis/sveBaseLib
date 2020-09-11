import { SVESystemInfo } from './SVESystemInfo';
/*const user = sql.define<"user", { id: number; name: string; password: string }>({
    name: 'user',
    columns: {
        id: {dataType: "number"},
        name: {dataType: "string"},
        password: {dataType: "string"}
    },
    schema: "snowvision_db"
});*/
export var TokenType;
(function (TokenType) {
    TokenType[TokenType["RessourceToken"] = 1] = "RessourceToken";
    TokenType[TokenType["DeviceToken"] = 2] = "DeviceToken";
})(TokenType || (TokenType = {}));
;
var LoginState;
(function (LoginState) {
    LoginState[LoginState["NotLoggedIn"] = 1] = "NotLoggedIn";
    LoginState[LoginState["LoggedInByUser"] = 2] = "LoggedInByUser";
    LoginState[LoginState["LoggedInByToken"] = 3] = "LoggedInByToken";
})(LoginState || (LoginState = {}));
;
export function isLoginInfo(info) {
    return "name" in info && "pass" in info;
}
export function isTokenInfo(info) {
    return "name" in info && "token" in info && !isLoginInfo(info);
}
export function isSessionUserInitializer(info) {
    return "sessionID" in info && "loginState" in info;
}
export function isBasicUserInitializer(info) {
    return "id" in info && !isLoginInfo(info) && !isSessionUserInitializer(info);
}
var SVEAccount = /** @class */ (function () {
    // if onLogin is set a login will be perfomed. Otherwise the class will only be created
    function SVEAccount(user, onLogin) {
        var _this = this;
        this.loginState = LoginState.NotLoggedIn;
        this.name = "";
        this.id = NaN;
        this.sessionID = "";
        if (isLoginInfo(user) || isTokenInfo(user)) {
            this.init(LoginState.NotLoggedIn);
            if (isTokenInfo(user)) {
                this.doTokenLogin({
                    user: user.name,
                    token: user.token,
                    ressource: "LogIn",
                    type: TokenType.DeviceToken,
                    time: new Date()
                }).then(function (val) {
                    _this.loginState = val;
                    if (onLogin !== undefined)
                        onLogin(_this);
                }, function (val) {
                    _this.loginState = val;
                    if (onLogin !== undefined)
                        onLogin(_this);
                });
            }
            else {
                this.doLogin(user).then(function (val) {
                    _this.loginState = val;
                    if (onLogin !== undefined)
                        onLogin(_this);
                }, function (val) {
                    _this.loginState = LoginState.NotLoggedIn;
                    if (onLogin !== undefined)
                        onLogin(_this);
                });
            }
        }
        else {
            if (isSessionUserInitializer(user)) {
                this.sessionID = user.sessionID;
                this.loginState = user.loginState;
                this.name = user.name;
                this.id = user.id;
                if (onLogin !== undefined)
                    onLogin(this);
            }
            else {
                this.getByID(user.id).then(function (val) {
                    if (onLogin !== undefined)
                        onLogin(_this);
                }, function (err) {
                    if (onLogin !== undefined)
                        onLogin(_this);
                });
            }
        }
    }
    SVEAccount.prototype.getID = function () {
        return this.id;
    };
    SVEAccount.prototype.getName = function () {
        return this.name;
    };
    SVEAccount.prototype.setSessionID = function (id) {
        this.sessionID = id;
    };
    SVEAccount.prototype.getLoginState = function () {
        return this.loginState;
    };
    SVEAccount.prototype.init = function (state) {
        if (state !== LoginState.NotLoggedIn) {
            this.loginState = state;
        }
        else {
            this.name = "";
            this.id = NaN;
            this.loginState = LoginState.NotLoggedIn;
        }
    };
    SVEAccount.prototype.getByID = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getInstance().sources.sveService + '/user/' + id, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        _this.name = val.name;
                        _this.id = val.id;
                        _this.init(LoginState.NotLoggedIn);
                        resolve(true);
                    });
                }
                else {
                    reject(false);
                }
            }, function (err) { return reject(err); });
        });
    };
    SVEAccount.prototype.doLogin = function (info) {
        var _this = this;
        return new Promise(function (resolve, reject) {
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
                }).then(function (response) {
                    if (response.status < 400) {
                        response.json().then(function (val) {
                            if (val.success === true) {
                                _this.name = val.user;
                                _this.id = val.id;
                                _this.init(LoginState.LoggedInByUser);
                            }
                            resolve(_this.loginState);
                        }, function (err) { return reject(err); });
                    }
                }, function (err) { return reject(err); });
            }
            else {
                reject(_this.loginState);
            }
        });
    };
    SVEAccount.prototype.createTokenFor = function (ressource, user) {
        return new Promise(function (resolve, reject) {
            reject({});
        });
    };
    SVEAccount.prototype.doTokenLogin = function (token) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (SVESystemInfo.getInstance().sources.sveService !== undefined) {
                fetch(SVESystemInfo.getInstance().sources.sveService + '/doLogin', {
                    method: 'POST',
                    body: JSON.stringify({ token: token }),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    if (response.status < 400) {
                        response.json().then(function (val) {
                            if (val.success === true) {
                                _this.name = val.user;
                                _this.id = val.id;
                                _this.init(LoginState.LoggedInByToken);
                            }
                            resolve(_this.loginState);
                        });
                    }
                }, function (err) { return reject(err); });
            }
            else {
                reject(_this.loginState);
            }
        });
    };
    SVEAccount.prototype.getState = function () {
        return this.loginState;
    };
    return SVEAccount;
}());
export { SVEAccount };
export { LoginState };
