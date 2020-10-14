import {SVEData} from './SVEData';
import {SVESystemInfo} from './SVESystemInfo';

export interface AIClass {
    key: number,
    class: string
}

export class SVEClassificator {
    public static classify(model: string, data: SVEData, className: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.aiService + '/models/' + model + "/classify", {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    file: data.getID(),
                    class: className
                })
            }).then(response => {
                if(response.status < 400) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    public static issueRelearn(model: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.aiService + '/models/' + model + "/train", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                }
            }).then(response => {
                if (response.status < 400) {
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    public static getClasses(model: string): Promise<AIClass[]> {
        return new Promise<AIClass[]>((resolve, reject) => {
            fetch(SVESystemInfo.getInstance().sources.aiService + "/models/" + model + "/classes", {
                method: "GET"
              }).then(response => {
                if (response.status < 400) {
                  response.json().then(val => {
                    let ret: AIClass[] = [];
                    val.forEach((el: any) => {
                      ret.push({
                        key: Number(el.key),
                        class: el.class as string
                      });
                    });
                    resolve(ret);
                  });
                } else {
                    reject();
                }
              });
        });
    }
}