import { SVEAccount } from './SVEAccount';
import { SVEProject } from './SVEProject';
import { SVESystemInfo } from './SVESystemInfo';
export var SVEDataType;
(function (SVEDataType) {
    SVEDataType[SVEDataType["Image"] = 0] = "Image";
    SVEDataType[SVEDataType["Video"] = 1] = "Video";
    SVEDataType[SVEDataType["PDF"] = 2] = "PDF";
    SVEDataType[SVEDataType["CSV"] = 3] = "CSV";
    SVEDataType[SVEDataType["BLOB"] = 4] = "BLOB";
})(SVEDataType || (SVEDataType = {}));
export var SVEDataVersion;
(function (SVEDataVersion) {
    SVEDataVersion[SVEDataVersion["Full"] = 0] = "Full";
    SVEDataVersion[SVEDataVersion["Small"] = 1] = "Small";
    SVEDataVersion[SVEDataVersion["Preview"] = 2] = "Preview";
})(SVEDataVersion || (SVEDataVersion = {}));
var mimeMap = new Map();
mimeMap.set("html", 'text/html');
mimeMap.set("txt", 'text/css');
mimeMap.set("css", 'text/html');
mimeMap.set("gif", 'image/gif');
mimeMap.set("jpg", 'image/jpeg');
mimeMap.set("jpeg", 'image/jpeg');
mimeMap.set("png", 'image/png');
mimeMap.set("svg", 'image/svg+xml');
mimeMap.set("js", 'application/javascript');
mimeMap.set("mp4", 'video/mp4');
mimeMap.set("mov", 'video/quicktime');
mimeMap.set("mpeg", 'video/mpeg');
mimeMap.set("mpg", 'video/mpeg');
mimeMap.set("mpe", 'video/mpeg');
mimeMap.set("avi", 'video/x-msvideo');
mimeMap.set("ogg", 'video/ogg');
mimeMap.set("pdf", 'application/pdf');
mimeMap.set("tiff", 'image/tiff');
mimeMap.set("tif", 'image/tiff');
var typeMap = new Map();
typeMap.set(SVEDataType.CSV, ['.csv', '.xlsx']);
typeMap.set(SVEDataType.Image, [".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".raw", ".gif"]);
typeMap.set(SVEDataType.Video, [".avi", ".mp4", ".mpg", ".mpeg", ".m4v", ".mov", ".ogg"]);
typeMap.set(SVEDataType.PDF, [".pdf"]);
typeMap.set(SVEDataType.BLOB, []);
var SVEData = /** @class */ (function () {
    // gets the data by index if initInfo is number. Else a new data record is created on server
    function SVEData(handler, initInfo, onComplete) {
        var _this = this;
        this.type = SVEDataType.Image;
        this.id = -1;
        this.name = "";
        this.lastAccess = new Date();
        this.creation = new Date();
        this.handler = handler;
        if (typeof initInfo === "number") {
            this.id = initInfo;
            if (typeof SVESystemInfo.getInstance().sources.sveService !== undefined) {
                fetch(SVESystemInfo.getInstance().sources.sveService + '/data/' + this.id, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    if (response.status < 400) {
                        response.json().then(function (val) {
                            _this.id = val.id;
                            _this.type = val.type;
                            _this.creation = val.creation;
                            _this.lastAccess = val.lastAccess;
                            _this.name = val.name;
                            new SVEProject(val.project.id, _this.handler, function (prj) {
                                _this.parentProject = prj;
                                onComplete(_this);
                            });
                        });
                    }
                    else {
                        _this.id = -1;
                        onComplete(_this);
                    }
                }, function (err) { return onComplete(_this); });
            }
        }
        else {
            if (initInfo.id !== undefined) {
                this.id = initInfo.id;
            }
            this.type = initInfo.type;
            this.data = initInfo.data;
            this.name = (initInfo.name !== undefined) ? initInfo.name : "";
            if (initInfo.path !== undefined)
                this.localDataInfo = initInfo.path;
            this.parentProject = initInfo.parentProject;
            this.owner = initInfo.owner;
            if (initInfo.creation !== undefined)
                this.creation = initInfo.creation;
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
        this.owner = new SVEAccount({ id: result.user_id }, function (s) {
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
    //returns -1 when called by client
    SVEData.prototype.getSize = function (version) {
        return -1;
    };
    SVEData.prototype.getOwner = function () {
        var _this = this;
        if (typeof this.owner === "number") {
            return new Promise(function (resolve, reject) {
                _this.owner = new SVEAccount({ id: _this.owner }, function (s) {
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
    SVEData.type2Str = function (t) {
        if (t === SVEDataType.Image) {
            return "Image";
        }
        if (t === SVEDataType.Video) {
            return "Video";
        }
        if (t === SVEDataType.PDF) {
            return "PDF";
        }
        if (t === SVEDataType.CSV) {
            return "CSV";
        }
        return "BLOB";
    };
    SVEData.getTypeFromExt = function (str) {
        var inStr = str.toLowerCase();
        var retType = SVEDataType.BLOB;
        [SVEDataType.CSV, SVEDataType.Image, SVEDataType.PDF, SVEDataType.Video].forEach(function (type) {
            typeMap.get(type).forEach(function (ext) {
                if (inStr.endsWith(ext)) {
                    retType = type;
                }
            });
        });
        return retType;
    };
    SVEData.prototype.getName = function () {
        if (this.localDataInfo === undefined) {
            return this.name;
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
            resolve(false);
        });
    };
    SVEData.prototype.remove = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAPIRoot() + "/project/" + _this.parentProject.getID() + "/data/" + _this.id + "/", {
                method: 'DELETE',
                headers: {
                    'Accept': '*'
                }
            }).then(function (response) {
                resolve(response.status == 200);
            });
        });
    };
    SVEData.prototype.getURI = function (version, download) {
        if (download === void 0) { download = false; }
        return (SVESystemInfo.getAPIRoot() + "/project/" + this.parentProject.getID() + "/data/" + this.id + "/") + ((download) ? "download" : ((SVEDataVersion.Full === version) ? "full" : "preview"));
    };
    SVEData.prototype.getBLOB = function (version) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.data === undefined || _this.currentDataVersion !== version) {
                _this.currentDataVersion = version;
                var self = _this;
                fetch(_this.getURI(version), {
                    method: 'GET',
                    headers: {
                        'Accept': '*'
                    }
                }).then(function (response) {
                    if (response.status < 400) {
                        response.arrayBuffer().then(function (val) {
                            self.data = val;
                            resolve(self.data);
                        });
                    }
                    else {
                        reject(null);
                    }
                }, function (err) { return reject(err); });
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
    SVEData.prototype.getLocalPath = function (version) {
        return "";
    };
    return SVEData;
}());
export { SVEData };
