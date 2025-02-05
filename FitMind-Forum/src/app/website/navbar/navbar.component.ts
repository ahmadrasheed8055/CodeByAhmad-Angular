import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  loginModal:string = '#loginModal';
  registerModal:string = '#registerModal';
  emailVarificationModal:string = '#emailVarificationModal';
  test(){
    debugger;
  }
}
