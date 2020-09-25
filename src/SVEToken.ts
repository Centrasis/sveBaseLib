import { SVEAccount } from './SVEAccount';
import {SVEGroup} from './SVEGroup';
import {SVESystemInfo} from './SVESystemInfo';

export enum TokenType {
    RessourceToken = 1,
    DeviceToken = 2
}

export interface TokenUserLoginInfo {
    name: string,
    token: string
}

export interface Token {
    user: String,
    token: String,
    type: TokenType,
    time: Date,
    ressource: String
}

export class SVEToken {
    public static register(type: TokenType, target: SVEGroup | SVEAccount): Promise<string> {
        return new  Promise<string>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.sveService + '/auth/token/new', {
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
}