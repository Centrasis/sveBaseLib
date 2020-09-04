"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVEProject = exports.isProjectInitializer = exports.SVEProjectType = void 0;
var SVEAccount_1 = require("./SVEAccount");
var SVEGroup_1 = require("./SVEGroup");
var SVESystemInfo_1 = require("./SVESystemInfo");
var SVEData_1 = require("./SVEData");
var SVEProjectType;
(function (SVEProjectType) {
    SVEProjectType[SVEProjectType["Vacation"] = 0] = "Vacation";
    SVEProjectType[SVEProjectType["Sales"] = 1] = "Sales";
})(SVEProjectType = exports.SVEProjectType || (exports.SVEProjectType = {}));
function isProjectInitializer(init) {
    return typeof init !== "number";
}
exports.isProjectInitializer = isProjectInitializer;
var SVEProject = /** @class */ (function () {
    function SVEProject(idx, handler, onReady) {
        var _this = this;
        this.id = NaN;
        this.name = "";
        this.splashImgID = 0;
        this.type = SVEProjectType.Vacation;
        // if get by id
        if (!isProjectInitializer(idx)) {
            if (SVESystemInfo_1.SVESystemInfo.getIsServer()) {
                if (onReady !== undefined)
                    onReady(this);
            }
            else {
                fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/project/' + idx, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    if (response.status < 400) {
                        response.json().then(function (val) {
                            _this.id = val.id;
                            _this.name = val.name;
                            _this.type = val.type;
                            _this.handler = handler;
                            _this.splashImgID = val.splashImgID;
                            _this.dateRange = ("dateRange" in val) ? val.dateRange : undefined;
                            _this.owner = new SVEAccount_1.SVEAccount({ id: val.owner }, function (s) {
                                _this.group = new SVEGroup_1.SVEGroup(val.group, handler, function (self) {
                                    if (onReady !== undefined)
                                        onReady(_this);
                                });
                            });
                        });
                    }
                    else {
                        if (onReady !== undefined)
                            onReady(_this);
                    }
                }, function (err) { if (onReady !== undefined)
                    onReady(_this); });
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
    SVEProject.prototype.getSplashImgID = function () {
        return this.splashImgID;
    };
    SVEProject.prototype.getDateRange = function () {
        return this.dateRange;
    };
    SVEProject.prototype.getSplashImageURI = function () {
        return SVESystemInfo_1.SVESystemInfo.getAPIRoot() + "/project/" + this.id + "/data/" + this.splashImgID + "/preview";
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
                _this.owner = new SVEAccount_1.SVEAccount({ id: _this.owner }, function (s) {
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
    // store on server
    SVEProject.prototype.store = function () {
        fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/project/' + ((this.id !== NaN) ? this.id : "new"), {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this)
        }).then(function (response) {
        });
    };
    SVEProject.prototype.getGroup = function () {
        return this.group;
    };
    SVEProject.prototype.getData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/project/' + _this.id + '/data/list', {
                method: "GET"
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        var r = [];
                        var i = 0;
                        if (val.length > 0) {
                            val.foreach(function (v) {
                                r.push(new SVEData_1.SVEData(_this.handler, { id: v.id, parentProject: _this, type: v.type }, function (s) {
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
            }, function (err) { return reject(err); });
        });
    };
    return SVEProject;
}());
exports.SVEProject = SVEProject;
