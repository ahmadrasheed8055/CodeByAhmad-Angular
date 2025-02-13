import { Routes } from "@angular/router";
import { RegisterComponent } from "./website/auth/register/register.component";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./website/home/home.component";

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
    component: RegisterComponent,
  },
];
