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
exports.SVEProject = exports.SVEProjectType = void 0;
const SVEAccount_1 = require("./SVEAccount");
const SVEGroup_1 = require("./SVEGroup");
const SVESystemInfo_1 = require("./SVESystemInfo");
const SVEData_1 = require("./SVEData");
var SVEProjectType;
(function (SVEProjectType) {
    SVEProjectType[SVEProjectType["Vacation"] = 0] = "Vacation";
    SVEProjectType[SVEProjectType["Sales"] = 1] = "Sales";
})(SVEProjectType = exports.SVEProjectType || (exports.SVEProjectType = {}));
class SVEProject {
    constructor(idx, handler, onReady) {
        this.id = NaN;
        this.name = "";
        this.type = SVEProjectType.Vacation;
        // if get by id
        if (typeof idx === "number") {
            if (typeof SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
                SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase.query("SELECT * FROM projects WHERE id = ?", [idx], (err, results) => {
                    if (err) {
                        this.id = NaN;
                        if (onReady !== undefined)
                            onReady(this);
                    }
                    else {
                        if (results.length === 0) {
                            this.id = NaN;
                            if (onReady !== undefined)
                                onReady(this);
                        }
                        else {
                            this.id = idx;
                            this.name = results[0].name;
                            this.handler = handler;
                            this.group = new SVEGroup_1.SVEGroup(results[0].context, handler, (s) => {
                                this.owner = new SVEAccount_1.SVEAccount({ id: results[0].owner }, (st) => {
                                    if (onReady !== undefined)
                                        onReady(this);
                                });
                            });
                        }
                    }
                });
            }
            else {
                () => __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/project/' + idx, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.status < 400) {
                        response.json().then((val) => {
                            this.id = val.id;
                            this.name = val.name;
                            this.type = val.type;
                            this.handler = handler;
                            this.owner = new SVEAccount_1.SVEAccount({ id: val.owner }, (s) => {
                                this.group = new SVEGroup_1.SVEGroup(val.group, handler, (self) => {
                                    if (onReady !== undefined)
                                        onReady(this);
                                });
                            });
                        });
                    }
                    else {
                        if (onReady !== undefined)
                            onReady(this);
                    }
                });
            }
        }
        else {
            this.id = idx.id;
            this.group = idx.group;
            this.name = idx.name;
            this.type = idx.type;
            this.handler = handler;
            if (typeof idx.owner === "number") {
                this.owner = new SVEAccount_1.SVEAccount({ id: idx.owner }, (s) => {
                    if (onReady !== undefined)
                        onReady(this);
                });
            }
            else {
                this.owner = idx.owner;
                if (onReady !== undefined)
                    onReady(this);
            }
        }
    }
    getID() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getType() {
        return this.type;
    }
    getOwner() {
        return this.owner;
    }
    getGroup() {
        return this.group;
    }
    getData() {
        return new Promise((resolve, reject) => {
            if (typeof SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
                SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase.query("SELECT * FROM files WHERE project = ?", [this.id], (err, results) => {
                    if (err) {
                        reject(null);
                    }
                    else {
                        let r = [];
                        let i = 0;
                        results.forEach((element) => {
                            r.push(new SVEData_1.SVEData(this.handler, element.id, (s) => {
                                i++;
                                if (i === results.length) {
                                    resolve(r);
                                }
                            }));
                        });
                        if (results.length === 0) {
                            resolve(r);
                        }
                    }
                });
            }
        });
    }
}
exports.SVEProject = SVEProject;
