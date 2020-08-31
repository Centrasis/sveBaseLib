import fs from 'fs';
import mysql from 'mysql';
import mongoose from 'mongoose';

export interface SVESources {
    sveService?: string;
    persistentDatabase?: string | mysql.Connection;
    volatileDatabase?: string | typeof mongoose;
    sveDataPath?: string;
}

export interface SVESystemState {
    basicSystem: boolean;
    tokenSystem: boolean;
    authorizationSystem: boolean;
}

class SVESystemInfo {
    private static instance: SVESystemInfo;
    private systemState: SVESystemState = {
        authorizationSystem: false,
        basicSystem: false,
        tokenSystem: false
    };

    private constructor() { 
        this.sources = {
            sveService: undefined,
            persistentDatabase: undefined,
            volatileDatabase: undefined
        };
    }

    public static getInstance(): SVESystemInfo {
        if (!SVESystemInfo.instance) {
            SVESystemInfo.instance = new SVESystemInfo();
        }

        return SVESystemInfo.instance;
    }

    public static initSystem(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.instance.systemState = {
                authorizationSystem: false,
                basicSystem: false,
                tokenSystem: false
            };

            if(this.getInstance().sources.sveService !== undefined) {
                async () => {
                    const response = await fetch(this.getInstance().sources.sveService + '/check',
                    {
                        method: "GET"
                    });

                    if (response.status < 400) {
                        response.json().then(val => {
                            this.instance.systemState = val.status as SVESystemState;
                            resolve(true);
                        }, err => reject(false));
                    } else {
                        reject(false);
                    }
                };
            } else {
                if (typeof this.getInstance().sources.persistentDatabase === "string") {
                    const txt = fs.readFileSync('mysqlinfo.json','utf8');
                    const dbInfo = JSON.parse(txt);
                    console.log("SQL User: " + dbInfo.MySQL_User);
                    this.getInstance().sources.persistentDatabase = mysql.createConnection({
                        host: this.getInstance().sources.persistentDatabase as string,
                        user: dbInfo.MySQL_User,
                        password: dbInfo.MySQL_Password,
                        database: dbInfo.MySQL_DB,
                        charset: "utf8_general_ci",
                        insecureAuth: false,
                        port: 3306,
                        ssl  : {
                            rejectUnauthorized: false
                        }
                    });
                    
                    var self = this;
                    if(this.getInstance().sources.persistentDatabase !== undefined) {
                        (this.getInstance().sources.persistentDatabase! as mysql.Connection).connect(function(err) {
                            if (err) {
                                reject(err);
                            } else {
                                self.instance.systemState.basicSystem = true;
                                resolve(true);
                            }
                        });
                    } else {
                        reject(null);
                    }
                }

                if (typeof this.getInstance().sources.volatileDatabase === "string") {
                    mongoose.connect(this.getInstance().sources.volatileDatabase as string, {useNewUrlParser: true, useUnifiedTopology: true}).then((val) => {
                        this.getInstance().sources.volatileDatabase = val;
                        self.instance.systemState.tokenSystem = true;
                    }, (reason) => {
                        console.log("Cannot connect to volatile DB!");
                    });
                }
            }
        });
    }

    public sources: SVESources;

    public static getSystemStatus(): SVESystemState {
        return this.getInstance().systemState;
    }
}

export {
    SVESystemInfo
}