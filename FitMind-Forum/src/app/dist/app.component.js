"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppComponent = void 0;
var forms_1 = require("@angular/forms");
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var navbar_component_1 = require("./website/navbar/navbar.component");
var footer_component_1 = require("./website/footer/footer.component");
var categories_component_1 = require("./website/categories/categories.component");
var posts_component_1 = require("./website/posts/posts.component");
var http_1 = require("@angular/common/http");
var hero_component_1 = require("./website/hero/hero.component");
var login_component_1 = require("./website/auth/login/login.component");
var register_component_1 = require("./website/auth/register/register.component");
var emailVarification_component_1 = require("./website/auth/emailVarification/emailVarification.component"); // Import this
var AppComponent = /** @class */ (function () {
    function AppComponent() {
        this.title = 'FitMind-Forum';
    }
    AppComponent = __decorate([
        core_1.Component({
            selector: 'app-root',
            standalone: true,
            imports: [router_1.RouterOutlet, navbar_component_1.NavbarComponent, footer_component_1.FooterComponent, categories_component_1.CategoriesComponent, posts_component_1.PostsComponent, http_1.HttpClientModule, hero_component_1.HeroComponent, login_component_1.LoginComponent, register_component_1.RegisterComponent, emailVarification_component_1.EmailVarificationComponent, forms_1.FormsModule],
            templateUrl: './app.component.html',
            styleUrl: './app.component.css'
        })
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
