import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddEmployeeComponent } from '../add-employee/add-employee.component';
import { HttpClient } from '@angular/common/http';
import { EmployeeServiceService } from '../../services/employee.service.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  obj: any = {
    userName: '',
    password: ''
  }

  http = inject(HttpClient);
  constructor(private employeeService: EmployeeServiceService) {

  }



   router = inject(Router);
  login() {
    debugger;
    this.employeeService.E_login(this.obj).subscribe((r: any) => {
      if (r.result) {
        debugger;
        localStorage.setItem('User', JSON.stringify(r.data));
        this.router.navigateByUrl('add-employees');
      }else{
        alert(r.message);
      }
    });

    // if (this.obj.username == 'ahmad' && this.obj.password == '123') {
    //   // localStorage.setItem('username', this.obj.username);  // save username in local storage
    //   // this.router.navigateByUrl('add-employees');


    // } else {
    //   alert('wrong username or password');
    // }
  }
}
