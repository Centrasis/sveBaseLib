"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVESystemInfo = void 0;
var SVEAccount_1 = require("./SVEAccount");
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
                fetch(_this.getInstance().sources.sveService + '/check', {
                    method: "GET"
                }).then(function (response) {
                    if (response.status < 400) {
                        response.json().then(function (val) {
                            _this.instance.systemState = val.status;
                            resolve(true);
                        }, function (err) { return reject(false); });
                    }
                    else {
                        reject(false);
                    }
                }, function (err) { return reject(err); });
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
                            var loggedInAs_1 = new SVEAccount_1.SVEAccount(val.loggedInAs, function (s) {
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
    SVESystemInfo.getAuthRoot = function () {
        return (SVESystemInfo.getInstance().sources.authService !== undefined) ? SVESystemInfo.getInstance().sources.authService : "";
    };
    return SVESystemInfo;
}());
exports.SVESystemInfo = SVESystemInfo;
