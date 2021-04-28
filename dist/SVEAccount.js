"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginState = exports.SVEAccount = exports.isBasicUserInitializer = exports.isSessionUserInitializer = exports.isTokenInfo = exports.isLoginInfo = exports.SessionUserInitializerType = void 0;
var SVESystemInfo_1 = require("./SVESystemInfo");
var SVEToken_1 = require("./SVEToken");
var LoginState;
(function (LoginState) {
    LoginState[LoginState["NotLoggedIn"] = 1] = "NotLoggedIn";
    LoginState[LoginState["LoggedInByUser"] = 2] = "LoggedInByUser";
    LoginState[LoginState["LoggedInByToken"] = 3] = "LoggedInByToken";
})(LoginState || (LoginState = {}));
exports.LoginState = LoginState;
;
var SessionUserInitializerType = /** @class */ (function () {
    function SessionUserInitializerType(init) {
        this.sessionID = "";
        this.loginState = LoginState.NotLoggedIn;
        this.name = "";
        this.id = -1;
        this.id = init.id;
        this.name = init.name;
        this.loginState = init.loginState;
        this.sessionID = init.sessionID;
    }
    return SessionUserInitializerType;
}());
exports.SessionUserInitializerType = SessionUserInitializerType;
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
        if (user === undefined || user === null) {
            this.loginState = LoginState.NotLoggedIn;
            if (onLogin !== undefined)
                onLogin(this);
            return;
        }
        if (typeof user === "string") {
            this.loginState = LoginState.NotLoggedIn;
            fetch(SVESystemInfo_1.SVESystemInfo.getAccountServiceRoot() + '/check?sessionID=' + user, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (r) {
                        if (r.loggedInAs !== undefined) {
                            _this.loginState = LoginState.LoggedInByUser;
                            _this.sessionID = r.loggedInAs.sessionID;
                            _this.loginState = r.loggedInAs.loginState;
                            _this.name = r.loggedInAs.name;
                            _this.id = r.loggedInAs.id;
                        }
                        if (onLogin !== undefined)
                            onLogin(_this);
                    }, function (err) {
                        if (onLogin !== undefined)
                            onLogin(_this);
                    });
                }
            }, function (err) {
                if (onLogin !== undefined)
                    onLogin(_this);
            });
        }
        else {
            if (isLoginInfo(user) || isTokenInfo(user)) {
                this.init(LoginState.NotLoggedIn);
                if (isTokenInfo(user)) {
                    this.doTokenLogin({
                        target: user.user,
                        type: SVEToken_1.TokenType.DeviceToken,
                        time: new Date(),
                        deviceAgent: "",
                        name: "",
                        token: user.token
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
                    this.getByID(user.id, user.requester).then(function (val) {
                        if (onLogin !== undefined)
                            onLogin(_this);
                    }, function (err) {
                        if (onLogin !== undefined)
                            onLogin(_this);
                    });
                }
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
    SVEAccount.prototype.getInitializer = function () {
        return {
            id: this.id,
            loginState: this.loginState,
            name: this.name,
            sessionID: this.sessionID
        };
    };
    SVEAccount.registerNewUser = function (login, token) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getAccountServiceRoot() + '/user/new', {
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
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        new SVEAccount({ pass: login.pass, name: login.name }, function (usr) {
                            resolve(usr);
                        });
                    });
                }
                else {
                    reject();
                }
            }, function (err) { return reject(err); });
        });
    };
    SVEAccount.registerTemporaryUser = function (name) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getAccountServiceRoot() + '/user/new', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newUser: name,
                    temporary: true
                })
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        new SVEAccount({
                            name: val.name,
                            id: val.id,
                            sessionID: val.sessionID,
                            loginState: val.loginState
                        }, function (usr) { return resolve(usr); });
                    }, function (err) { return reject(err); });
                }
                else {
                    reject();
                }
            }, function (err) { return reject(err); });
        });
    };
    SVEAccount.prototype.changePassword = function (oldPw, newPw) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getAccountServiceRoot() + '/user/change/pw', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oldPassword: oldPw,
                    newPassword: newPw,
                    sessionID: _this.sessionID
                })
            }).then(function (response) {
                resolve(response.status < 400);
            }, function (err) { return reject(err); });
        });
    };
    SVEAccount.prototype.setEmail = function (email) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getAccountServiceRoot() + '/user/change/email', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    sessionID: _this.sessionID
                })
            }).then(function (response) {
                resolve(response.status < 400);
            }, function (err) { return reject(err); });
        });
    };
    SVEAccount.prototype.getSessionID = function () {
        return this.sessionID;
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
    SVEAccount.prototype.getByID = function (id, requester) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getAccountServiceRoot() + '/user/' + id + '?sessionID=' + encodeURI(requester.getSessionID()), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        _this.init(LoginState.NotLoggedIn);
                        _this.name = val.name;
                        _this.id = val.id;
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
            if (SVESystemInfo_1.SVESystemInfo.getAccountServiceRoot() !== undefined) {
                fetch(SVESystemInfo_1.SVESystemInfo.getAccountServiceRoot() + '/doLogin', {
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
                                _this.sessionID = val.sessionID;
                                _this.init(LoginState.LoggedInByUser);
                            }
                            resolve(_this.loginState);
                        }, function (err) { return reject(err); });
                    }
                    else {
                        reject();
                    }
                }, function (err) { return reject(err); });
            }
            else {
                reject(_this.loginState);
            }
        });
    };
    SVEAccount.prototype.createLoginToken = function () {
        return SVEToken_1.SVEToken.register(this, SVEToken_1.TokenType.DeviceToken, this);
    };
    SVEAccount.prototype.doTokenLogin = function (token) {
        var _this = this;
        token.type = SVEToken_1.TokenType.DeviceToken;
        return new Promise(function (resolve, reject) {
            if (SVESystemInfo_1.SVESystemInfo.getAuthRoot() !== undefined) {
                fetch(SVESystemInfo_1.SVESystemInfo.getAuthRoot() + '/token/use', {
                    method: 'POST',
                    body: JSON.stringify(token),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    if (response.status < 400) {
                        response.json().then(function (val) {
                            var userInit = val;
                            _this.name = userInit.name;
                            _this.id = userInit.id;
                            _this.sessionID = userInit.sessionID;
                            _this.init(LoginState.LoggedInByToken);
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
