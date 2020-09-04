"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVEGroup = void 0;
var SVEProject_1 = require("./SVEProject");
var SVESystemInfo_1 = require("./SVESystemInfo");
var SVEGroup = /** @class */ (function () {
    function SVEGroup(id, handler, onReady) {
        var _this = this;
        this.id = NaN;
        this.name = "";
        this.projects = [];
        if (!SVESystemInfo_1.SVESystemInfo.getIsServer()) {
            fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/group/' + id, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        if ("group" in val) {
                            _this.id = val.group.id;
                            _this.name = val.group.name;
                            _this.projects = val.projects;
                            _this.handler = handler;
                        }
                        if (onReady !== undefined)
                            onReady(_this);
                    });
                }
                else {
                    if (onReady !== undefined)
                        onReady(_this);
                }
            }, function (err) { if (onReady !== undefined)
                onReady(_this); });
        }
        else {
            onReady(this);
        }
    }
    SVEGroup.prototype.getID = function () {
        return this.id;
    };
    SVEGroup.prototype.getName = function () {
        return this.name;
    };
    SVEGroup.prototype.getProjects = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.projects.forEach(function (pid) {
                var r = [];
                new SVEProject_1.SVEProject(pid, _this.handler, function (prj) {
                    r.push(prj);
                    if (r.length == _this.projects.length) {
                        resolve(r);
                    }
                });
            });
            if (_this.projects.length == 0) {
                resolve([]);
            }
        });
    };
    SVEGroup.prototype.getUsers = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/group/' + _this.id + '/users', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                ;
                if (response.status < 400) {
                    response.json().then(function (val) {
                        resolve(val);
                    });
                }
                else {
                    reject({
                        success: false,
                        msg: "HTTP error"
                    });
                }
            });
        });
    };
    SVEGroup.prototype.getRightsForUser = function (handler) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/group/' + _this.id + "/rights", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        resolve(val);
                    });
                }
                else {
                    reject({
                        success: false,
                        msg: "HTTP error"
                    });
                }
            }, function (err) { return reject(err); });
        });
    };
    SVEGroup.getGroupsOf = function (handler) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/groups/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        var gs = [];
                        var i = 0;
                        val.forEach(function (gid) {
                            gs.push(new SVEGroup(gid, handler, function (s) {
                                i++;
                                if (i >= val.length) {
                                    resolve(gs);
                                }
                            }));
                        });
                    }, function (err) { return reject(err); });
                }
                else {
                    reject({
                        success: false,
                        msg: "HTTP error"
                    });
                }
            }, function (err) { return reject(err); });
        });
    };
    return SVEGroup;
}());
exports.SVEGroup = SVEGroup;
;
