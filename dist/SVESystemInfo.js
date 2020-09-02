var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SVEAccount } from "./SVEAccount";
class SVESystemInfo {
    constructor() {
        this.systemState = {
            authorizationSystem: false,
            basicSystem: false,
            tokenSystem: false
        };
        this.SQLCredentials = {
            MySQL_DB: "",
            MySQL_Password: "",
            MySQL_User: ""
        };
        this.sources = {
            sveService: undefined,
            persistentDatabase: undefined,
            volatileDatabase: undefined
        };
        SVESystemInfo.isServer = false;
    }
    static getIsServer() {
        return SVESystemInfo.isServer;
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
                reject(false);
            }
        });
    }
    static getSystemStatus() {
        return this.getInstance().systemState;
    }
    static getFullSystemState() {
        return new Promise((resolve, reject) => {
            () => __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(SVESystemInfo.getAPIRoot() + "/check", {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status < 400) {
                    response.json().then(val => {
                        if (!("loggedInAs" in val)) {
                            resolve({
                                authorizationSystem: val.status.authorizationSystem,
                                basicSystem: val.status.basicSystem,
                                tokenSystem: val.status.tokenSystem
                            });
                        }
                        else {
                            let loggedInAs = new SVEAccount(val.loggedInAs, (s) => {
                                resolve({
                                    authorizationSystem: val.status.authorizationSystem,
                                    basicSystem: val.status.basicSystem,
                                    tokenSystem: val.status.tokenSystem,
                                    user: loggedInAs
                                });
                            });
                        }
                    }, err => reject({}));
                }
                else {
                    reject({});
                }
            });
        });
    }
    static getAPIRoot() {
        return (SVESystemInfo.getInstance().sources.sveService !== undefined) ? SVESystemInfo.getInstance().sources.sveService : "";
    }
}
export { SVESystemInfo };
