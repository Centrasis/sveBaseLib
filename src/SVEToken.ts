import { promises } from 'fs';
import { SVEAccount } from './SVEAccount';
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

export interface Token {
    user?: number,
    token: string,
    type: TokenType,
    time: Date,
    ressource?: number
}

export class SVEToken {
    public static register(type: TokenType, target: SVEGroup | SVEAccount): Promise<string> {
        return new  Promise<string>((resolve, reject) => {
            fetch(SVESystemInfo.getAuthRoot() + '/token/new', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    type: type,
                    target: target.getID()
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
    protected target: SVEAccount | SVEGroup;

    constructor(token: string, type: TokenType, target: SVEAccount | SVEGroup, onValidated:(token: SVEToken) => void) {
        this.token = token;
        this.type = type;
        this.target = target;
        if(!SVESystemInfo.getIsServer()) {
            console.log("Validate token!");
            try {
                fetch(SVESystemInfo.getAuthRoot() + '/token/validate', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        type: type,
                        target: target.getID(),
                        token: token
                    })
                }).then(response => {
                    if(response.status < 400) {
                        response.json().then(val => {
                            this.isValid = val.valid as boolean;
                            onValidated(this);
                        });
                    } else {
                        onValidated(this);
                    }
                });
            } catch {
                onValidated(this);
            }
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

    public use(): Promise<void> {
        console.log("Use token!");
        return new Promise<void>((resolve, reject) => {
            if(this.isValid) {
                fetch(SVESystemInfo.getAuthRoot() + '/token/use', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        type: this.type,
                        target: this.target.getID(),
                        token: this.token
                    })
                }).then(response => {
                    if(response.status < 400) {
                        response.json().then(val => {
                            if(val.success as boolean === true) {
                                resolve();
                            } else {
                                reject();
                            }
                        });
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