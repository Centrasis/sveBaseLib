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
import { SVEAccount } from './SVEAccount';
import { SVEGroup } from './SVEGroup';
import { SVESystemInfo } from './SVESystemInfo';
import { SVEData } from './SVEData';
export var SVEProjectType;
(function (SVEProjectType) {
    SVEProjectType[SVEProjectType["Vacation"] = 0] = "Vacation";
    SVEProjectType[SVEProjectType["Sales"] = 1] = "Sales";
})(SVEProjectType || (SVEProjectType = {}));
export function isProjectInitializer(init) {
    return typeof init !== "number";
}
var SVEProject = /** @class */ (function () {
    function SVEProject(idx, handler, onReady) {
        var _this = this;
        this.id = NaN;
        this.name = "";
        this.type = SVEProjectType.Vacation;
        // if get by id
        if (!isProjectInitializer(idx)) {
            if (SVESystemInfo.getIsServer()) {
                if (onReady !== undefined)
                    onReady(this);
            }
            else {
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var response;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fetch(SVESystemInfo.getInstance().sources.sveService + '/project/' + idx, {
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
                                        _this.name = val.name;
                                        _this.type = val.type;
                                        _this.handler = handler;
                                        _this.owner = new SVEAccount({ id: val.owner }, function (s) {
                                            _this.group = new SVEGroup(val.group, handler, function (self) {
                                                if (onReady !== undefined)
                                                    onReady(_this);
                                            });
                                        });
                                    });
                                }
                                else {
                                    if (onReady !== undefined)
                                        onReady(this);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); });
            }
        }
        else {
            this.id = idx.id;
            this.group = idx.group;
            this.name = idx.name;
            this.type = idx.type;
            this.handler = handler;
            this.owner = idx.owner;
            if (onReady !== undefined)
                onReady(this);
        }
    }
    SVEProject.prototype.getID = function () {
        return this.id;
    };
    SVEProject.prototype.getName = function () {
        return this.name;
    };
    SVEProject.prototype.getType = function () {
        return this.type;
    };
    SVEProject.prototype.getOwner = function () {
        var _this = this;
        if (typeof this.owner === "number") {
            return new Promise(function (resolve, reject) {
                _this.owner = new SVEAccount({ id: _this.owner }, function (s) {
                    resolve(_this.owner);
                });
            });
        }
        else {
            return new Promise(function (resolve, reject) {
                if (_this.owner == undefined) {
                    reject();
                }
                else {
                    resolve(_this.owner);
                }
            });
        }
    };
    SVEProject.prototype.getGroup = function () {
        return this.group;
    };
    SVEProject.prototype.getData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var response;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch(SVESystemInfo.getInstance().sources.sveService + '/project/' + this.id + '/data/list', {
                                method: "GET"
                            })];
                        case 1:
                            response = _a.sent();
                            if (response.status < 400) {
                                response.json().then(function (val) {
                                    var r = [];
                                    var i = 0;
                                    if (val.length > 0) {
                                        val.foreach(function (v) {
                                            r.push(new SVEData(_this.handler, { id: v.id, parentProject: _this, type: v.type }, function (s) {
                                                i++;
                                                if (i >= val.length) {
                                                    resolve(r);
                                                }
                                            }));
                                        });
                                    }
                                    else {
                                        resolve(r);
                                    }
                                }, function (err) { return reject(false); });
                            }
                            else {
                                reject(false);
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    return SVEProject;
}());
export { SVEProject };
