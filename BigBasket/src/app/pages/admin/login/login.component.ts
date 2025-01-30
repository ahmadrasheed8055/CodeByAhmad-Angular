import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  adminObj: any = {
    email: '',
    password: ''
  }

  constructor(private router:Router) { 
   
  }

  adminLogin() {
    if (this.adminObj.email === 'ahmad@gmail.com' && this.adminObj.password === '1122') {
      this.router.navigateByUrl('products');
    }else{
      alert('Invalid email or password!');
    }


  }
}
