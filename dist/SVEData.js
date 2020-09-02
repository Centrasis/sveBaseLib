"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVEData = exports.SVEDataVersion = exports.SVEDataType = void 0;
var SVEAccount_1 = require("./SVEAccount");
var SVEProject_1 = require("./SVEProject");
var SVESystemInfo_1 = require("./SVESystemInfo");
var SVEDataType;
(function (SVEDataType) {
    SVEDataType[SVEDataType["Image"] = 0] = "Image";
    SVEDataType[SVEDataType["Video"] = 1] = "Video";
    SVEDataType[SVEDataType["PDF"] = 2] = "PDF";
    SVEDataType[SVEDataType["CSV"] = 3] = "CSV";
})(SVEDataType = exports.SVEDataType || (exports.SVEDataType = {}));
var SVEDataVersion;
(function (SVEDataVersion) {
    SVEDataVersion[SVEDataVersion["Full"] = 0] = "Full";
    SVEDataVersion[SVEDataVersion["Small"] = 1] = "Small";
    SVEDataVersion[SVEDataVersion["Preview"] = 2] = "Preview";
})(SVEDataVersion = exports.SVEDataVersion || (exports.SVEDataVersion = {}));
var mimeMap = new Map();
mimeMap.set("html", 'text/html');
mimeMap.set("txt", 'text/css');
mimeMap.set("css", 'text/html');
mimeMap.set("gif", 'image/gif');
mimeMap.set("jpg", 'image/jpeg');
mimeMap.set("png", 'image/png');
mimeMap.set("svg", 'image/svg+xml');
mimeMap.set("js", 'application/javascript');
mimeMap.set("mp4", 'video/mp4');
mimeMap.set("pdf", 'application/pdf');
var SVEData = /** @class */ (function () {
    // gets the data by index if initInfo is number. Else a new data record is created on server
    function SVEData(handler, initInfo, onComplete) {
        var _this = this;
        this.type = SVEDataType.Image;
        this.id = -1;
        this.lastAccess = new Date();
        this.creation = new Date();
        this.handler = handler;
        if (typeof initInfo === "number") {
            this.id = initInfo;
            if (typeof SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService !== undefined) {
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var response;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/data/' + this.id, {
                                    method: 'GET',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json'
                                    }
                                })];
                            case 1:
                                response = _a.sent();
                                if (response.status < 400) {
                                    response.json().then(function (val) {
                                        _this.id = val.id;
                                        _this.type = val.type;
                                        _this.creation = val.creation;
                                        _this.lastAccess = val.lastAccess;
                                        _this.parentProject = new SVEProject_1.SVEProject(val.project.id, _this.handler, function (prj) {
                                            onComplete(_this);
                                        });
                                    });
                                }
                                else {
                                    this.id = -1;
                                    onComplete(this);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
        }
        else {
            if (initInfo.id !== undefined) {
                this.id = initInfo.id;
            }
            this.type = initInfo.type;
            this.data = initInfo.data;
            if (initInfo.path !== undefined)
                this.localDataInfo = initInfo.path;
            this.parentProject = initInfo.parentProject;
            this.owner = initInfo.owner;
            onComplete(this);
        }
    }
    SVEData.getMimeTypeMap = function () {
        return mimeMap;
    };
    SVEData.prototype.initFromResult = function (result, parentProject, onComplete) {
        this.localDataInfo = {
            filePath: result.path,
            thumbnailPath: result.thumbnail
        };
        this.creation = result.creation;
        this.lastAccess = result.lastAccess;
        this.parentProject = parentProject;
        this.type = SVEData.getTypeFrom(result.type);
        this.owner = new SVEAccount_1.SVEAccount({ id: result.user_id }, function (s) {
            onComplete();
        });
    };
    SVEData.getTypeFrom = function (str) {
        if (str === "Image") {
            return SVEDataType.Image;
        }
        if (str === "Video") {
            return SVEDataType.Video;
        }
        if (str === "PDF") {
            return SVEDataType.PDF;
        }
        if (str === "CSV") {
            return SVEDataType.CSV;
        }
        return SVEDataType.Image;
    };
    SVEData.prototype.getID = function () {
        return this.id;
    };
    SVEData.prototype.getOwnerID = function () {
        if (typeof this.owner === "number") {
            return this.owner;
        }
        else {
            return this.owner.getID();
        }
    };
    SVEData.prototype.getOwner = function () {
        var _this = this;
        if (typeof this.owner === "number") {
            return new Promise(function (resolve, reject) {
                _this.owner = new SVEAccount_1.SVEAccount({ id: _this.owner }, function (s) {
                    resolve(_this.owner);
                });
            });
        }
        else {
            return new Promise(function (resolve, reject) { return resolve(_this.owner); });
        }
    };
    SVEData.prototype.getCreationDate = function () {
        return this.creation;
    };
    SVEData.prototype.getLastAccessDate = function () {
        return this.lastAccess;
    };
    SVEData.prototype.getCacheType = function () {
        var r = "private";
        if (this.type === SVEDataType.PDF) {
            r = "no-store";
        }
        return r;
    };
    SVEData.prototype.getContentType = function () {
        var r = "application/octet-stream";
        if (this.localDataInfo !== undefined) {
            var path = require('path');
            r = mimeMap.get(path.extname((this.currentDataVersion == SVEDataVersion.Full) ? this.localDataInfo.filePath : this.localDataInfo.thumbnailPath).slice(1).toLowerCase());
        }
        else {
            if (this.type === SVEDataType.Image) {
                r = "image/png";
            }
            if (this.type === SVEDataType.Video) {
                r = "video/mp4";
            }
            if (this.type === SVEDataType.PDF) {
                r = "application/pdf";
            }
        }
        return r;
    };
    SVEData.prototype.getName = function () {
        if (this.localDataInfo === undefined) {
            return "";
        }
        else {
            var path = require('path');
            return path.basename(this.localDataInfo.filePath);
        }
    };
    SVEData.prototype.getType = function () {
        return this.type;
    };
    SVEData.prototype.getProject = function () {
        return this.parentProject;
    };
    SVEData.prototype.store = function () {
        return new Promise(function (resolve, reject) {
            resolve(true);
        });
    };
    SVEData.prototype.getURI = function () {
        return SVESystemInfo_1.SVESystemInfo.getAPIRoot() + "/project/" + this.parentProject.getID() + "/data/" + this.id + "/" + (SVEDataVersion.Full == this.currentDataVersion) ? "full" : "preview";
    };
    SVEData.prototype.getBLOB = function (version) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.data === undefined || _this.currentDataVersion !== version) {
                _this.currentDataVersion = version;
                var self = _this;
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var response;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fetch(this.getURI(), {
                                    method: 'GET',
                                    headers: {
                                        'Accept': '*'
                                    }
                                })];
                            case 1:
                                response = _a.sent();
                                if (response.status < 400) {
                                    response.arrayBuffer().then(function (val) {
                                        self.data = val;
                                        resolve(self.data);
                                    });
                                }
                                else {
                                    reject(null);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
                return;
            }
            if (_this.data !== undefined) {
                resolve(_this.data);
            }
            else {
                reject(null);
            }
        });
    };
    SVEData.prototype.getStream = function (version) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.data !== undefined && _this.currentDataVersion === version) {
                var self = _this;
                _this.data.on('error', function (err) {
                    reject(null);
                });
                _this.data.on('open', function () {
                    resolve(self.data);
                });
            }
            else {
                reject(null);
            }
        });
    };
    return SVEData;
}());
exports.SVEData = SVEData;
