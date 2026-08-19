import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-post-card-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="d-flex flex-column gap-3">
      <div
        *ngFor="let item of items"
        class="fitjoin-post-card-skeleton card border-0 shadow-sm p-4 rounded-4"
        style="background: var(--theme-white, #ffffff); border: 1px solid var(--border-color, #e5e7eb) !important;"
      >
        <!-- Header: Avatar + Author info + Right Action -->
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="d-flex align-items-center gap-3">
            <app-skeleton variant="circular" width="46px" height="46px"></app-skeleton>
            <div class="d-flex flex-column gap-1">
              <app-skeleton variant="text" width="130px" height="15px"></app-skeleton>
              <div class="d-flex align-items-center gap-2">
                <app-skeleton variant="text" width="70px" height="12px"></app-skeleton>
                <app-skeleton variant="rounded" width="60px" height="16px" borderRadius="10px"></app-skeleton>
              </div>
            </div>
          </div>
          <app-skeleton variant="rounded" width="32px" height="32px" borderRadius="50%"></app-skeleton>
        </div>

        <!-- Body: Title + Multi-line content -->
        <div class="mb-3 d-flex flex-column gap-2">
          <app-skeleton variant="text" width="75%" height="20px" borderRadius="4px"></app-skeleton>
          <app-skeleton variant="text" width="100%" height="14px"></app-skeleton>
          <app-skeleton variant="text" width="94%" height="14px"></app-skeleton>
          <app-skeleton variant="text" width="55%" height="14px"></app-skeleton>
        </div>

        <!-- Optional Media Placeholder for variety -->
        <div *ngIf="showMedia" class="mb-3">
          <app-skeleton variant="rounded" width="100%" height="180px" borderRadius="12px"></app-skeleton>
        </div>

        <!-- Footer: Action Pills Row -->
        <div class="d-flex align-items-center justify-content-between pt-2 border-top" style="border-color: var(--border-color, #e5e7eb) !important;">
          <div class="d-flex align-items-center gap-2">
            <app-skeleton variant="rounded" width="65px" height="32px" borderRadius="20px"></app-skeleton>
            <app-skeleton variant="rounded" width="65px" height="32px" borderRadius="20px"></app-skeleton>
            <app-skeleton variant="rounded" width="90px" height="32px" borderRadius="20px"></app-skeleton>
          </div>
          <div class="d-flex align-items-center gap-2">
            <app-skeleton variant="rounded" width="32px" height="32px" borderRadius="50%"></app-skeleton>
            <app-skeleton variant="rounded" width="32px" height="32px" borderRadius="50%"></app-skeleton>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fitjoin-post-card-skeleton {
      border-radius: 16px !important;
      transition: all 0.3s ease;
    }
  `]
})
export class PostCardSkeletonComponent {
  @Input() count: number = 1;
  @Input() showMedia: boolean = false;

  get items(): number[] {
    return Array.from({ length: Math.max(1, this.count) }, (_, i) => i);
  }
}
