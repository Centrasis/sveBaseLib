var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { SVEGroup } from './SVEGroup';
import { SVEProject } from './SVEProject';
import { SVESystemInfo } from './SVESystemInfo';
export var QueryResultType;
(function (QueryResultType) {
    QueryResultType[QueryResultType["Project"] = 0] = "Project";
    QueryResultType[QueryResultType["Group"] = 1] = "Group";
})(QueryResultType || (QueryResultType = {}));
var SVEQuery = /** @class */ (function () {
    function SVEQuery() {
    }
    SVEQuery.query = function (str, requester) {
        return new Promise(function (res, rej) {
            res([]);
        });
    };
    return SVEQuery;
}());
export { SVEQuery };
var SVEProjectQuery = /** @class */ (function (_super) {
    __extends(SVEProjectQuery, _super);
    function SVEProjectQuery() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SVEProjectQuery.query = function (str, requester) {
        return new Promise(function (resolve, reject) {
            if (typeof SVESystemInfo.getAPIRoot() !== undefined) {
                fetch(SVESystemInfo.getAPIRoot() + '/query/' + encodeURI(str) + "?sessionID=" + encodeURI(requester.getSessionID()), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    if (response.status < 400) {
                        response.json().then(function (val) {
                            var results = [];
                            val.forEach(function (res) {
                                results.push({
                                    typ: res.typ,
                                    id: Number(res.id),
                                    distance: Number(res.distance)
                                });
                            });
                            results = results.sort(function (a, b) { return a.distance - b.distance; });
                            var r = [];
                            var i = 0;
                            for (var j = 0; j < results.length; j++) {
                                var res = results[j];
                                if (res.typ === QueryResultType.Project) {
                                    new SVEProject(res.id, requester, function (prj) {
                                        r.push(prj);
                                        i++;
                                        if (i >= results.length) {
                                            resolve(r);
                                        }
                                    });
                                }
                                else {
                                    new SVEGroup({ id: res.id }, requester, function (group) {
                                        if (group !== undefined)
                                            r.push(group);
                                        i++;
                                        if (i >= results.length) {
                                            resolve(r);
                                        }
                                    });
                                }
                            }
                            ;
                            if (results.length === 0) {
                                resolve([]);
                            }
                        });
                    }
                    else {
                        resolve([]);
                    }
                });
            }
            else {
                resolve([]);
            }
        });
    };
    return SVEProjectQuery;
}(SVEQuery));
export { SVEProjectQuery };
