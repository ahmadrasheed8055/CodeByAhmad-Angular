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
import { getTrainerAvatar } from '../../Shared/trainer-avatars';

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

export interface TrainerSuggestionItem {
  id: number;
  username: string;
  avatarUrl: string;
  specialization: string;
  yearsOfExperience?: number;
  whatsAppNumber?: string;
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

  getTrainerAvatar = getTrainerAvatar;

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

  suggestedTrainers: TrainerSuggestionItem[] = [];
  allSuggestedTrainers: TrainerSuggestionItem[] = [];
  isLoadingTrainers: boolean = true;
  showAllTrainerSuggestions: boolean = false;

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
      this.loadSuggestedTrainers();
    });

    this.authService.loginSuccess$.subscribe(() => {
      this.loadCommunityMembers();
      this.loadSuggestedTrainers();
    });

    this.loadCommunityMembers();
    this.loadSuggestedTrainers();
  }

  cleanWhatsApp(number?: string): string {
    if (!number) return '';
    return number.replace(/\+/g, '').replace(/\s+/g, '').replace(/-/g, '');
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
                // Strictly ONLY regular users in Suggested Friends (not Trainers)
                if (p.authorRole !== 'Trainer') {
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

  loadSuggestedTrainers() {
    this.isLoadingTrainers = true;
    const currentUserId = Number(sessionStorage.getItem('appUserId')) || 0;

    this.MasterService.getTrainers().subscribe({
      next: (trainers) => {
        this.isLoadingTrainers = false;
        if (trainers && Array.isArray(trainers)) {
          const list: TrainerSuggestionItem[] = [];

          trainers.forEach((t) => {
            if (t.id !== currentUserId) {
              const trainerAvatar = getTrainerAvatar(t.username, t.id);

              if (t.isFollowing && currentUserId > 0) {
                // If followed, ensure they appear in the top Following avatars section
                if (!this.communityMembers.some(m => m.id === t.id)) {
                  const followedTrainer: CommunityMemberItem = {
                    id: t.id,
                    username: t.username,
                    avatarUrl: trainerAvatar
                  };
                  this.communityMembers.push(followedTrainer);
                  this.MasterService.getProfilePicture(t.id).subscribe({
                    next: (pic: any) => {
                      if (pic && typeof pic === 'string' && pic.length > 50) {
                        followedTrainer.avatarUrl = pic.startsWith('data:') ? pic : `data:image/jpeg;base64,${pic}`;
                      }
                    },
                    error: () => {}
                  });
                  this.followingCount = this.communityMembers.length;
                }
              } else if (!t.isFollowing) {
                // Only unfollowed trainers in Suggested Trainers
                const item: TrainerSuggestionItem = {
                  id: t.id,
                  username: t.username,
                  avatarUrl: trainerAvatar,
                  specialization: t.specializationCategoryName || 'Certified Trainer',
                  yearsOfExperience: t.yearsOfExperience,
                  whatsAppNumber: t.whatsAppNumber,
                  isFollowing: false,
                };

                this.MasterService.getProfilePicture(t.id).subscribe({
                  next: (pic: any) => {
                    if (pic && typeof pic === 'string' && pic.length > 50) {
                      item.avatarUrl = pic.startsWith('data:') ? pic : `data:image/jpeg;base64,${pic}`;
                    }
                  },
                  error: () => {},
                });

                list.push(item);
              }
            }
          });

          this.allSuggestedTrainers = list;
          this.updateVisibleSuggestedTrainers();
        } else {
          this.suggestedTrainers = [];
          this.allSuggestedTrainers = [];
        }
      },
      error: () => {
        this.isLoadingTrainers = false;
        this.suggestedTrainers = [];
        this.allSuggestedTrainers = [];
      },
    });
  }

  updateVisibleSuggestedTrainers() {
    if (this.showAllTrainerSuggestions) {
      this.suggestedTrainers = this.allSuggestedTrainers.slice(0, 8);
    } else {
      this.suggestedTrainers = this.allSuggestedTrainers.slice(0, 3);
    }
  }

  toggleSeeAllTrainerSuggestions() {
    this.showAllTrainerSuggestions = !this.showAllTrainerSuggestions;
    this.updateVisibleSuggestedTrainers();
  }

  followTrainer(trainer: TrainerSuggestionItem) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    if (trainer.isFollowing) {
      this.MasterService.unfollowUser(trainer.id).subscribe({
        next: () => {
          trainer.isFollowing = false;
          this.communityMembers = this.communityMembers.filter((m) => m.id !== trainer.id);
          this.followingCount = this.communityMembers.length;
          this.snackBarService.showSuccess(`Unfollowed ${trainer.username}`);
        },
        error: () => this.snackBarService.showError('Failed to unfollow trainer'),
      });
    } else {
      this.MasterService.followUser(trainer.id).subscribe({
        next: () => {
          trainer.isFollowing = true;
          if (!this.communityMembers.some((m) => m.id === trainer.id)) {
            this.communityMembers.push({
              id: trainer.id,
              username: trainer.username,
              avatarUrl: trainer.avatarUrl,
            });
          }
          this.followingCount = this.communityMembers.length;
          this.snackBarService.showSuccess(`You are now following ${trainer.username}!`);
        },
        error: () => this.snackBarService.showError('Failed to follow trainer'),
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

