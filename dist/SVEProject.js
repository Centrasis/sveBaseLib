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
exports.SVEProject = exports.isProjectInitializer = exports.SVEProjectType = void 0;
const SVEAccount_1 = require("./SVEAccount");
const SVEGroup_1 = require("./SVEGroup");
const SVESystemInfo_1 = require("./SVESystemInfo");
const SVEData_1 = require("./SVEData");
var SVEProjectType;
(function (SVEProjectType) {
    SVEProjectType[SVEProjectType["Vacation"] = 0] = "Vacation";
    SVEProjectType[SVEProjectType["Sales"] = 1] = "Sales";
})(SVEProjectType = exports.SVEProjectType || (exports.SVEProjectType = {}));
function isProjectInitializer(init) {
    return ((typeof init !== "number") && "id" in init && "name" in init && "group" in init);
}
exports.isProjectInitializer = isProjectInitializer;
class SVEProject {
    constructor(idx, handler, onReady) {
        this.id = NaN;
        this.name = "";
        this.type = SVEProjectType.Vacation;
        // if get by id
        if (!isProjectInitializer(idx)) {
            console.log("Init prj from id");
            if (SVESystemInfo_1.SVESystemInfo.getIsServer()) {
                if (onReady !== undefined)
                    onReady(this);
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
            console.log("Init prj from init block!");
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
        if (typeof this.owner === "number") {
            return new Promise((resolve, reject) => {
                this.owner = new SVEAccount_1.SVEAccount({ id: this.owner }, (s) => {
                    resolve(this.owner);
                });
            });
        }
        else {
            return new Promise((resolve, reject) => {
                if (this.owner == undefined) {
                    reject();
                }
                else {
                    resolve(this.owner);
                }
            });
        }
    }
    getGroup() {
        return this.group;
    }
    getData() {
        return new Promise((resolve, reject) => {
            () => __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/project/' + this.id + '/data/list', {
                    method: "GET"
                });
                if (response.status < 400) {
                    response.json().then(val => {
                        let r = [];
                        let i = 0;
                        if (val.length > 0) {
                            val.foreach((v) => {
                                r.push(new SVEData_1.SVEData(this.handler, { id: v.id, parentProject: this, type: v.type }, (s) => {
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
                    }, err => reject(false));
                }
                else {
                    reject(false);
                }
            });
        });
    }
}
exports.SVEProject = SVEProject;
