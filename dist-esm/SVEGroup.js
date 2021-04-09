import { SVEAccount } from './SVEAccount';
import { SVEProject } from './SVEProject';
import { SVESystemInfo } from './SVESystemInfo';
import { SVEToken, TokenType } from './SVEToken';
var SVEGroup = /** @class */ (function () {
    function SVEGroup(init, handler, onReady) {
        var _this = this;
        this.id = NaN;
        this.name = "";
        this.projects = [];
        this.id = (init.id !== undefined && init.id !== null) ? init.id : NaN;
        this.name = (init.name !== undefined && init.name !== null) ? init.name : "";
        if (!SVESystemInfo.getIsServer()) {
            if (!isNaN(this.id)) {
                fetch(SVESystemInfo.getAPIRoot() + '/group/' + this.id + "?sessionID=" + encodeURI(this.handler.getInitializer().sessionID), {
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
                                _this.name = (init.name === undefined) ? val.group.name : init.name;
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
                this.name = init.name;
                onReady(this);
            }
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
            var r = [];
            var i = 0;
            _this.projects.forEach(function (pid) {
                new SVEProject(pid, _this.handler, function (prj) {
                    r.push(prj);
                    i++;
                    if (i >= _this.projects.length) {
                        resolve(r);
                    }
                });
            });
            if (_this.projects.length === 0) {
                resolve([]);
            }
        });
    };
    SVEGroup.prototype.getUsers = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAPIRoot() + '/group/' + _this.id + '/users?sessionID=' + encodeURI(_this.handler.getInitializer().sessionID), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                ;
                if (response.status < 400) {
                    response.json().then(function (val) {
                        var r = [];
                        val.forEach(function (v) {
                            r.push(new SVEAccount(v));
                        });
                        resolve(r);
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
    SVEGroup.prototype.setRightsForUser = function (handler, rights) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAPIRoot() + '/group/' + _this.id + "/user/" + handler.getID() + "/rights?sessionID=" + encodeURI(_this.handler.getInitializer().sessionID), {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(rights)
            }).then(function (response) {
                resolve(response.status < 400);
            });
        });
    };
    SVEGroup.prototype.getRightsForUser = function (handler) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAPIRoot() + '/group/' + _this.id + "/user/" + handler.getID() + "/rights?sessionID=" + encodeURI(_this.handler.getInitializer().sessionID), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        resolve({
                            admin: val.admin,
                            read: val.read,
                            write: val.write
                        });
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
    SVEGroup.prototype.getAsInitializer = function () {
        return {
            id: this.id,
            name: this.name
        };
    };
    SVEGroup.prototype.store = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAPIRoot() + '/group/' + ((!isNaN(_this.id)) ? _this.id : "new") + "?sessionID=" + encodeURI(_this.handler.getInitializer().sessionID), {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_this.getAsInitializer())
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        _this.id = Number(val.id);
                        _this.name = val.name;
                        resolve(true);
                    });
                }
                else {
                    resolve(false);
                }
            });
        });
    };
    // remove from server
    SVEGroup.prototype.remove = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAPIRoot() + '/group/' + _this.id + "?sessionID=" + encodeURI(_this.handler.getInitializer().sessionID), {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                resolve(response.status == 200);
            });
        });
    };
    SVEGroup.prototype.createInviteToken = function () {
        return SVEToken.register(this.handler, TokenType.RessourceToken, this);
    };
    SVEGroup.getGroupsOf = function (handler) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAPIRoot() + '/groups?sessionID=' + encodeURI(handler.getInitializer().sessionID), {
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
                            gs.push(new SVEGroup({ id: gid }, handler, function (s) {
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
export { SVEGroup };
;
