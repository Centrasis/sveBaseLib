import { SVESystemInfo } from './SVESystemInfo';
var SVEClassificator = /** @class */ (function () {
    function SVEClassificator() {
    }
    SVEClassificator.classify = function (model, data, className) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAIRoot() + '/model/' + model + "/classify", {
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
    SVEClassificator.issueRelearn = function (model, forceNew) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAIRoot() + '/model/' + model + ((forceNew) ? "/retrain" : "/train"), {
                method: 'POST',
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
    SVEClassificator.getClasses = function (model) {
        return new Promise(function (resolve, reject) {
            fetch(SVESystemInfo.getAIRoot() + "/model/" + model + "/classes", {
                method: "GET"
            }).then(function (response) {
                if (response.status < 400) {
                    response.json().then(function (val) {
                        var ret = [];
                        val.forEach(function (el) {
                            ret.push({
                                key: Number(el.key),
                                class: el.class
                            });
                        });
                        resolve(ret);
                    });
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
