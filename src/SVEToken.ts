import { promises } from 'fs';
import { SessionUserInitializer, SVEAccount } from './SVEAccount';
import {SVEGroup} from './SVEGroup';
import {SVESystemInfo} from './SVESystemInfo';

export enum TokenType {
    RessourceToken = 1,
    DeviceToken = 2
}

export interface TokenUserLoginInfo {
    user?: number,
    token: string
}

export interface TokenInfo {
    name: string;
    time: Date;
    type: TokenType;
    target: number;
    deviceAgent: string;
}

export interface Token extends TokenInfo {
    token: string
}

export class SVEToken {
    public static register(owner: SVEAccount, type: TokenType, target: SVEGroup | SVEAccount): Promise<string> {
        return new  Promise<string>((resolve, reject) => {
            fetch(SVESystemInfo.getAuthRoot() + '/token/new', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    type: type,
                    target: target.getID(),
                    sessionID: owner.getSessionID()
                })
            }).then(response => {
                if(response.status < 400) {
                    response.json().then(val => {
                        resolve(val.token as string);
                    });
                } else {
                    reject();
                }
            });
        });
    }

    protected isValid: boolean = false;
    protected token: string = "";
    protected type: TokenType;
    protected target: SVEAccount | SVEGroup | number;

    constructor(token: string, type: TokenType, target: SVEAccount | SVEGroup | number, onValidated:(token: SVEToken) => void) {
        this.token = token;
        this.type = type;
        this.target = target;
        if(!SVESystemInfo.getIsServer()) {
            fetch(SVESystemInfo.getAuthRoot() + '/token/validate', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    type: type,
                    target: (typeof target === "number") ? target : target.getID(),
                    token: token
                })
            }).then(response => {
                if(response.status < 400) {
                    this.isValid = true;
                    onValidated(this);
                } else {
                    onValidated(this);
                }
            });
        } else {
            console.log("Tokens should only be instanciated by clients!");
            onValidated(this);
        }
    }

    public getIsValid(): boolean {
        return this.isValid;
    }

    public setIsValid() {
        this.isValid = true;
    }

    public invalidate(user: SVEAccount) {
        fetch(SVESystemInfo.getAuthRoot() + '/token', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                type: this.type,
                target: (typeof this.target === "number") ? this.target : this.target.getID(),
                token: this.token,
                sessionID: user.getSessionID()
            })
        });
    }

    public listDevices(user: SVEAccount): Promise<TokenInfo[]> {
        return new Promise<TokenInfo[]>((resolve, reject) => {
            fetch(SVESystemInfo.getAuthRoot() + '/token/devices?sessionID=' + user.getSessionID(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                }
            }).then(response => {
                if(response.status < 400) {
                    response.json().then(j => {
                        resolve(j as TokenInfo[]);
                    }, err => reject(err));
                } else {
                    reject();
                }
            }, err => reject(err));
        });
    }

    public use(user: SVEAccount | undefined = undefined): Promise<SVEAccount | undefined> {
        return new Promise<SVEAccount | undefined>((resolve, reject) => {
            if(this.isValid) {
                fetch(SVESystemInfo.getAuthRoot() + '/token/use', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        type: this.type,
                        target: (typeof this.target === "number") ? this.target : this.target.getID(),
                        token: this.token,
                        sessionID: (user !== undefined) ? user.getSessionID() : ""
                    })
                }).then(response => {
                    if(response.status < 400) {
                        if (this.type == TokenType.DeviceToken) {
                            response.json().then(val => {
                                new SVEAccount(val as SessionUserInitializer, (usr) => {
                                    resolve(usr);
                                });
                            });
                        } else {
                            resolve(undefined);
                        }
                    } else {
                        reject();
                    }
                });
            } else {
                reject();
            }
        });
    }
}