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
var react_native_1 = require("react-native");
var native_base_1 = require("native-base");
var api_1 = require("api");
var HEIGHT = react_native_1.Dimensions.get('window').height;
var OLPassings = /** @class */ (function (_super) {
    __extends(OLPassings, _super);
    function OLPassings() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            animation: new react_native_1.Animated.Value(HEIGHT),
            passings: null,
        };
        _this.getPasses = function () { return __awaiter(_this, void 0, void 0, function () {
            var passings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1.getPasses(this.props.comp)];
                    case 1:
                        passings = _a.sent();
                        this.setState({ passings: passings });
                        return [2 /*return*/];
                }
            });
        }); };
        _this.renderResult = function (passing) {
            return (React.createElement(native_base_1.ListItem, { key: passing.time + passing.runnerName, style: {
                    flexDirection: 'column',
                } },
                React.createElement(native_base_1.View, { style: {
                        flexDirection: 'row',
                        flex: 1,
                    } },
                    React.createElement(native_base_1.View, { style: { flex: 1 } },
                        React.createElement(native_base_1.View, { style: {
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                flex: 1,
                            } },
                            React.createElement(native_base_1.Text, { style: { textAlign: 'left', flex: 1 } }, passing.class),
                            React.createElement(native_base_1.Text, { style: { marginLeft: 10, fontSize: 22 } }, passing.runnerName)),
                        React.createElement(native_base_1.View, { style: {
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                flex: 1,
                            } },
                            React.createElement(native_base_1.Text, null, passing.passtime))))));
        };
        _this.renderInner = function () {
            return (React.createElement(native_base_1.List, null, _this.state.passings.map(_this.renderResult)));
        };
        return _this;
    }
    OLPassings.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.active !== this.props.active) {
            if (this.props.active) {
                this.getPasses();
                react_native_1.Animated.timing(this.state.animation, { toValue: 0, useNativeDriver: true }).start();
            }
            else {
                react_native_1.Animated.timing(this.state.animation, { toValue: HEIGHT, useNativeDriver: true }).start();
            }
        }
    };
    OLPassings.prototype.render = function () {
        return (React.createElement(react_native_1.Animated.View, { pointerEvents: "none", style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'white',
                transform: [{ translateY: this.state.animation }],
            } },
            React.createElement(native_base_1.View, { style: { flex: 1 } }, this.state.passings
                ? this.renderInner()
                : React.createElement(native_base_1.Spinner, { color: "#e86a1e" }))));
    };
    return OLPassings;
}(React.PureComponent));
exports.OLPassings = OLPassings;
//# sourceMappingURL=passings.js.map