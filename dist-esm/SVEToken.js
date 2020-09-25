import { SVESystemInfo } from './SVESystemInfo';
export var TokenType;
(function (TokenType) {
    TokenType[TokenType["RessourceToken"] = 1] = "RessourceToken";
    TokenType[TokenType["DeviceToken"] = 2] = "DeviceToken";
})(TokenType || (TokenType = {}));
var SVEToken = /** @class */ (function () {
    function SVEToken() {
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
    return SVEToken;
}());
export { SVEToken };
