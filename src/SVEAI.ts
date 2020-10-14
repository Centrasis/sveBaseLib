import {SVEData} from './SVEData';
import {SVESystemInfo} from './SVESystemInfo';

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
            fetch(SVESystemInfo.getInstance().sources.aiService + '/models/' + model, {
                method: 'PATCH',
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
}