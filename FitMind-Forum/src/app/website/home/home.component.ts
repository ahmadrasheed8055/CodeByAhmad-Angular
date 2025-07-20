import { Component, inject, OnInit } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { LoginComponent } from '../auth/login/login.component';
import { EmailVarificationComponent } from '../auth/emailVarification/emailVarification.component';
import { CategoriesComponent } from '../categories/categories.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { ProfileSettingComponent } from '../user/profile-setting/profile-setting.component';
import { Router, RouterModule } from '@angular/router';
import {
  NgxUiLoaderModule,
  NgxUiLoaderHttpModule,
  NgxUiLoaderService,
} from 'ngx-ui-loader';
import { NgxLoaderService } from '../../Shared/ngx-loader.service';
import { PostsComponent } from '../posts/posts.component';
import { MasterService } from '../../Shared/master.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { GetUserPostsDTO } from '../../Model/GetUserPosts';
import { AuthService } from '../../Shared/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    HeroComponent,
    CategoriesComponent,
    FooterComponent,
    RouterModule,
    NgxUiLoaderModule,
    NgxUiLoaderHttpModule,
    CommonModule,
    PostsComponent
],
})
export class HomeComponent implements OnInit {
  ngxLoader = inject(NgxLoaderService);
  MasterService = inject(MasterService);
  snackBarService = inject(SnackBarServiceService);
  router = inject(Router);
  posts!: GetUserPostsDTO[];
  authService = inject(AuthService);

  readonly token = sessionStorage.getItem('token');
  readonly userId = sessionStorage.getItem('appUserId');
  isLoggedIn: boolean = !!this.token && !!this.userId;

  postsSub!: Subscription;

  ngOnInit() {
    // // this.ngxLoader.startLoading();
    
    // this.authService.appPostsData$.subscribe((posts) => {
    //   if (posts) {
    //     this.posts = [...posts];
    //   }else{
    // this.getAllPosts();

    //   }
    // });
  }

  constructor() {}

  // getAllPosts() {
  //   this.MasterService.getAllPosts().subscribe((posts) => {
  //      this.posts = posts;
  //   });
  // }

  // ngOnDestroy(): void {
  //   if (this.postsSub) this.postsSub.unsubscribe();
  // }
  logout() {
    sessionStorage.removeItem('appUserId');
    sessionStorage.clear();
    this.snackBarService.showSuccess('Logout successfully!');
    this.router.navigate(['/']);
  }
}
