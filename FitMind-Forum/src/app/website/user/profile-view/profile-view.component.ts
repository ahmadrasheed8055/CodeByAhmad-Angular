import { Component, Inject, isStandalone, NgModule } from '@angular/core';
import { PublicAppUserDTO, AppUserPhotos } from '../../../Model/AppUsers';
import { AuthService } from '../../../Shared/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MasterService } from '../../../Shared/master.service';
import { GetUserPostsDTO } from '../../../Model/GetUserPosts';
import { Pipe, PipeTransform } from '@angular/core';

@Component({
  selector: 'app-profile-view',
  imports: [DatePipe, CommonModule],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css',
})
export class ProfileViewComponent {
  user!: PublicAppUserDTO;
  userPhotos!: AppUserPhotos;
  // masterService = Inject(MasterService);
  userPosts: GetUserPostsDTO[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.appUserData$.subscribe((user: any) => {
        this.user = user;
      })
    );

    this.subscriptions.add(
      this.authService.appUserPhotos$.subscribe((photos: any) => {
        this.userPhotos = photos;
      })
    );

    //getting all posts
    this.getUserPosts();
  }

  getUserPosts(): void {
    this.masterService.getUserAllPosts(this.user.id).subscribe({
      next: (posts: GetUserPostsDTO[]) => {
        this.userPosts = posts;
        // console.log(this.userPosts);
      },
      error: (err: any) => {
        console.error('Error fetching user posts:', err);
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  timeAgo(date: Date | string): string {
    const inputDate = new Date(date); const now = new Date(); const seconds = Math.floor((+now - +inputDate) / 1000);
    if (seconds < 10) return 'Just now';
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      // Show full date with year
      return inputDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1 || Math.floor(seconds / 86400) > 6) {
      // Show short date without year (for < 1 year but older than 6 days)
      return inputDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      });
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1)
      return `${interval} minute${interval > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }
}
