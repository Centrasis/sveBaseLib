"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVEGame = void 0;
var SVESystemInfo_1 = require("./SVESystemInfo");
var SVEGame = /** @class */ (function () {
    function SVEGame(host, name, gameType, maxPlayers) {
        this.host = host;
        this.name = name;
        this.gameType = gameType;
        this.maxPlayers = maxPlayers;
    }
    SVEGame.prototype.join = function (player, game) {
    };
    SVEGame.prototype.create = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getGameRoot() + '/new', {
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
            fetch(SVESystemInfo_1.SVESystemInfo.getGameRoot() + '/list', {
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
exports.SVEGame = SVEGame;
