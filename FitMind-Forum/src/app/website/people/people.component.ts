import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MasterService } from '../../Shared/master.service';
import { AuthService } from '../../Shared/auth.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { SkeletonComponent } from '../../Shared/skeleton';

import { forkJoin } from 'rxjs';
import { getTrainerAvatar } from '../../Shared/trainer-avatars';

export interface PeopleMember {
  id: number;
  username: string;
  avatarUrl: string;
  roleOrBio: string;
  location: string;
  isTrainer: boolean;
  isFollowing: boolean;
  postsCount: number;
  whatsAppNumber?: string;
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

  getTrainerAvatar = getTrainerAvatar;

  activeTab: 'all' | 'members' | 'trainers' | 'following' = 'all';
  searchQuery: string = '';
  isLoading: boolean = true;

  allMembers: PeopleMember[] = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['filter'] === 'trainers') {
        this.activeTab = 'trainers';
      } else if (params['filter'] === 'members' || params['filter'] === 'friends') {
        this.activeTab = 'members';
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

    forkJoin({
      trainers: this.masterService.getTrainers(),
      posts: this.masterService.getAllPosts(currentUserId > 0 ? currentUserId : null, true)
    }).subscribe({
      next: ({ trainers, posts }) => {
        this.isLoading = false;
        const memberMap = new Map<number, PeopleMember>();

        // 1. First add all verified trainers from database
        if (trainers && Array.isArray(trainers)) {
          trainers.forEach(t => {
            let avatar = getTrainerAvatar(t.username, t.id);
            this.masterService.getProfilePicture(t.id).subscribe({
              next: (pic: any) => {
                if (pic && typeof pic === 'string' && pic.length > 50) {
                  const m = memberMap.get(t.id);
                  if (m) m.avatarUrl = pic.startsWith('data:') ? pic : `data:image/jpeg;base64,${pic}`;
                }
              },
              error: () => {}
            });

            const role = t.specializationCategoryName 
              ? `${t.specializationCategoryName} Specialist` 
              : 'Certified Fitness Trainer';

            memberMap.set(t.id, {
              id: t.id,
              username: t.username,
              avatarUrl: avatar,
              roleOrBio: role,
              location: t.location ? `${t.location}, ${t.country || 'Pakistan'}` : (t.country || 'Pakistan'),
              isTrainer: true,
              isFollowing: !!t.isFollowing,
              postsCount: t.totalPosts || 0,
              whatsAppNumber: t.whatsAppNumber
            });
          });
        }

        // 2. Add or enrich with active community authors from posts
        if (posts && Array.isArray(posts)) {
          posts.forEach(p => {
            if (p.userId && p.userName) {
              let avatar = 'img/avatar/default.png';
              if (p.userImage && p.userImage !== 'null' && p.userImage.trim().length > 20) {
                avatar = p.userImage.startsWith('data:') ? p.userImage : 'data:image/jpeg;base64,' + p.userImage;
              }

              const role = p.categoryName ? `${p.categoryName} Enthusiast` : 'Fitness Enthusiast';
              const isTrainer = p.authorRole === 'Trainer';

              if (!memberMap.has(p.userId)) {
                memberMap.set(p.userId, {
                  id: p.userId,
                  username: p.userName,
                  avatarUrl: avatar,
                  roleOrBio: role,
                  location: 'Pakistan',
                  isTrainer: isTrainer,
                  isFollowing: !!p.isFollowingAuthor,
                  postsCount: 1
                });
              } else {
                const existing = memberMap.get(p.userId)!;
                existing.postsCount++;
                if (p.isFollowingAuthor) {
                  existing.isFollowing = true;
                }
                if (avatar !== 'img/avatar/default.png') {
                  existing.avatarUrl = avatar;
                }
              }
            }
          });
        }

        this.allMembers = Array.from(memberMap.values());
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
      if (this.activeTab === 'members' && m.isTrainer) return false;
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

  setTab(tab: 'all' | 'members' | 'trainers' | 'following'): void {
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
