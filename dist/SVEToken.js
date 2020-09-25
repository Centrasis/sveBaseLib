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
    function SVEToken() {
    }
    SVEToken.register = function (type, target) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/auth/token/new', {
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
    return SVEToken;
}());
exports.SVEToken = SVEToken;
