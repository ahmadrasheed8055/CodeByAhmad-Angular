// import { FormsModule } from '@angular/forms';

import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
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
import { HomeComponent } from './website/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxUiLoaderHttpModule, NgxUiLoaderModule, NgxUiLoaderRouterModule } from "ngx-ui-loader";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule,NgxUiLoaderModule,NgxUiLoaderRouterModule, CommonModule],

templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FitMind-Forum';

  showScrollTop = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.showScrollTop = window.scrollY > 300;
    }
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
