import { Routes } from '@angular/router';
import { RegisterComponent } from './website/auth/register/register.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './website/home/home.component';
import { authGuard } from './Shared/auth.guard';
import { emailTokenGuardGuard } from './Shared/email-token-guard.guard';
import { ErrorComponent } from './website/error/error.component';
import { ProfileSettingComponent } from './website/user/profile-setting/profile-setting.component';
import { NavbarComponent } from './website/navbar/navbar.component';

export const routes: Routes = [
  {
    path: '',
    component: NavbarComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'profile-setting',
        component: ProfileSettingComponent,
        canActivate: [authGuard],
      }
    ]
  },

  {
    path: 'register',
    canActivate: [emailTokenGuardGuard],
    component: RegisterComponent,
  },
  {
    path: 'error',
    component: ErrorComponent,
  },
  {
    path: '**', //unknow page link or url
    redirectTo: '/error?status=404'
  }
];
