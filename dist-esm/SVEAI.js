import { SVESystemInfo } from './SVESystemInfo';
var SVEClassificator = /** @class */ (function () {
    function SVEClassificator() {
    }
    SVEClassificator.classify = function (model, data, className) {
        return new Promise(function (resolve, reject) {
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
            }).then(function (response) {
                if (response.status < 400) {
                    resolve();
                }
                else {
                    reject();
                }
            });
        });
    };
    SVEClassificator.issueRelearn = function (model) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getInstance().sources.aiService + '/models/' + model, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
                if (response.status < 400) {
                    resolve();
                }
                else {
                    reject();
                }
            });
        });
    };
    return SVEClassificator;
}());
export { SVEClassificator };
