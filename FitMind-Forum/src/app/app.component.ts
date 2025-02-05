// import { FormsModule } from '@angular/forms';

import { Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./website/navbar/navbar.component";
import { FooterComponent } from "./website/footer/footer.component";
import { CategoriesComponent } from "./website/categories/categories.component";
import { PostsComponent } from "./website/posts/posts.component";
import { HttpClientModule } from '@angular/common/http';
import { HeroComponent } from "./website/hero/hero.component";
import { LoginComponent } from "./website/auth/login/login.component";
import { RegisterComponent } from "./website/auth/register/register.component";
import { EmailVarificationComponent } from "./website/auth/emailVarification/emailVarification.component";  // Import this

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, CategoriesComponent, HttpClientModule, HeroComponent, LoginComponent, RegisterComponent, EmailVarificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FitMind-Forum';

}
