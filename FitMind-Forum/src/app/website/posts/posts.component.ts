import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AddPostComponent } from '../user/add-post/add-post.component';
import { GetUserPostsDTO } from '../../Model/GetUserPosts';
import { MasterService } from '../../Shared/master.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { GetAllPostsDTO } from '../../Model/GetAllPostsDTO';

@Component({
  selector: 'app-posts',
  imports: [CommonModule],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent implements OnInit {
  constructor() {}
  posts!: GetAllPostsDTO[];
  MasterService = inject(MasterService);
  snackBarService = inject(SnackBarServiceService);
  ngOnInit() {
    this.getAllPosts();
  }

  getAllPosts() {
    this.MasterService.getAllPosts().subscribe((posts: GetAllPostsDTO[]) => {
      this.posts = posts;
      console.log('Posts fetched:', this.posts);
    });
  }

  timeAgo(date: Date | string): string {
    const inputDate = new Date(date);
    const now = new Date();
    const seconds = Math.floor((+now - +inputDate) / 1000);
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
