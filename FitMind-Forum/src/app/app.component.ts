
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./website/navbar/navbar.component";
import { FooterComponent } from "./website/footer/footer.component";
import { CategoriesComponent } from "./website/categories/categories.component";
import { PostsComponent } from "./website/posts/posts.component";
import { HttpClientModule } from '@angular/common/http';  // Import this

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent,CategoriesComponent,PostsComponent,HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FitMind-Forum';

}
