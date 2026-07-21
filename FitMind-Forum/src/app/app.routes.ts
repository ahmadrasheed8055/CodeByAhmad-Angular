import { Routes } from '@angular/router';
import { RegisterComponent } from './website/auth/register/register.component';
import { AppComponent } from './app.component';
import { HomeComponent } from './website/home/home.component';
import { authGuard } from './Shared/auth.guard';
import { emailTokenGuardGuard } from './Shared/email-token-guard.guard';
import { ErrorComponent } from './website/error/error.component';
import { ProfileSettingComponent } from './website/user/profile-setting/profile-setting.component';
import { NavbarComponent } from './website/navbar/navbar.component';
import { ProfileViewComponent } from './website/user/profile-view/profile-view.component';
import { AddPostComponent } from './website/user/add-post/add-post.component';
import { UserPostsComponent } from './website/user/user-posts/user-posts.component';
import { ForgetPasswordComponent } from './website/auth/forget-password/forget-password.component';

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
      },
      {
        path: 'profile-view',
        component: ProfileViewComponent,
        canActivate: [authGuard],
      },
      {
        path: 'profile/:id',
        component: ProfileViewComponent,
        canActivate: [authGuard],
      },
      {
        path: 'add-post',
        component: AddPostComponent,
        canActivate: [authGuard]
      },
      {
        path:'user-posts',
        component:UserPostsComponent,
        canActivate: [authGuard]
      },
      {
        path: 'post/:id',
        redirectTo: 'home',
      }
    ]
  },
 
  {
    path: 'register',
    canActivate: [emailTokenGuardGuard],
    component: RegisterComponent,
  },
  {
    path: 'forget-password',
    canActivate: [emailTokenGuardGuard],
    component: ForgetPasswordComponent,
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./website/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
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
