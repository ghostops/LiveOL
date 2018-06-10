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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_navigation_1 = require("react-navigation");
var list_1 = require("views/scenes/list");
var comp_1 = require("views/scenes/comp");
var class_1 = require("views/scenes/class");
var club_1 = require("views/scenes/club");
var passings_1 = require("views/scenes/passings");
var OLNavigator = react_navigation_1.createStackNavigator({
    home: {
        screen: list_1.OLList,
    },
    comp: {
        screen: comp_1.OLComp,
    },
    class: {
        screen: class_1.OLClass,
    },
    club: {
        screen: club_1.OLClub,
    },
    passings: {
        screen: passings_1.OLPassings,
    },
}, {
    initalRouteName: 'home',
});
console['ignoredYellowBox'] = [
    'Warning: isMounted',
];
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    App.prototype.render = function () {
        return (React.createElement(OLNavigator, null));
    };
    return App;
}(React.PureComponent));
exports.default = App;
//# sourceMappingURL=index.js.map