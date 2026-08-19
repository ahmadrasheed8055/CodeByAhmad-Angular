import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../Shared/master.service';
import { AuthService } from '../../Shared/auth.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { SkeletonComponent } from '../../Shared/skeleton';

export interface PeopleMember {
  id: number;
  username: string;
  avatarUrl: string;
  roleOrBio: string;
  location: string;
  isTrainer: boolean;
  isFollowing: boolean;
  postsCount: number;
}

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SkeletonComponent],
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit {
  masterService = inject(MasterService);
  authService = inject(AuthService);
  snackBarService = inject(SnackBarServiceService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  activeTab: 'all' | 'trainers' | 'following' = 'all';
  searchQuery: string = '';
  isLoading: boolean = true;

  allMembers: PeopleMember[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['filter'] === 'trainers') {
        this.activeTab = 'trainers';
      } else if (params['filter'] === 'following') {
        this.activeTab = 'following';
      } else {
        this.activeTab = 'all';
      }
    });

    this.loadPeople();
  }

  loadPeople(): void {
    this.isLoading = true;
    const currentUserId = Number(sessionStorage.getItem('appUserId')) || 0;

    this.masterService.getAllPosts(currentUserId > 0 ? currentUserId : null, true).subscribe({
      next: (posts) => {
        this.isLoading = false;
        if (posts && Array.isArray(posts)) {
          const memberMap = new Map<number, PeopleMember>();

          posts.forEach(p => {
            if (p.userId && p.userName) {
              let avatar = 'img/avatar/default.png';
              if (p.userImage && p.userImage !== 'null' && p.userImage.trim().length > 20) {
                avatar = p.userImage.startsWith('data:') ? p.userImage : 'data:image/jpeg;base64,' + p.userImage;
              }

              const role = p.categoryName ? `${p.categoryName} Specialist` : 'Fitness Enthusiast';
              const isCoach = (p.categoryName || '').toLowerCase().includes('coach') ||
                              (p.categoryName || '').toLowerCase().includes('bodybuilding') ||
                              (p.categoryName || '').toLowerCase().includes('personal') ||
                              (p.categoryName || '').toLowerCase().includes('recovery') ||
                              (p.categoryName || '').toLowerCase().includes('nutrition') ||
                              (p.categoryName || '').toLowerCase().includes('gym');

              if (!memberMap.has(p.userId)) {
                memberMap.set(p.userId, {
                  id: p.userId,
                  username: p.userName,
                  avatarUrl: avatar,
                  roleOrBio: role,
                  location: 'Pakistan',
                  isTrainer: isCoach,
                  isFollowing: !!p.isFollowingAuthor,
                  postsCount: 1
                });
              } else {
                const existing = memberMap.get(p.userId)!;
                existing.postsCount++;
                if (p.isFollowingAuthor) {
                  existing.isFollowing = true;
                }
              }
            }
          });

          this.allMembers = Array.from(memberMap.values());
        }
      },
      error: () => {
        this.isLoading = false;
        this.allMembers = [];
      }
    });
  }

  get filteredMembers(): PeopleMember[] {
    const query = this.searchQuery.trim().toLowerCase();
    const currentUserId = Number(sessionStorage.getItem('appUserId')) || 0;

    return this.allMembers.filter(m => {
      if (currentUserId > 0 && m.id === currentUserId) return false;

      // Tab filter
      if (this.activeTab === 'trainers' && !m.isTrainer) return false;
      if (this.activeTab === 'following' && !m.isFollowing) return false;

      // Search query filter
      if (query) {
        return m.username.toLowerCase().includes(query) ||
               m.roleOrBio.toLowerCase().includes(query) ||
               m.location.toLowerCase().includes(query);
      }

      return true;
    });
  }

  setTab(tab: 'all' | 'trainers' | 'following'): void {
    this.activeTab = tab;
  }

  toggleFollow(member: PeopleMember): void {
    if (!this.authService.isLoggedIn()) {
      this.snackBarService.showError('Please log in to follow members');
      return;
    }

    if (member.isFollowing) {
      this.masterService.unfollowUser(member.id).subscribe({
        next: () => {
          member.isFollowing = false;
          this.snackBarService.showSuccess(`Unfollowed ${member.username}`);
        },
        error: () => this.snackBarService.showError('Failed to unfollow member')
      });
    } else {
      this.masterService.followUser(member.id).subscribe({
        next: () => {
          member.isFollowing = true;
          this.snackBarService.showSuccess(`You are now following ${member.username}!`);
        },
        error: () => this.snackBarService.showError('Failed to follow member')
      });
    }
  }
}
