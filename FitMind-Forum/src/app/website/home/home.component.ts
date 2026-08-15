import { Component, inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { HeroComponent } from '../hero/hero.component';
import { CategoriesComponent } from '../categories/categories.component';
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterModule } from '@angular/router';
import {
  NgxUiLoaderModule,
  NgxUiLoaderHttpModule,
} from 'ngx-ui-loader';
import { PostsComponent } from '../posts/posts.component';
import { MasterService } from '../../Shared/master.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { GetUserPostsDTO } from '../../Model/GetUserPosts';
import { AuthService } from '../../Shared/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface CommunityMemberItem {
  id: number;
  username: string;
  avatarUrl: string;
}

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
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  MasterService = inject(MasterService);
  snackBarService = inject(SnackBarServiceService);
  router = inject(Router);
  posts!: GetUserPostsDTO[];
  authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('rightSidebar') rightSidebarRef?: ElementRef<HTMLDivElement>;
  private sidebarResizeObserver?: ResizeObserver;

  readonly token = sessionStorage.getItem('token');
  readonly userId = sessionStorage.getItem('appUserId');
  isLoggedIn: boolean = !!this.token && !!this.userId;

  communityMembers: CommunityMemberItem[] = [];
  followingCount: number = 9;

  postsSub!: Subscription;

  ngOnInit() {
    this.authService.appUserData$.subscribe((user) => {
      if (user) {
        this.followingCount = user.followingCount || 9;
      }
    });

    this.loadCommunityMembers();
  }

  readonly defaultPhotoAvatars: string[] = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80'
  ];

  loadCommunityMembers() {
    const currentUserId = Number(sessionStorage.getItem('appUserId')) || 0;
    
    // Fetch all posts from DB passing currentUserId to get live follow relationships
    this.MasterService.getAllPosts(currentUserId > 0 ? currentUserId : null, true).subscribe({
      next: (allPosts) => {
        if (allPosts && allPosts.length > 0) {
          const userMap = new Map<number, CommunityMemberItem>();

          // 1. Try to collect users that the logged-in user actually follows in DB
          if (currentUserId > 0) {
            allPosts.forEach(p => {
              if (p.userId && p.userName && p.userId !== currentUserId && p.isFollowingAuthor) {
                if (!userMap.has(p.userId)) {
                  const avatar = (p.userImage && p.userImage !== 'null' && p.userImage !== '') 
                    ? 'data:image/jpeg;base64,' + p.userImage 
                    : 'img/avatar/default.png';
                  userMap.set(p.userId, {
                    id: p.userId,
                    username: p.userName,
                    avatarUrl: avatar
                  });
                }
              }
            });
          }

          // 2. If not logged in or user has no followed users in DB yet, show active community post authors from DB
          if (userMap.size === 0) {
            allPosts.forEach(p => {
              if (p.userId && p.userName && p.userId !== currentUserId && !userMap.has(p.userId)) {
                const avatar = (p.userImage && p.userImage !== 'null' && p.userImage !== '') 
                  ? 'data:image/jpeg;base64,' + p.userImage 
                  : 'img/avatar/default.png';
                userMap.set(p.userId, {
                  id: p.userId,
                  username: p.userName,
                  avatarUrl: avatar
                });
              }
            });
          }

          this.communityMembers = Array.from(userMap.values());
          this.followingCount = this.communityMembers.length;
        } else {
          this.communityMembers = [];
          this.followingCount = 0;
        }
      },
      error: () => {
        this.communityMembers = [];
        this.followingCount = 0;
      }
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.rightSidebarRef?.nativeElement) {
      const el = this.rightSidebarRef.nativeElement;
      this.updateSidebarHeight(el);

      if (typeof ResizeObserver !== 'undefined') {
        this.sidebarResizeObserver = new ResizeObserver(() => {
          this.updateSidebarHeight(el);
        });
        this.sidebarResizeObserver.observe(el);
      }
    }
  }

  ngOnDestroy() {
    if (this.sidebarResizeObserver) {
      this.sidebarResizeObserver.disconnect();
    }
  }

  private updateSidebarHeight(el: HTMLElement) {
    const h = el.offsetHeight;
    el.style.setProperty('--sidebar-height', `${h}px`);
  }

  logout() {
    sessionStorage.removeItem('appUserId');
    sessionStorage.clear();
    this.snackBarService.showSuccess('Logout successfully!');
    this.router.navigate(['/']);
  }
}

