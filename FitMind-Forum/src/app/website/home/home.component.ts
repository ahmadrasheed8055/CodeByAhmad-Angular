import { Component, OnInit } from '@angular/core';
import { HeroComponent } from "../hero/hero.component";
import { LoginComponent } from "../auth/login/login.component";
import { EmailVarificationComponent } from "../auth/emailVarification/emailVarification.component";
import { CategoriesComponent } from "../categories/categories.component";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [HeroComponent, LoginComponent, EmailVarificationComponent, CategoriesComponent, NavbarComponent]
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
