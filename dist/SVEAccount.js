var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
                    _this.loginState = val;
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
            this.name = initObj["name"];
            this.id = initObj["id"];
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
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var response;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch(SVESystemInfo.getInstance().sources.sveService + '/user/' + id, {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                }
                            })];
                        case 1:
                            response = _a.sent();
                            if (response.status < 400) {
                                response.json().then(function (val) {
                                    _this.init(val, LoginState.NotLoggedIn);
                                    resolve(true);
                                });
                            }
                            else {
                                reject(false);
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    SVEAccount.prototype.doLogin = function (info) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (SVESystemInfo.getInstance().sources.sveService !== undefined) {
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var response;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fetch(SVESystemInfo.getInstance().sources.sveService + '/doLogin', {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        name: info.name,
                                        pw: info.pass
                                    }),
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    }
                                })];
                            case 1:
                                response = _a.sent();
                                if (response.status < 400) {
                                    response.json().then(function (val) {
                                        if (val.success === true) {
                                            _this.init(val, LoginState.LoggedInByUser);
                                        }
                                        resolve(_this.loginState);
                                    });
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
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
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var response;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fetch(SVESystemInfo.getInstance().sources.sveService + '/doLogin', {
                                    method: 'POST',
                                    body: JSON.stringify({ token: token }),
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    }
                                })];
                            case 1:
                                response = _a.sent();
                                if (response.status < 400) {
                                    response.json().then(function (val) {
                                        if (val.success === true) {
                                            _this.init(val, LoginState.LoggedInByToken);
                                        }
                                        resolve(_this.loginState);
                                    });
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
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
