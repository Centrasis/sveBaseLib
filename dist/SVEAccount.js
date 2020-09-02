var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
export class SVEAccount {
    // if onLogin is set a login will be perfomed. Otherwise the class will only be created
    constructor(user, onLogin) {
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
                }).then((val) => {
                    this.loginState = val;
                    if (onLogin !== undefined)
                        onLogin(this);
                }, (val) => {
                    this.loginState = val;
                    if (onLogin !== undefined)
                        onLogin(this);
                });
            }
            else {
                this.doLogin(user).then((val) => {
                    this.loginState = val;
                    if (onLogin !== undefined)
                        onLogin(this);
                }, (val) => {
                    this.loginState = val;
                    if (onLogin !== undefined)
                        onLogin(this);
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
                this.getByID(user.id).then(val => {
                    if (onLogin !== undefined)
                        onLogin(this);
                }, err => {
                    if (onLogin !== undefined)
                        onLogin(this);
                });
            }
        }
    }
    getID() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    setSessionID(id) {
        this.sessionID = id;
    }
    getLoginState() {
        return this.loginState;
    }
    init(initObj, state) {
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
    }
    getByID(id) {
        return new Promise((resolve, reject) => {
            () => __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(SVESystemInfo.getInstance().sources.sveService + '/user/' + id, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status < 400) {
                    response.json().then((val) => {
                        this.init(val, LoginState.NotLoggedIn);
                        resolve(true);
                    });
                }
                else {
                    reject(false);
                }
            });
        });
    }
    doLogin(info) {
        return new Promise((resolve, reject) => {
            if (SVESystemInfo.getInstance().sources.sveService !== undefined) {
                () => __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(SVESystemInfo.getInstance().sources.sveService + '/doLogin', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: info.name,
                            pw: info.pass
                        }),
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.status < 400) {
                        response.json().then((val) => {
                            if (val.success === true) {
                                this.init(val, LoginState.LoggedInByUser);
                            }
                            resolve(this.loginState);
                        });
                    }
                });
            }
            else {
                reject(this.loginState);
            }
        });
    }
    createTokenFor(ressource, user) {
        return new Promise((resolve, reject) => {
            reject({});
        });
    }
    doTokenLogin(token) {
        return new Promise((resolve, reject) => {
            if (SVESystemInfo.getInstance().sources.sveService !== undefined) {
                () => __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(SVESystemInfo.getInstance().sources.sveService + '/doLogin', {
                        method: 'POST',
                        body: JSON.stringify({ token }),
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.status < 400) {
                        response.json().then((val) => {
                            if (val.success === true) {
                                this.init(val, LoginState.LoggedInByToken);
                            }
                            resolve(this.loginState);
                        });
                    }
                });
            }
            else {
                reject(this.loginState);
            }
        });
    }
    getState() {
        return this.loginState;
    }
}
export { LoginState };
