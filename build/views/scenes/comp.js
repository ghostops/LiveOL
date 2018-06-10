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
var const_1 = require("utils/const");
var api_1 = require("api");
var OLComp = /** @class */ (function (_super) {
    __extends(OLComp, _super);
    function OLComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { comp: null, classes: null, passings: false };
        _this.renderClass = function (_a) {
            var className = _a.className;
            return (React.createElement(native_base_1.ListItem, { key: className, onPress: function () {
                    var id = _this.props.navigation.state.params.id;
                    _this.props.navigation.push('class', {
                        id: id,
                        className: className,
                        title: className,
                    });
                } },
                React.createElement(native_base_1.Text, { style: {
                        fontSize: const_1.UNIT,
                    } }, className)));
        };
        _this.renderInner = function () {
            if (!_this.state.comp || !_this.state.classes) {
                return React.createElement(native_base_1.Spinner, { color: "#e86a1e" });
            }
            return (React.createElement(native_base_1.View, { style: { padding: 10 } },
                React.createElement(native_base_1.Card, null,
                    React.createElement(native_base_1.CardItem, { header: true },
                        React.createElement(native_base_1.Title, { style: {
                                fontSize: const_1.UNIT * 1.15,
                            } }, _this.state.comp.name)),
                    React.createElement(native_base_1.CardItem, null,
                        React.createElement(native_base_1.Body, null,
                            React.createElement(native_base_1.Text, { style: {
                                    fontSize: const_1.UNIT,
                                } },
                                "Organized by: ",
                                _this.state.comp.organizer))),
                    React.createElement(native_base_1.CardItem, { footer: true },
                        React.createElement(native_base_1.Text, { style: {
                                fontSize: const_1.UNIT * 1.1,
                            } }, _this.state.comp.date))),
                React.createElement(native_base_1.View, { style: {
                        marginVertical: 15,
                        flexDirection: 'row',
                    } },
                    React.createElement(native_base_1.View, { style: { flex: 1 } },
                        React.createElement(native_base_1.Title, { style: {
                                textAlign: 'left',
                                fontSize: const_1.UNIT * 1.25,
                            } }, "Classes")),
                    React.createElement(native_base_1.View, null,
                        React.createElement(native_base_1.Button, { small: true, info: true, onPress: function () {
                                var id = _this.props.navigation.state.params.id;
                                _this.props.navigation.push('passings', {
                                    id: id,
                                    title: _this.state.comp.name,
                                });
                            } },
                            React.createElement(native_base_1.Text, { style: {
                                    fontSize: const_1.UNIT,
                                } }, "Last Passings")))),
                React.createElement(native_base_1.List, { style: {
                        backgroundColor: '#FFF',
                        borderRadius: 4,
                    } }, _this.state.classes.length < 1 ?
                    (React.createElement(native_base_1.Text, { style: {
                            textAlign: 'center',
                            paddingVertical: 10,
                            fontSize: const_1.UNIT,
                        } }, "No classes")) : _this.state.classes.map(_this.renderClass))));
        };
        return _this;
    }
    OLComp.prototype.componentWillMount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var id, comp, classes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = this.props.navigation.state.params.id;
                        return [4 /*yield*/, api_1.getComp(id)];
                    case 1:
                        comp = _a.sent();
                        return [4 /*yield*/, api_1.getClasses(id)];
                    case 2:
                        classes = _a.sent();
                        this.setState({ comp: comp, classes: classes });
                        return [2 /*return*/];
                }
            });
        });
    };
    OLComp.prototype.render = function () {
        return (React.createElement(native_base_1.Container, null,
            React.createElement(native_base_1.Content, null, this.renderInner())));
    };
    OLComp.navigationOptions = function (_a) {
        var navigation = _a.navigation;
        return ({
            title: "" + navigation.state.params.title,
            headerTitleStyle: {
                color: 'white',
            },
            headerStyle: {
                backgroundColor: '#e86a1e',
            },
            headerTintColor: 'white',
        });
    };
    return OLComp;
}(React.PureComponent));
exports.OLComp = OLComp;
//# sourceMappingURL=comp.js.map