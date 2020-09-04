"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginState = exports.SVEAccount = exports.isBasicUserInitializer = exports.isSessionUserInitializer = exports.isTokenInfo = exports.isLoginInfo = exports.TokenType = void 0;
var SVESystemInfo_1 = require("./SVESystemInfo");
/*const user = sql.define<"user", { id: number; name: string; password: string }>({
    name: 'user',
    columns: {
        id: {dataType: "number"},
        name: {dataType: "string"},
        password: {dataType: "string"}
    },
    schema: "snowvision_db"
});*/
var TokenType;
(function (TokenType) {
    TokenType[TokenType["RessourceToken"] = 1] = "RessourceToken";
    TokenType[TokenType["DeviceToken"] = 2] = "DeviceToken";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
;
var LoginState;
(function (LoginState) {
    LoginState[LoginState["NotLoggedIn"] = 1] = "NotLoggedIn";
    LoginState[LoginState["LoggedInByUser"] = 2] = "LoggedInByUser";
    LoginState[LoginState["LoggedInByToken"] = 3] = "LoggedInByToken";
})(LoginState || (LoginState = {}));
exports.LoginState = LoginState;
;
function isLoginInfo(info) {
    return "name" in info && "pass" in info;
}
exports.isLoginInfo = isLoginInfo;
function isTokenInfo(info) {
    return "name" in info && "token" in info && !isLoginInfo(info);
}
exports.isTokenInfo = isTokenInfo;
function isSessionUserInitializer(info) {
    return "sessionID" in info && "loginState" in info;
}
exports.isSessionUserInitializer = isSessionUserInitializer;
function isBasicUserInitializer(info) {
    return "id" in info && !isLoginInfo(info) && !isSessionUserInitializer(info);
}
exports.isBasicUserInitializer = isBasicUserInitializer;
var SVEAccount = /** @class */ (function () {
    // if onLogin is set a login will be perfomed. Otherwise the class will only be created
    function SVEAccount(user, onLogin) {
        var _this = this;
        this.loginState = LoginState.NotLoggedIn;
        this.name = "";
        this.id = NaN;
        this.sessionID = "";
        if (isLoginInfo(user) || isTokenInfo(user)) {
            this.init(null, LoginState.NotLoggedIn);
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
    SVEAccount.prototype.init = function (initObj, state) {
        if (initObj !== null) {
            this.name = initObj.name;
            this.id = initObj.id;
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
            fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/user/' + id, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        _this.init(val, LoginState.NotLoggedIn);
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
            if (SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService !== undefined) {
                fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/doLogin', {
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
                                _this.init(val, LoginState.LoggedInByUser);
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
            if (SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService !== undefined) {
                fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/doLogin', {
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
                                _this.init(val, LoginState.LoggedInByToken);
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
exports.SVEAccount = SVEAccount;
