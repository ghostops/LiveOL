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
var react_native_1 = require("react-native");
var api_1 = require("api");
var OLClass = /** @class */ (function (_super) {
    __extends(OLClass, _super);
    function OLClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { olClass: null, polling: false };
        _this.poll = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, id, className, olClass;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.props.navigation.state.params, id = _a.id, className = _a.className;
                        return [4 /*yield*/, api_1.getClass(id, className)];
                    case 1:
                        olClass = _b.sent();
                        this.setState({ olClass: olClass });
                        return [2 /*return*/];
                }
            });
        }); };
        _this.startPoll = function () { return _this.interval = setInterval(_this.poll, 15000); };
        _this.clearPoll = function () { return _this.interval && clearInterval(_this.interval); };
        _this.renderResult = function (result) {
            return (React.createElement(native_base_1.ListItem, { key: result.start + result.name, style: {
                    flexDirection: 'column',
                } },
                React.createElement(native_base_1.View, { style: {
                        flexDirection: 'row',
                        flex: 1,
                    } },
                    React.createElement(native_base_1.View, { style: {
                            paddingRight: 15,
                            alignItems: 'center',
                            justifyContent: 'center',
                        } }, result.place.length > 0 &&
                        result.place !== '-' &&
                        React.createElement(native_base_1.Badge, { style: { backgroundColor: '#e86a1e' } },
                            React.createElement(native_base_1.Text, { style: {
                                    fontSize: const_1.UNIT,
                                } }, result.place))),
                    React.createElement(native_base_1.View, { style: { flex: 1 } },
                        React.createElement(native_base_1.View, { style: {
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                flex: 1,
                            } },
                            React.createElement(native_base_1.Text, { numberOfLines: 1, style: {
                                    textAlign: 'left',
                                    fontSize: const_1.UNIT,
                                    flex: 1,
                                } }, result.name),
                            React.createElement(native_base_1.Text, { style: {
                                    marginLeft: 10,
                                    fontSize: const_1.UNIT * 1.35,
                                } }, result.result)),
                        React.createElement(native_base_1.View, { style: {
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                flex: 1,
                            } },
                            React.createElement(react_native_1.TouchableOpacity, { onPress: function () {
                                    var id = _this.props.navigation.state.params.id;
                                    _this.props.navigation.push('club', {
                                        id: id,
                                        clubName: result.club,
                                        title: result.club,
                                    });
                                }, style: {
                                    flex: 1,
                                    maxWidth: '90%',
                                } },
                                React.createElement(native_base_1.Text, { numberOfLines: 1, style: {
                                        color: '#428bca',
                                        fontSize: const_1.UNIT,
                                    } }, result.club)),
                            React.createElement(native_base_1.Text, { style: {
                                    fontSize: const_1.UNIT,
                                    textAlign: 'right',
                                } }, result.timeplus))))));
        };
        _this.renderInner = function () {
            if (!_this.state.olClass) {
                return React.createElement(native_base_1.Spinner, { color: "#e86a1e" });
            }
            return (React.createElement(native_base_1.View, { style: {
                    padding: 10,
                } },
                React.createElement(native_base_1.Title, { style: {
                        textAlign: 'left',
                        fontSize: const_1.UNIT * 1.35,
                        marginVertical: 10,
                    } },
                    "Results for: ",
                    _this.state.olClass.className),
                React.createElement(native_base_1.Card, { style: { marginBottom: 10 } },
                    React.createElement(native_base_1.CardItem, { style: { paddingVertical: 8 } },
                        React.createElement(native_base_1.Text, { style: { flex: 1, fontSize: const_1.UNIT } }, "Turn on live updating results:"),
                        React.createElement(native_base_1.Switch, { value: _this.state.polling, onTintColor: "#e86a1e", onValueChange: function (polling) { return _this.setState({ polling: polling }); } }))),
                React.createElement(native_base_1.List, { style: {
                        backgroundColor: '#FFF',
                        borderRadius: 4,
                    } }, _this.state.olClass.results.length < 1 ?
                    (React.createElement(native_base_1.Text, { style: { textAlign: 'center', paddingVertical: 10 } }, "No classes")) : _this.state.olClass.results.map(_this.renderResult))));
        };
        return _this;
    }
    OLClass.prototype.componentWillMount = function () {
        this.poll();
    };
    OLClass.prototype.componentDidMount = function () {
        this.startPoll();
    };
    OLClass.prototype.componentWillUnmount = function () {
        this.clearPoll();
    };
    OLClass.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.state.polling !== prevState.polling) {
            if (this.state.polling) {
                this.poll();
                this.startPoll();
            }
            else {
                this.clearPoll();
            }
        }
    };
    OLClass.prototype.render = function () {
        return (React.createElement(native_base_1.Container, null,
            React.createElement(native_base_1.Content, null, this.renderInner())));
    };
    OLClass.navigationOptions = function (_a) {
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
    return OLClass;
}(React.PureComponent));
exports.OLClass = OLClass;
//# sourceMappingURL=class.js.map