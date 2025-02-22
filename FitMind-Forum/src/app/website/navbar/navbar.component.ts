import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { AuthService } from "../../Shared/auth.service";

@Component({
  selector: "app-navbar",
  imports: [CommonModule, RouterModule],

  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.css",
})
export class NavbarComponent {
  loginModal: string = "#loginModal";
  registerModal: string = "#registerModal";
  emailVarificationModal: string = "#emailVarificationModal";
  test() {
    debugger;
  }
  authServices = inject(AuthService);


  logout(){
    sessionStorage.removeItem('appUser');
  }
}
