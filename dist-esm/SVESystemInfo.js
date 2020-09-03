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
import { SVEAccount } from "./SVEAccount";
var SVESystemInfo = /** @class */ (function () {
    function SVESystemInfo() {
        this.systemState = {
            authorizationSystem: false,
            basicSystem: false,
            tokenSystem: false
        };
        this.SQLCredentials = {
            MySQL_DB: "",
            MySQL_Password: "",
            MySQL_User: ""
        };
        this.sources = {
            sveService: undefined,
            persistentDatabase: undefined,
            volatileDatabase: undefined
        };
        SVESystemInfo.isServer = false;
    }
    SVESystemInfo.getIsServer = function () {
        return SVESystemInfo.isServer;
    };
    SVESystemInfo.getInstance = function () {
        if (!SVESystemInfo.instance) {
            SVESystemInfo.instance = new SVESystemInfo();
        }
        return SVESystemInfo.instance;
    };
    SVESystemInfo.initSystem = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.instance.systemState = {
                authorizationSystem: false,
                basicSystem: false,
                tokenSystem: false
            };
            if (_this.getInstance().sources.sveService !== undefined) {
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var response;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fetch(this.getInstance().sources.sveService + '/check', {
                                    method: "GET"
                                })];
                            case 1:
                                response = _a.sent();
                                if (response.status < 400) {
                                    response.json().then(function (val) {
                                        _this.instance.systemState = val.status;
                                        resolve(true);
                                    }, function (err) { return reject(false); });
                                }
                                else {
                                    reject(false);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
            else {
                reject(false);
            }
        });
    };
    SVESystemInfo.getSystemStatus = function () {
        return this.getInstance().systemState;
    };
    SVESystemInfo.getFullSystemState = function () {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAPIRoot() + "/check", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        if (!("loggedInAs" in val)) {
                            resolve({
                                authorizationSystem: val.status.authorizationSystem,
                                basicSystem: val.status.basicSystem,
                                tokenSystem: val.status.tokenSystem
                            });
                        }
                        else {
                            var loggedInAs_1 = new SVEAccount(val.loggedInAs, function (s) {
                                resolve({
                                    authorizationSystem: val.status.authorizationSystem,
                                    basicSystem: val.status.basicSystem,
                                    tokenSystem: val.status.tokenSystem,
                                    user: loggedInAs_1
                                });
                            });
                        }
                    }, function (err) { return reject({
                        error: "Server response was no valid JSON!",
                        err: err
                    }); });
                }
                else {
                    reject({
                        error: "Server Status: " + response.status
                    });
                }
            }, function (err) {
                reject(err);
            });
        });
    };
    SVESystemInfo.getAPIRoot = function () {
        return (SVESystemInfo.getInstance().sources.sveService !== undefined) ? SVESystemInfo.getInstance().sources.sveService : "";
    };
    return SVESystemInfo;
}());
export { SVESystemInfo };
