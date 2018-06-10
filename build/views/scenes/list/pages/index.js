"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var native_base_1 = require("native-base");
var api_1 = require("api");
var OLList = /** @class */ (function (_super) {
    __extends(OLList, _super);
    function OLList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            comps: null,
        };
        _this.groupComps = function (comps) {
            var uniqEs6 = function (arrArg) { return (arrArg.filter(function (elem, pos, arr) {
                return arr.indexOf(elem) === pos;
            })); };
            var keys = uniqEs6(comps.map(function (comp) { return comp.date; }));
            var map = {};
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                map[key] = [];
            }
            for (var _a = 0, comps_1 = comps; _a < comps_1.length; _a++) {
                var comp = comps_1[_a];
                map[comp.date].push(comp);
            }
            return map;
        };
        _this.today = function () {
            var d = new Date();
            var month = d.getMonth() + 1;
            var day = d.getDate();
            var output = d.getFullYear() + '-' +
                (month < 10 ? '0' : '') + month + '-' +
                (day < 10 ? '0' : '') + day;
            return output;
        };
        _this.renderListItem = function (comp) { return (React.createElement(native_base_1.ListItem, { key: comp.id, onPress: function () {
                _this.props.navigation.push('comp', { id: comp.id });
            } },
            React.createElement(native_base_1.Text, null, comp.name))); };
        _this.renderInner = function () {
            if (!_this.state.comps) {
                return React.createElement(native_base_1.Spinner, { color: "orange" });
            }
            var comps = _this.groupComps(_this.state.comps);
            var todaySepStyle = {
            // backgroundColor: '#20bf6b',
            };
            var todayTextStyle = {
            // color: '#fff',
            };
            return (React.createElement(native_base_1.List, { style: {
                    backgroundColor: '#FFF',
                } }, Object.keys(comps).map(function (key) {
                return (React.createElement(native_base_1.View, { key: key },
                    React.createElement(native_base_1.ListItem, { itemDivider: true, style: _this.today() === key && todaySepStyle || {} },
                        React.createElement(native_base_1.Text, { style: _this.today() === key && todayTextStyle || {} },
                            key,
                            " ",
                            _this.today() === key && ' (Today)')),
                    comps[key].map(_this.renderListItem)));
            })));
        };
        return _this;
    }
    OLList.prototype.componentDidMount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var comps;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1.getComps()];
                    case 1:
                        comps = _a.sent();
                        this.setState({ comps: comps });
                        return [2 /*return*/];
                }
            });
        });
    };
    OLList.prototype.render = function () {
        return (React.createElement(native_base_1.Container, null,
            React.createElement(native_base_1.Content, null, this.renderInner())));
    };
    OLList.navigationOptions = {
        title: 'Competitions',
    };
    return OLList;
}(React.PureComponent));
exports.OLList = OLList;
//# sourceMappingURL=index.js.map