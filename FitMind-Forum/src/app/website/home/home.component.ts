import { Component, inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterModule } from '@angular/router';
import { PostsComponent } from '../posts/posts.component';
import { MasterService } from '../../Shared/master.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { GetUserPostsDTO } from '../../Model/GetUserPosts';
import { AuthService } from '../../Shared/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SkeletonComponent } from '../../Shared/skeleton';

export interface CommunityMemberItem {
  id: number;
  username: string;
  avatarUrl: string;
}

export interface SuggestedFriendItem {
  id: number;
  username: string;
  avatarUrl: string;
  roleOrBio: string;
  isFollowing: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    FooterComponent,
    RouterModule,
    CommonModule,
    PostsComponent,
    SkeletonComponent
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
  suggestedFriends: SuggestedFriendItem[] = [];
  allSuggestedFriends: SuggestedFriendItem[] = [];
  showAllSuggestions: boolean = false;
  followingCount: number = 0;
  isLoadingCommunityMembers: boolean = true;

  postsSub!: Subscription;

  ngOnInit() {
    this.authService.appUserData$.subscribe((user) => {
      if (user && typeof user.followingCount === 'number') {
        this.followingCount = user.followingCount;
      }
    });

    // Re-load community members whenever user logs in or appUserId changes
    this.authService.appUserId$.subscribe(() => {
      this.loadCommunityMembers();
    });

    this.authService.loginSuccess$.subscribe(() => {
      this.loadCommunityMembers();
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
    this.isLoadingCommunityMembers = true;
    const currentUserId = Number(sessionStorage.getItem('appUserId')) || 0;
    
    // Fetch all posts from DB passing currentUserId to get live follow relationships
    this.MasterService.getAllPosts(currentUserId > 0 ? currentUserId : null, true).subscribe({
      next: (allPosts) => {
        this.isLoadingCommunityMembers = false;
        if (allPosts && allPosts.length > 0) {
          const followedMap = new Map<number, CommunityMemberItem>();
          const suggestedMap = new Map<number, SuggestedFriendItem>();

          allPosts.forEach(p => {
            if (p.userId && p.userName && p.userId !== currentUserId) {
              let avatar = 'img/avatar/default.png';
              if (p.userImage && p.userImage !== 'null' && p.userImage.trim().length > 20) {
                avatar = p.userImage.startsWith('data:') ? p.userImage : 'data:image/jpeg;base64,' + p.userImage;
              }

              const bio = p.categoryName ? `${p.categoryName} Enthusiast` : 'Active Community Member';

              if (currentUserId > 0 && p.isFollowingAuthor) {
                if (!followedMap.has(p.userId)) {
                  followedMap.set(p.userId, {
                    id: p.userId,
                    username: p.userName,
                    avatarUrl: avatar
                  });
                }
              } else {
                if (!suggestedMap.has(p.userId)) {
                  suggestedMap.set(p.userId, {
                    id: p.userId,
                    username: p.userName,
                    avatarUrl: avatar,
                    roleOrBio: bio,
                    isFollowing: false
                  });
                }
              }
            }
          });

          this.communityMembers = Array.from(followedMap.values());
          this.allSuggestedFriends = Array.from(suggestedMap.values());
          this.updateVisibleSuggestedFriends();

          if (currentUserId > 0) {
            this.followingCount = this.communityMembers.length;
          }
        } else {
          this.communityMembers = [];
          this.suggestedFriends = [];
          this.allSuggestedFriends = [];
          this.followingCount = 0;
        }
      },
      error: () => {
        this.isLoadingCommunityMembers = false;
        this.communityMembers = [];
        this.suggestedFriends = [];
        this.allSuggestedFriends = [];
        this.followingCount = 0;
      }
    });
  }

  updateVisibleSuggestedFriends() {
    if (this.showAllSuggestions) {
      this.suggestedFriends = this.allSuggestedFriends.slice(0, 10);
    } else {
      this.suggestedFriends = this.allSuggestedFriends.slice(0, 4);
    }
  }

  toggleSeeAllSuggestions() {
    this.showAllSuggestions = !this.showAllSuggestions;
    this.updateVisibleSuggestedFriends();
  }

  followFriend(friend: SuggestedFriendItem) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    if (friend.isFollowing) {
      this.MasterService.unfollowUser(friend.id).subscribe({
        next: () => {
          friend.isFollowing = false;
          this.communityMembers = this.communityMembers.filter(m => m.id !== friend.id);
          this.followingCount = this.communityMembers.length;
          this.snackBarService.showSuccess(`Unfollowed ${friend.username}`);
        },
        error: () => this.snackBarService.showError('Failed to unfollow user')
      });
    } else {
      this.MasterService.followUser(friend.id).subscribe({
        next: () => {
          friend.isFollowing = true;
          if (!this.communityMembers.some(m => m.id === friend.id)) {
            this.communityMembers.push({
              id: friend.id,
              username: friend.username,
              avatarUrl: friend.avatarUrl
            });
          }
          this.followingCount = this.communityMembers.length;
          this.snackBarService.showSuccess(`You are now following ${friend.username}!`);
        },
        error: () => this.snackBarService.showError('Failed to follow user')
      });
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy() {}

  logout() {
    sessionStorage.removeItem('appUserId');
    sessionStorage.clear();
    this.snackBarService.showSuccess('Logout successfully!');
    this.router.navigate(['/']);
  }
}

