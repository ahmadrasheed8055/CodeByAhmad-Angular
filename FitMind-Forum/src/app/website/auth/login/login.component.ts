import { Component, OnInit, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',


templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  registerModal:string = '#registerModal';
  emailVarificationModal:string = '#emailVarificationModal';

}
