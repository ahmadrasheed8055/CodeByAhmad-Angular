import { Component, OnInit } from '@angular/core';
import { HeroComponent } from "../hero/hero.component";
import { LoginComponent } from "../auth/login/login.component";
import { EmailVarificationComponent } from "../auth/emailVarification/emailVarification.component";
import { CategoriesComponent } from "../categories/categories.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { ProfileSettingComponent } from "../user/profile-setting/profile-setting.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [HeroComponent, CategoriesComponent, FooterComponent, RouterModule]
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
