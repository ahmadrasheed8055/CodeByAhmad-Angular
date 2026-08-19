import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminShellComponent } from './layout/admin-shell/admin-shell.component';
import { AdminLoginComponent } from './auth/admin-login/admin-login.component';
import { adminAuthGuard } from './auth/admin-auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { PostListComponent } from './posts/post-list/post-list.component';
import { ReportListComponent } from './reports/report-list/report-list.component';
import { CategoryListComponent } from './categories/category-list/category-list.component';
import { PollListComponent } from './polls/poll-list/poll-list.component';
import { AdminListComponent } from './management/admin-list/admin-list.component';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserListComponent },
      { path: 'posts', component: PostListComponent },
      { path: 'reports', component: ReportListComponent },
      { path: 'reports/:id', loadComponent: () => import('./reports/report-detail/report-detail.component').then(m => m.ReportDetailComponent) },
      { path: 'categories', component: CategoryListComponent },
      { path: 'polls', component: PollListComponent },
      { path: 'admins', component: AdminListComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
