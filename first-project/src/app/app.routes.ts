import { Routes } from '@angular/router';
import { AddEmployeeComponent } from './Components/add-employee/add-employee.component';
import { DataBindingComponent } from './Components/data-binding/data-binding.component';
import { StructuralDirectiveComponent } from './Components/directives/structural-directive/structural-directive.component';
import { SwitchCaseComponent } from './switch-case/switch-case.component';
import { TemplateFormComponent } from './Components/template-form/template-form.component';
import { ReactiveFormComponent } from './Components/reactive-form/reactive-form.component';
import { GetApiComponent } from './Components/get-api/get-api.component';
import { PostApiComponent } from './Components/post-api/post-api.component';
import { LoginComponent } from './Components/login/login.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [

    //default route
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'add-employees',
                component: AddEmployeeComponent,
                canActivate: [authGuard]
            },
            {
                path: 'data-bindings',
                component: DataBindingComponent
            },
            {
                path: 'structural-directives',
                component: StructuralDirectiveComponent
            }
            ,
            {
                path: 'switch-case',
                component: SwitchCaseComponent
            }
            ,
            {
                path: 'template-form',
                component: TemplateFormComponent
            }
            ,
            {
                path: 'reactive-form',
                component: ReactiveFormComponent
            }
            ,
            {
                path: 'get-api',
                component: GetApiComponent
            }
            ,
            {
                path: 'post-api',
                component: PostApiComponent
            }


        ]
    }];

