"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRejectReason = exports.TargetType = exports.GameState = void 0;
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
