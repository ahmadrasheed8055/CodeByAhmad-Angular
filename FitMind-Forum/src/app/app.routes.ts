import { Routes } from "@angular/router";
import { RegisterComponent } from "./website/auth/register/register.component";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./website/home/home.component";
import { authGuard } from './Shared/auth.guard';
import { emailTokenGuardGuard } from "./Shared/email-token-guard.guard";
import { ErrorComponent } from "./website/error/error.component";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
  },
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "app",
    component: AppComponent,
  },
  {
    path: "register",
    canActivate: [emailTokenGuardGuard],
    component: RegisterComponent
  },
  {
    path: "error",
    component:ErrorComponent
  }
];
