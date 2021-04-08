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
            fetch(SVESystemInfo.getAuthRoot() + '/token/validate', {
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
            fetch(SVESystemInfo.getAuthRoot() + '/token/new', {
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
        fetch(SVESystemInfo.getAuthRoot() + '/token', {
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
                fetch(SVESystemInfo.getAuthRoot() + '/token/use', {
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
export { SVEToken };
