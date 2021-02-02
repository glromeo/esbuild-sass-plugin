"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoot = void 0;
var lit_element_1 = require("lit-element");
var AppRoot = /** @class */ (function (_super) {
    __extends(AppRoot, _super);
    function AppRoot() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.message = 'Learn LitElement';
        return _this;
    }
    Object.defineProperty(AppRoot, "styles", {
        get: function () {
            return lit_element_1.css(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      h1 {\n        font-size: 4rem;\n      }\n      .wrapper {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        flex-direction: column;\n        height: 100vh;\n        background-color: #2196f3;\n        background: linear-gradient(315deg, #b4d2ea 0%, #2196f3 100%);\n        font-size: 24px;\n      }\n      .link {\n        color: white;\n      }\n    "], ["\n      h1 {\n        font-size: 4rem;\n      }\n      .wrapper {\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        flex-direction: column;\n        height: 100vh;\n        background-color: #2196f3;\n        background: linear-gradient(315deg, #b4d2ea 0%, #2196f3 100%);\n        font-size: 24px;\n      }\n      .link {\n        color: white;\n      }\n    "])));
        },
        enumerable: false,
        configurable: true
    });
    AppRoot.prototype.render = function () {
        return lit_element_1.html(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      <div class=\"wrapper\">\n        <h1>LitElement + Snowpack</h1>\n        <p>Edit <code>src/app-root.ts</code> and save to reload.</p>\n        <a\n          class=\"link\"\n          href=\"https://lit-element.polymer-project.org/\"\n          target=\"_blank\"\n          rel=\"noopener noreferrer\"\n        >\n          ", "\n        </a>\n      </div>\n    "], ["\n      <div class=\"wrapper\">\n        <h1>LitElement + Snowpack</h1>\n        <p>Edit <code>src/app-root.ts</code> and save to reload.</p>\n        <a\n          class=\"link\"\n          href=\"https://lit-element.polymer-project.org/\"\n          target=\"_blank\"\n          rel=\"noopener noreferrer\"\n        >\n          ", "\n        </a>\n      </div>\n    "])), this.message);
    };
    __decorate([
        lit_element_1.property()
    ], AppRoot.prototype, "message", void 0);
    AppRoot = __decorate([
        lit_element_1.customElement('app-root')
    ], AppRoot);
    return AppRoot;
}(lit_element_1.LitElement));
exports.AppRoot = AppRoot;
var templateObject_1, templateObject_2;
