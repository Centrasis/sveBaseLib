import { SVESystemInfo } from "./SVESystemInfo";
var SVEGame = /** @class */ (function () {
    function SVEGame(host, name, gameType, maxPlayers) {
        this.host = host;
        this.name = name;
        this.gameType = gameType;
        this.maxPlayers = maxPlayers;
    }
    SVEGame.prototype.join = function () {
        var _this = this;
        var ws = new WebSocket("wss://" + window.location.hostname + "/" + SVESystemInfo.getGameRoot() + "/join/" + this.name);
        ws.onopen = function (e) {
            _this.onJoined();
        };
        ws.onmessage = function (e) {
            _this.onRequest(JSON.parse(e.data));
        };
        ws.onclose = function (e) {
            _this.onEnd();
        };
        return ws;
    };
    SVEGame.prototype.onJoined = function () {
    };
    SVEGame.prototype.onEnd = function () {
    };
    SVEGame.prototype.onRequest = function (req) {
    };
    SVEGame.prototype.create = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getGameRoot() + '/new', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_this.getAsInitializer())
            }).then(function (response) {
                if (response.status < 400) {
                    resolve();
                }
                else {
                    reject();
                }
            });
        });
    };
    SVEGame.getGames = function () {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getGameRoot() + '/list', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status < 400) {
                    var list_1 = [];
                    response.json().then(function (val) {
                        val.forEach(function (gi) {
                            list_1.push(new SVEGame(gi.host, gi.name, gi.gameType, gi.maxPlayers));
                        });
                        resolve(list_1);
                    }, function (err) { return reject(); });
                }
                else {
                    reject();
                }
            });
        });
    };
    SVEGame.prototype.leave = function (player) {
    };
    SVEGame.prototype.getAsInitializer = function () {
        return {
            gameType: this.gameType,
            host: this.host,
            maxPlayers: this.maxPlayers,
            name: this.name
        };
    };
    return SVEGame;
}());
export { SVEGame };
