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
exports.SVEData = exports.SVEDataType = void 0;
const SVEAccount_1 = require("./SVEAccount");
const SVEProject_1 = require("./SVEProject");
const SVESystemInfo_1 = require("./SVESystemInfo");
var SVEDataType;
(function (SVEDataType) {
    SVEDataType[SVEDataType["Image"] = 0] = "Image";
    SVEDataType[SVEDataType["Video"] = 1] = "Video";
    SVEDataType[SVEDataType["PDF"] = 2] = "PDF";
    SVEDataType[SVEDataType["CSV"] = 3] = "CSV";
})(SVEDataType = exports.SVEDataType || (exports.SVEDataType = {}));
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
class SVEData {
    // gets the data by index if initInfo is number. Else a new data record is created on server
    constructor(handler, initInfo, onComplete) {
        this.type = SVEDataType.Image;
        this.id = -1;
        this.lastAccess = new Date();
        this.creation = new Date();
        this.handler = handler;
        if (typeof initInfo === "number") {
            this.id = initInfo;
            if (typeof SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService !== undefined) {
                () => __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/data/' + this.id, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.status < 400) {
                        response.json().then((val) => {
                            this.id = val.id;
                            this.type = val.type;
                            this.creation = val.creation;
                            this.lastAccess = val.lastAccess;
                            this.parentProject = new SVEProject_1.SVEProject(val.project.id, this.handler, (prj) => {
                                onComplete(this);
                            });
                        });
                    }
                    else {
                        this.id = -1;
                        onComplete(this);
                    }
                });
            }
        }
        else {
            if (initInfo.id !== undefined) {
                this.id = initInfo.id;
            }
            this.type = initInfo.type;
            this.data = initInfo.data;
            this.parentProject = initInfo.parentProject;
            if (typeof SVESystemInfo_1.SVESystemInfo.getInstance().sources.persistentDatabase !== "string") {
            }
            else {
            }
            onComplete(this);
        }
    }
    static getMimeTypeMap() {
        return mimeMap;
    }
    initFromResult(result, onComplete) {
        this.localDataInfo = {
            filePath: result.path,
            thumbnailPath: result.thumbnail
        };
        this.creation = result.creation;
        this.lastAccess = result.lastAccess;
        if (result.type === "Image") {
            this.type = SVEDataType.Image;
        }
        if (result.type === "Video") {
            this.type = SVEDataType.Video;
        }
        if (result.type === "PDF") {
            this.type = SVEDataType.PDF;
        }
        if (result.type === "CSV") {
            this.type = SVEDataType.CSV;
        }
        this.owner = new SVEAccount_1.SVEAccount({ id: result.user_id }, (s) => {
            onComplete();
        });
    }
    getID() {
        return this.id;
    }
    getOwner() {
        return this.owner;
    }
    getCreationDate() {
        return this.creation;
    }
    getLastAccessDate() {
        return this.lastAccess;
    }
    getCacheType() {
        let r = "private";
        if (this.type === SVEDataType.PDF) {
            r = "no-store";
        }
        return r;
    }
    getContentType() {
        let r = "application/octet-stream";
        if (this.localDataInfo !== undefined) {
            var path = require('path');
            r = mimeMap.get(path.extname(this.localDataInfo.filePath).slice(1).toLowerCase());
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
    }
    getName() {
        if (this.localDataInfo === undefined) {
            return "";
        }
        else {
            var path = require('path');
            return path.basename(this.localDataInfo.filePath);
        }
    }
    getType() {
        return this.type;
    }
    getProject() {
        return this.parentProject;
    }
    store() {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
    getBLOB() {
        return new Promise((resolve, reject) => {
            if (this.data === undefined) {
                var self = this;
                () => __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(SVESystemInfo_1.SVESystemInfo.getInstance().sources.sveService + '/data/' + this.id + "/download", {
                        method: 'GET',
                        headers: {
                            'Accept': '*'
                        }
                    });
                    if (response.status < 400) {
                        response.arrayBuffer().then((val) => {
                            self.data = val;
                            resolve(self.data);
                        });
                    }
                    else {
                        reject(null);
                    }
                });
                return;
            }
            if (this.data !== undefined) {
                resolve(this.data);
            }
            else {
                reject(null);
            }
        });
    }
    getStream() {
        return new Promise((resolve, reject) => {
            if (this.data !== undefined) {
                var self = this;
                this.data.on('error', function (err) {
                    reject(null);
                });
                this.data.on('open', function () {
                    resolve(self.data);
                });
            }
            else {
                reject(null);
            }
        });
    }
}
exports.SVEData = SVEData;
