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
const SVESystemInfo_1 = require("./SVESystemInfo");
class SVEGroup {
    constructor(id, handler, onReady) {
        this.id = NaN;
        this.name = "";
        if (!SVESystemInfo_1.SVESystemInfo.getIsServer()) {
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
            onReady(this);
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
        });
    }
    getUsers() {
        return new Promise((resolve, reject) => {
            () => __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/group/' + this.id + '/users', {
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
        });
    }
    getRightsForUser(handler) {
        return new Promise((resolve, reject) => {
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
        });
    }
    static getGroupsOf(handler) {
        return new Promise((resolve, reject) => {
            () => __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/groups/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status < 400) {
                    response.json().then((val) => {
                        let gs = [];
                        let i = 0;
                        val.forEach((gid) => {
                            gs.push(new SVEGroup(gid, handler, (s) => {
                                i++;
                                if (i >= val.length) {
                                    resolve(gs);
                                }
                            }));
                        });
                    }, err => reject(err));
                }
                else {
                    reject({
                        success: false,
                        msg: "HTTP error"
                    });
                }
            });
        });
    }
}
exports.SVEGroup = SVEGroup;
;
