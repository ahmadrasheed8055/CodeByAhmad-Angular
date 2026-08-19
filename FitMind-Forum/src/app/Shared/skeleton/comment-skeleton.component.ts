import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-comment-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="comments-skeleton-wrapper d-flex flex-column gap-3 py-3 px-2">
      <div *ngFor="let item of items" class="d-flex align-items-start gap-3 w-100">
        <!-- Commenter Avatar -->
        <div class="flex-shrink-0" style="width: 36px; height: 36px;">
          <app-skeleton variant="circular" width="36px" height="36px"></app-skeleton>
        </div>

        <div class="flex-grow-1" style="max-width: 90%;">
          <!-- Comment Bubble Placeholder -->
          <div
            class="p-3 rounded-4 mb-1"
            style="background: rgba(0, 0, 0, 0.04); border: 1px solid rgba(0,0,0,0.06);"
          >
            <!-- Author Name -->
            <div class="mb-2" style="width: 120px;">
              <app-skeleton variant="text" width="120px" height="13px"></app-skeleton>
            </div>
            <!-- Comment Content Lines -->
            <div class="mb-1" style="width: 95%;">
              <app-skeleton variant="text" width="100%" height="12px"></app-skeleton>
            </div>
            <div style="width: 65%;">
              <app-skeleton variant="text" width="100%" height="12px"></app-skeleton>
            </div>
          </div>

          <!-- Bottom Action Row: Upvote, Downvote, Reply -->
          <div class="d-flex align-items-center gap-3 ms-2 mt-1">
            <app-skeleton variant="text" width="35px" height="10px"></app-skeleton>
            <app-skeleton variant="text" width="35px" height="10px"></app-skeleton>
            <app-skeleton variant="text" width="45px" height="10px"></app-skeleton>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CommentSkeletonComponent {
  @Input() count: number = 3;

  get items(): number[] {
    return Array.from({ length: Math.max(1, this.count) }, (_, i) => i);
  }
}

