import { SVESystemInfo } from './SVESystemInfo';
export var TokenType;
(function (TokenType) {
    TokenType[TokenType["RessourceToken"] = 1] = "RessourceToken";
    TokenType[TokenType["DeviceToken"] = 2] = "DeviceToken";
})(TokenType || (TokenType = {}));
var SVEToken = /** @class */ (function () {
    function SVEToken(token, type, target, onValidated) {
        var _this = this;
        this.isValid = false;
        this.token = "";
        this.token = token;
        this.type = type;
        this.target = target;
        if (!SVESystemInfo.getIsServer()) {
            try {
                fetch(SVESystemInfo.getInstance().sources.sveService + '/auth/token/validate', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: type,
                        target: target.getID(),
                        token: token
                    })
                }).then(function (response) {
                    if (response.status < 400) {
                        response.json().then(function (val) {
                            _this.isValid = val.valid;
                            onValidated(_this);
                        });
                    }
                    else {
                        onValidated(_this);
                    }
                });
            }
            catch (_a) {
                onValidated(this);
            }
        }
        else {
            onValidated(this);
        }
    }
    SVEToken.register = function (type, target) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getInstance().sources.sveService + '/auth/token/new', {
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
    SVEToken.prototype.use = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.isValid) {
                fetch(SVESystemInfo.getInstance().sources.sveService + '/auth/token/use', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: _this.type,
                        target: _this.target.getID(),
                        token: _this.token
                    })
                }).then(function (response) {
                    if (response.status < 400) {
                        response.json().then(function (val) {
                            if (val.success === true) {
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
            }
            else {
                reject();
            }
        });
    };
    return SVEToken;
}());
export { SVEToken };
