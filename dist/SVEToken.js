"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVEToken = exports.TokenType = void 0;
var SVEAccount_1 = require("./SVEAccount");
var SVESystemInfo_1 = require("./SVESystemInfo");
var TokenType;
(function (TokenType) {
    TokenType[TokenType["RessourceToken"] = 1] = "RessourceToken";
    TokenType[TokenType["DeviceToken"] = 2] = "DeviceToken";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
var SVEToken = /** @class */ (function () {
    function SVEToken(token, type, target, onValidated) {
        var _this = this;
        this.isValid = false;
        this.token = "";
        this.token = token;
        this.type = type;
        this.target = target;
        if (!SVESystemInfo_1.SVESystemInfo.getIsServer()) {
            fetch(SVESystemInfo_1.SVESystemInfo.getAuthRoot() + '/token/validate', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: type,
                    target: (typeof target === "number") ? target : target.getID(),
                    token: token
                })
            }).then(function (response) {
                if (response.status < 400) {
                    _this.isValid = true;
                    onValidated(_this);
                }
                else {
                    onValidated(_this);
                }
            });
        }
        else {
            console.log("Tokens should only be instanciated by clients!");
            onValidated(this);
        }
    }
    SVEToken.register = function (owner, type, target) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getAuthRoot() + '/token/new', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: type,
                    target: target.getID(),
                    sessionID: owner.getInitializer().sessionID
                })
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        resolve(val.token);
                    });
                }
                else {
                    reject();
                }
            });
        });
    };
    SVEToken.prototype.getIsValid = function () {
        return this.isValid;
    };
    SVEToken.prototype.setIsValid = function () {
        this.isValid = true;
    };
    SVEToken.prototype.invalidate = function (user) {
        fetch(SVESystemInfo_1.SVESystemInfo.getAuthRoot() + '/token', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: this.type,
                target: (typeof this.target === "number") ? this.target : this.target.getID(),
                token: this.token,
                sessionID: user.getInitializer().sessionID
            })
        });
    };
    SVEToken.prototype.use = function (user) {
        var _this = this;
        if (user === void 0) { user = undefined; }
        return new Promise(function (resolve, reject) {
            if (_this.isValid) {
                fetch(SVESystemInfo_1.SVESystemInfo.getAuthRoot() + '/token/use', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: _this.type,
                        target: (typeof _this.target === "number") ? _this.target : _this.target.getID(),
                        token: _this.token,
                        sessionID: (user !== undefined) ? user.getInitializer().sessionID : ""
                    })
                }).then(function (response) {
                    if (response.status < 400) {
                        if (_this.type == TokenType.DeviceToken) {
                            response.json().then(function (val) {
                                new SVEAccount_1.SVEAccount(val, function (usr) {
                                    resolve(usr);
                                });
                            });
                        }
                        else {
                            resolve(undefined);
                        }
                    }
                    else {
                        reject();
                    }
                });
            }
            else {
                reject();
            }
        });
    };
    return SVEToken;
}());
exports.SVEToken = SVEToken;
