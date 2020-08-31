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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVESystemInfo = void 0;
const fs_1 = __importDefault(require("fs"));
const mysql_1 = __importDefault(require("mysql"));
const mongoose_1 = __importDefault(require("mongoose"));
class SVESystemInfo {
    constructor() {
        this.systemState = {
            authorizationSystem: false,
            basicSystem: false,
            tokenSystem: false
        };
        this.sources = {
            sveService: undefined,
            persistentDatabase: undefined,
            volatileDatabase: undefined
        };
    }
    static getInstance() {
        if (!SVESystemInfo.instance) {
            SVESystemInfo.instance = new SVESystemInfo();
        }
        return SVESystemInfo.instance;
    }
    static initSystem() {
        return new Promise((resolve, reject) => {
            this.instance.systemState = {
                authorizationSystem: false,
                basicSystem: false,
                tokenSystem: false
            };
            if (this.getInstance().sources.sveService !== undefined) {
                () => __awaiter(this, void 0, void 0, function* () {
                    const response = yield fetch(this.getInstance().sources.sveService + '/check', {
                        method: "GET"
                    });
                    if (response.status < 400) {
                        response.json().then(val => {
                            this.instance.systemState = val.status;
                            resolve(true);
                        }, err => reject(false));
                    }
                    else {
                        reject(false);
                    }
                });
            }
            else {
                if (typeof this.getInstance().sources.persistentDatabase === "string") {
                    const txt = fs_1.default.readFileSync('mysqlinfo.json', 'utf8');
                    const dbInfo = JSON.parse(txt);
                    console.log("SQL User: " + dbInfo.MySQL_User);
                    this.getInstance().sources.persistentDatabase = mysql_1.default.createConnection({
                        host: this.getInstance().sources.persistentDatabase,
                        user: dbInfo.MySQL_User,
                        password: dbInfo.MySQL_Password,
                        database: dbInfo.MySQL_DB,
                        charset: "utf8_general_ci",
                        insecureAuth: false,
                        port: 3306,
                        ssl: {
                            rejectUnauthorized: false
                        }
                    });
                    var self = this;
                    if (this.getInstance().sources.persistentDatabase !== undefined) {
                        this.getInstance().sources.persistentDatabase.connect(function (err) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                self.instance.systemState.basicSystem = true;
                                resolve(true);
                            }
                        });
                    }
                    else {
                        reject(null);
                    }
                }
                if (typeof this.getInstance().sources.volatileDatabase === "string") {
                    mongoose_1.default.connect(this.getInstance().sources.volatileDatabase, { useNewUrlParser: true, useUnifiedTopology: true }).then((val) => {
                        this.getInstance().sources.volatileDatabase = val;
                        self.instance.systemState.tokenSystem = true;
                    }, (reason) => {
                        console.log("Cannot connect to volatile DB!");
                    });
                }
            }
        });
    }
    static getSystemStatus() {
        return this.getInstance().systemState;
    }
}
exports.SVESystemInfo = SVESystemInfo;
