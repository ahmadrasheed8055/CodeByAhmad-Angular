import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../services/admin-data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.css'
})
export class PostListComponent implements OnInit {
  private dataService = inject(AdminDataService);
  private toastr = inject(ToastrService);

  posts: any[] = [];
  isLoading = false;
  
  page = 1;
  pageSize = 10;
  searchQuery = '';
  isPublishedFilter: boolean | null = null;
  
  totalItems = 0;
  totalPages = 0;

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.dataService.getPosts(this.page, this.pageSize, this.searchQuery, this.isPublishedFilter !== null ? this.isPublishedFilter : undefined)
      .subscribe({
        next: (res) => {
          this.posts = res.data;
          this.totalItems = res.totalItems;
          this.totalPages = res.totalPages;
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error('Failed to load posts');
          this.isLoading = false;
        }
      });
  }

  onSearch() {
    this.page = 1;
    this.loadPosts();
  }

  onFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'true') this.isPublishedFilter = true;
    else if (value === 'false') this.isPublishedFilter = false;
    else this.isPublishedFilter = null;
    
    this.page = 1;
    this.loadPosts();
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadPosts();
    }
  }

  toggleVisibility(post: any) {
    this.dataService.togglePostVisibility(post.postId).subscribe({
      next: (res: any) => {
        this.toastr.success('Post visibility toggled');
        post.isPublished = res.isPublished;
      },
      error: (err) => {
        this.toastr.error(err.error || 'Failed to toggle visibility');
      }
    });
  }

  deletePost(post: any) {
    if (confirm(`WARNING: This will permanently delete the post "${post.title}". Are you sure?`)) {
      this.dataService.deletePost(post.postId).subscribe({
        next: () => {
          this.toastr.success('Post deleted');
          this.loadPosts();
        },
        error: (err) => {
          this.toastr.error(err.error || 'Failed to delete post');
        }
      });
    }
  }
}
