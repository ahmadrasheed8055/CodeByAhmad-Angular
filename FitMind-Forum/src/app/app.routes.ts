import { Routes } from '@angular/router';
import { authGuard } from './Shared/auth.guard';
import { emailTokenGuardGuard } from './Shared/email-token-guard.guard';

export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule)
  },
  {
    path: 'register',
    canActivate: [emailTokenGuardGuard],
    loadComponent: () => import('./website/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'forget-password',
    canActivate: [emailTokenGuardGuard],
    loadComponent: () => import('./website/auth/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./website/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'error',
    loadComponent: () => import('./website/error/error.component').then(m => m.ErrorComponent),
  },
  {
    path: '',
    loadComponent: () => import('./website/navbar/navbar.component').then(m => m.NavbarComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        loadComponent: () => import('./website/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'search',
        loadComponent: () => import('./website/search-results/search-results.component').then(m => m.SearchResultsComponent),
      },
      {
        path: 'people',
        loadComponent: () => import('./website/people/people.component').then(m => m.PeopleComponent),
      },
      {
        path: 'profile-setting',
        loadComponent: () => import('./website/user/profile-setting/profile-setting.component').then(m => m.ProfileSettingComponent),
        canActivate: [authGuard],
      },
      {
        path: 'profile-view',
        loadComponent: () => import('./website/user/profile-view/profile-view.component').then(m => m.ProfileViewComponent),
        canActivate: [authGuard],
      },
      {
        path: 'profile/:id',
        loadComponent: () => import('./website/user/profile-view/profile-view.component').then(m => m.ProfileViewComponent),
        canActivate: [authGuard],
      },
      {
        path: 'add-post',
        loadComponent: () => import('./website/user/add-post/add-post.component').then(m => m.AddPostComponent),
        canActivate: [authGuard]
      },
      {
        path: 'user-posts',
        loadComponent: () => import('./website/user/user-posts/user-posts.component').then(m => m.UserPostsComponent),
        canActivate: [authGuard]
      },
      {
        path: 'post/:id',
        redirectTo: 'home',
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/error?status=404'
  }
];
