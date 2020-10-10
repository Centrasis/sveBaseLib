import { SVESystemInfo } from "./SVESystemInfo";
export var GameState;
(function (GameState) {
    GameState[GameState["Undetermined"] = 0] = "Undetermined";
    GameState[GameState["Won"] = 1] = "Won";
    GameState[GameState["Lost"] = 2] = "Lost";
})(GameState || (GameState = {}));
export var TargetType;
(function (TargetType) {
    TargetType[TargetType["Player"] = 0] = "Player";
    TargetType[TargetType["Game"] = 1] = "Game";
    TargetType[TargetType["Entity"] = 2] = "Entity";
})(TargetType || (TargetType = {}));
var SVEGame = /** @class */ (function () {
    function SVEGame(info) {
        this.gameState = GameState.Undetermined;
        this.host = info.host;
        this.name = info.name;
        this.gameType = info.gameType;
        this.maxPlayers = info.maxPlayers;
        this.gameState = info.gameState;
    }
    SVEGame.prototype.join = function () {
        var _this = this;
        console.log("Try join game: " + this.name);
        this.socket = new WebSocket("wss://" + window.location.hostname + "/" + SVESystemInfo.getGameRoot() + "/join/" + this.name);
        this.socket.onopen = function (e) {
            console.log("Joined game: " + _this.name);
            _this.onJoined();
        };
        this.socket.onmessage = function (e) {
            _this.onRequest(JSON.parse(e.data));
        };
        this.socket.onclose = function (e) {
            console.log("End game: " + _this.name);
            if (e.wasClean) {
                console.log("Connection closed cleanly, code=" + e.code + " reason=" + e.reason);
            }
            else {
                console.log("Connection died!");
            }
            _this.onEnd();
        };
        this.socket.onerror = function (e) {
            console.log("Error with game connection: " + JSON.stringify(e));
            _this.onEnd();
        };
        return this.socket;
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
                            list_1.push(new SVEGame(gi));
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
            name: this.name,
            gameState: this.gameState
        };
    };
    SVEGame.prototype.sendGameRequest = function (req) {
        this.socket.send(JSON.stringify(req));
    };
    return SVEGame;
}());
export { SVEGame };
