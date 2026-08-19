import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

export type ListItemSkeletonType = 'category' | 'user' | 'notification' | 'draft' | 'simple';

@Component({
  selector: 'app-list-item-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="list-item-skeleton-group d-flex flex-column gap-2">
      <div
        *ngFor="let item of items"
        class="list-item-skeleton-row d-flex align-items-center justify-content-between p-2 rounded-3"
      >
        <!-- CATEGORY PRESET -->
        <ng-container *ngIf="type === 'category'">
          <div class="d-flex align-items-center gap-3 overflow-hidden flex-grow-1">
            <app-skeleton variant="rounded" width="40px" height="40px" borderRadius="10px" class="flex-shrink-0"></app-skeleton>
            <div class="d-flex flex-column gap-1 flex-grow-1">
              <app-skeleton variant="text" width="60%" height="15px"></app-skeleton>
              <app-skeleton variant="text" width="35%" height="11px"></app-skeleton>
            </div>
          </div>
          <app-skeleton variant="rounded" width="28px" height="20px" borderRadius="10px" class="flex-shrink-0"></app-skeleton>
        </ng-container>

        <!-- USER PRESET -->
        <ng-container *ngIf="type === 'user'">
          <div class="d-flex align-items-center gap-3 overflow-hidden flex-grow-1">
            <app-skeleton variant="circular" width="38px" height="38px" class="flex-shrink-0"></app-skeleton>
            <div class="d-flex flex-column gap-1 flex-grow-1">
              <app-skeleton variant="text" width="50%" height="14px"></app-skeleton>
              <app-skeleton variant="text" width="70%" height="11px"></app-skeleton>
            </div>
          </div>
        </ng-container>

        <!-- NOTIFICATION PRESET -->
        <ng-container *ngIf="type === 'notification'">
          <div class="d-flex align-items-start gap-2 flex-grow-1">
            <app-skeleton variant="circular" width="8px" height="8px" class="mt-2 flex-shrink-0"></app-skeleton>
            <app-skeleton variant="circular" width="36px" height="36px" class="flex-shrink-0"></app-skeleton>
            <div class="d-flex flex-column gap-1 flex-grow-1">
              <app-skeleton variant="text" width="85%" height="13px"></app-skeleton>
              <app-skeleton variant="text" width="40%" height="11px"></app-skeleton>
            </div>
          </div>
        </ng-container>

        <!-- DRAFT PRESET -->
        <ng-container *ngIf="type === 'draft'">
          <div class="d-flex flex-column gap-1 flex-grow-1 me-3">
            <app-skeleton variant="text" width="70%" height="16px"></app-skeleton>
            <app-skeleton variant="text" width="35%" height="12px"></app-skeleton>
          </div>
          <div class="d-flex align-items-center gap-1 flex-shrink-0">
            <app-skeleton variant="rounded" width="32px" height="32px" borderRadius="6px"></app-skeleton>
            <app-skeleton variant="rounded" width="32px" height="32px" borderRadius="6px"></app-skeleton>
          </div>
        </ng-container>

        <!-- SIMPLE PRESET -->
        <ng-container *ngIf="type === 'simple'">
          <div class="d-flex flex-column gap-1 flex-grow-1">
            <app-skeleton variant="text" width="80%" height="14px"></app-skeleton>
            <app-skeleton variant="text" width="50%" height="11px"></app-skeleton>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class ListItemSkeletonComponent {
  @Input() type: ListItemSkeletonType = 'simple';
  @Input() count: number = 3;

  get items(): number[] {
    return Array.from({ length: Math.max(1, this.count) }, (_, i) => i);
  }
}
