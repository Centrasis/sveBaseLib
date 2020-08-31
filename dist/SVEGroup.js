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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVEGroup = void 0;
const SVEProject_1 = require("./SVEProject");
const SVESystemInfo_1 = require("./SVESystemInfo");
class SVEGroup {
    constructor(id, handler, onReady) {
        this.id = NaN;
        this.name = "";
        if (SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService !== undefined) {
            () => __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/group/' + id, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status < 400) {
                    response.json().then((val) => {
                        if (val.success === true) {
                            this.id = val.group.id;
                            this.name = val.group.name;
                            this.handler = handler;
                        }
                        if (onReady !== undefined)
                            onReady(this);
                    });
                }
                else {
                    if (onReady !== undefined)
                        onReady(this);
                }
            });
        }
        else {
            if (typeof SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
                SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase.query("SELECT * FROM contexts WHERE id = ?", [id], (err, results) => {
                    if (err) {
                        console.log("Error in SQL: " + JSON.stringify(err));
                        if (onReady !== undefined)
                            onReady(undefined);
                    }
                    else {
                        this.id = id;
                        this.name = results[0].context;
                        this.handler = handler;
                        if (onReady !== undefined)
                            onReady(this);
                    }
                });
            }
        }
    }
    getID() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getProjects() {
        return new Promise((resolve, reject) => {
            let ret = [];
            if (typeof SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
                SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase.query("SELECT * FROM projects WHERE context = ?", [this.id], (err, results) => {
                    if (err) {
                        console.log("SQL error on getting SVE Projects!");
                        reject({
                            success: false,
                            msg: err
                        });
                    }
                    else {
                        let i = 0;
                        results.forEach((element) => {
                            let init = {
                                group: this,
                                name: element.name,
                                splashImg: element.splash_img,
                                id: element.id,
                                resultsURI: element.results_uri,
                                state: element.state,
                                type: SVEProject_1.SVEProjectType.Vacation,
                                owner: element.owner
                            };
                            ret.push(new SVEProject_1.SVEProject(init, this.handler, (p) => {
                                i++;
                                if (i >= results.length) {
                                    resolve(ret);
                                }
                            }));
                        });
                        if (results.length == 0) {
                            resolve([]);
                        }
                    }
                });
            }
            else {
                () => __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/group/' + this.id, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.status < 400) {
                        response.json().then((val) => {
                            resolve(val.projects);
                        });
                    }
                    else {
                        reject({
                            success: false,
                            msg: "HTTP error"
                        });
                    }
                });
            }
        });
    }
    getRightsForUser(handler) {
        return new Promise((resolve, reject) => {
            if (typeof SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
                SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase.query("SELECT user_id, context as context_id, write_access, read_access, admin_access FROM user INNER JOIN rights ON user.id = rights.user_id WHERE user_id = ? AND context = ?", [handler.getID(), this.id], (err, results) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve({
                            read: results[0].read_access,
                            write: results[0].write_access,
                            admin: results[0].admin_access
                        });
                    }
                });
            }
            else {
                () => __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/group/' + this.id + "/rights", {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.status < 400) {
                        response.json().then((val) => {
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
            }
        });
    }
    static getGroupsOf(handler) {
        return new Promise((resolve, reject) => {
            let ret = [];
            if (typeof SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
                SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase.query("SELECT user_id, context as context_id, write_access, read_access, admin_access FROM user INNER JOIN rights ON user.id = rights.user_id WHERE user_id = ? AND read_access = 1", [handler.getID()], (err, results) => {
                    if (err) {
                        console.log("SQL error on getting SVE Groups!");
                        reject({
                            success: false,
                            msg: err
                        });
                    }
                    else {
                        let i = 0;
                        results.forEach((element) => {
                            ret.push(new SVEGroup(element.context_id, handler, (s) => {
                                i++;
                                if (i >= results.length) {
                                    resolve(ret);
                                }
                            }));
                        });
                        if (results.length == 0) {
                            resolve([]);
                        }
                    }
                });
            }
            else {
                console.log("Error getting SVE Groups!");
                reject({
                    success: false,
                    msg: "DB not valid!"
                });
            }
        });
    }
}
exports.SVEGroup = SVEGroup;
;
