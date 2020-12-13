"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVEGame = exports.GameRejectReason = exports.TargetType = exports.GameState = void 0;
var peerjs_1 = __importDefault(require("peerjs"));
var SVEAccount_1 = require("./SVEAccount");
var SVESystemInfo_1 = require("./SVESystemInfo");
var GameState;
(function (GameState) {
    GameState[GameState["Undetermined"] = 0] = "Undetermined";
    GameState[GameState["Won"] = 1] = "Won";
    GameState[GameState["Lost"] = 2] = "Lost";
})(GameState = exports.GameState || (exports.GameState = {}));
var TargetType;
(function (TargetType) {
    TargetType[TargetType["Player"] = 0] = "Player";
    TargetType[TargetType["Game"] = 1] = "Game";
    TargetType[TargetType["Entity"] = 2] = "Entity";
})(TargetType = exports.TargetType || (exports.TargetType = {}));
var GameRejectReason;
(function (GameRejectReason) {
    GameRejectReason[GameRejectReason["GameNotPresent"] = 0] = "GameNotPresent";
    GameRejectReason[GameRejectReason["PlayerLimitExceeded"] = 1] = "PlayerLimitExceeded";
})(GameRejectReason = exports.GameRejectReason || (exports.GameRejectReason = {}));
var SVEGame = /** @class */ (function () {
    function SVEGame(info) {
        this.hostPeerID = "";
        this.socket = undefined;
        this.playerList = [];
        this.connections = [];
        this.bIsHost = false;
        this.bIsRunning = false;
        this.gameState = GameState.Undetermined;
        this.peerOpts = {
            host: "/",
            path: "/peer",
            secure: true
        };
        this.host = info.host;
        this.hostPeerID = (info.peerID !== undefined) ? info.peerID : "";
        this.name = info.name;
        this.gameType = info.gameType;
        this.maxPlayers = info.maxPlayers;
        this.gameState = info.gameState;
    }
    SVEGame.prototype.OnGameRejected = function (reason) {
    };
    SVEGame.prototype.IsHostInstance = function () {
        return this.bIsHost;
    };
    SVEGame.prototype.IsRunning = function () {
        return this.bIsRunning;
    };
    SVEGame.prototype.setupHostPeerConnection = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.socket.on("connection", function (c) {
                c.on('open', function () {
                    console.log("New player connection");
                });
                c.on('close', function () {
                    console.log("A player connection was closed");
                });
                c.on('data', function (e) {
                    _this.onRequest(e);
                    // broadcasting
                    _this.sendGameRequest(e);
                });
                c.on('error', function (err) {
                    console.log("An peer error occured: " + JSON.stringify(err));
                });
                if (_this.connections.length < _this.maxPlayers - 1) {
                    _this.connections.push(c);
                }
                else {
                    c.close();
                }
            });
            resolve();
        });
    };
    SVEGame.prototype.setupPeerConnection = function (peerID) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var conn = _this.socket.connect(peerID);
            var returned = false;
            conn.on('open', function () {
                console.log("Connected with game: " + _this.name);
                returned = true;
                resolve(conn);
            });
            conn.on('data', function (e) {
                _this.onRequest(e);
            });
            conn.on('close', function () {
                console.log("End game: " + _this.name);
                _this.onEnd();
                _this.OnGameRejected(GameRejectReason.PlayerLimitExceeded);
                if (!returned) {
                    returned = true;
                    reject(null);
                }
            });
            conn.on('error', function (err) {
                console.log("Error with game connection: " + JSON.stringify(err));
                _this.onEnd();
                _this.OnGameRejected(GameRejectReason.GameNotPresent);
                if (!returned) {
                    returned = true;
                    reject(err);
                }
            });
        });
    };
    SVEGame.prototype.join = function (localPlayer) {
        var _this = this;
        console.log("Try join game: " + this.name);
        this.socket = new peerjs_1.default(this.peerOpts);
        this.bIsHost = false;
        this.setupPeerConnection(this.hostPeerID).then(function (c) {
            _this.connections = [c];
            _this.localUser = localPlayer;
            _this.OnConnected(true);
            _this.sendGameRequest({
                action: "join",
                target: {
                    type: TargetType.Game,
                    id: ""
                },
                invoker: _this.localUser.getName()
            });
        }, function (err) { return _this.OnConnected(false); });
        return this.socket;
    };
    SVEGame.prototype.onJoined = function (player) {
        this.playerList.push(player);
    };
    SVEGame.prototype.OnConnected = function (success) {
    };
    SVEGame.prototype.onEnd = function () {
        this.bIsRunning = false;
    };
    SVEGame.prototype.onStart = function () {
        this.bIsRunning = true;
    };
    SVEGame.prototype.EndGame = function () {
        if (this.IsHostInstance()) {
            this.sendGameRequest({
                action: "!endGame",
                invoker: this.localUser.getName()
            });
            this.onEnd();
        }
    };
    SVEGame.prototype.StartGame = function () {
        if (this.IsHostInstance()) {
            this.sendGameRequest({
                action: "!startGame",
                invoker: this.localUser.getName(),
                target: {
                    type: TargetType.Game,
                    id: ""
                }
            });
            this.onStart();
        }
    };
    SVEGame.prototype.GiveUp = function () {
        this.SetGameState(GameState.Lost);
        this.EndGame();
    };
    SVEGame.prototype.SetGameState = function (gs) {
        if (this.IsHostInstance()) {
            this.gameState = gs;
            this.sendGameRequest({
                action: {
                    field: "gameState",
                    value: gs
                },
                invoker: this.localUser.getName(),
                target: {
                    type: TargetType.Game,
                    id: ""
                }
            });
            this.OnGameStateChange(gs);
        }
    };
    // player null is not valid!
    SVEGame.prototype.NotifyPlayer = function (player, notification) {
        this.sendGameRequest({
            action: {
                field: "!notify",
                value: notification
            },
            invoker: this.localUser.getName(),
            target: {
                type: TargetType.Player,
                id: player.getName()
            }
        });
    };
    SVEGame.prototype.OnGameStateChange = function (gs) {
    };
    SVEGame.prototype.onRequest = function (req) {
        var _this = this;
        if (typeof req.action === "string") {
            if (req.action === "!startGame") {
                this.bIsRunning = true;
                this.onStart();
                return;
            }
            if (req.action === "!endGame") {
                this.onEnd();
                return;
            }
            if (req.action === "join" && req.target !== undefined) {
                if (req.target.type === TargetType.Game) {
                    if (this.connections.length <= this.maxPlayers) {
                        this.sendGameRequest({
                            action: "join:OK",
                            target: {
                                id: req.invoker,
                                type: TargetType.Player
                            },
                            invoker: this.localUser.getName()
                        });
                    }
                    else {
                        this.sendGameRequest({
                            action: "join:REJECT",
                            target: {
                                id: req.invoker,
                                type: TargetType.Player
                            },
                            invoker: this.localUser.getName()
                        });
                    }
                }
            }
            if (req.action === "join:OK" && req.target !== undefined) {
                this.host = req.invoker;
                if (req.target.type === TargetType.Player) {
                    if (req.target.id === this.localUser.getName()) {
                        this.onJoined(this.localUser);
                    }
                    else {
                        new SVEAccount_1.SVEAccount({ name: req.target.id, id: -1, sessionID: "", loginState: SVEAccount_1.LoginState.NotLoggedIn }, function (usr) {
                            _this.onJoined(usr);
                        });
                    }
                }
            }
            if (req.action === "playersList?" && this.IsHostInstance()) {
                var list_1 = [];
                this.playerList.forEach(function (p) { return list_1.push(p.getName()); });
                this.sendGameRequest({
                    action: {
                        field: "playersList",
                        value: JSON.stringify(list_1)
                    },
                    invoker: this.localUser.getName()
                });
            }
        }
        else {
            if (req.action.field === "playersList") {
                this.host = req.invoker;
                this.playerList = [];
                JSON.parse(req.action.value).forEach(function (p) {
                    new SVEAccount_1.SVEAccount({ name: p, id: -1, sessionID: "", loginState: SVEAccount_1.LoginState.NotLoggedIn }, function (usr) {
                        _this.playerList.push(usr);
                    });
                });
            }
            if (req.action.field === "gameState") {
                this.host = req.invoker;
                this.gameState = req.action.value;
                this.OnGameStateChange(this.gameState);
            }
            if (req.action.field === "!notify") {
                console.log("Notify: ", JSON.stringify(req.action.value));
                return;
            }
        }
    };
    SVEGame.prototype.create = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.socket = new peerjs_1.default(_this.peerOpts);
            _this.hostPeerID = _this.socket.id;
            _this.bIsHost = true;
            _this.setupHostPeerConnection().then(function () {
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
                    var list_2 = [];
                    response.json().then(function (val) {
                        val.forEach(function (gi) {
                            list_2.push(gi);
                        });
                        resolve(list_2);
                    }, function (err) { return reject(); });
                }
                else {
                    reject();
                }
            });
        });
    };
    SVEGame.prototype.leave = function (player) {
        this.playerList = this.playerList.filter(function (v) { return v.getName() === player.getName(); });
    };
    SVEGame.prototype.getAsInitializer = function () {
        return {
            gameType: this.gameType,
            host: this.host,
            maxPlayers: this.maxPlayers,
            name: this.name,
            gameState: this.gameState,
            peerID: this.hostPeerID
        };
    };
    SVEGame.prototype.sendGameRequest = function (req) {
        this.connections.forEach(function (c) { return c.send(req); });
        this.onRequest(req);
    };
    return SVEGame;
}());
exports.SVEGame = SVEGame;
