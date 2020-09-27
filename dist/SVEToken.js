"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVEToken = exports.TokenType = void 0;
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
    SVEToken.register = function (type, target) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getAuthRoot() + '/token/new', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: type,
                    target: target.getID()
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
    SVEToken.prototype.invalidate = function () {
        fetch(SVESystemInfo_1.SVESystemInfo.getAuthRoot() + '/token', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: this.type,
                target: (typeof this.target === "number") ? this.target : this.target.getID(),
                token: this.token
            })
        });
    };
    SVEToken.prototype.use = function () {
        var _this = this;
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
                        token: _this.token
                    })
                }).then(function (response) {
                    if (response.status < 400) {
                        resolve();
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
