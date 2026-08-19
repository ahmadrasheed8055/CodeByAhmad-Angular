import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-search-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="search-skeleton-container d-flex flex-column gap-3 py-2">
      <!-- ALL / MIXED SKELETON -->
      <ng-container *ngIf="tab === 'all'">
        <!-- People Section -->
        <div class="mb-3">
          <app-skeleton variant="text" width="90px" height="18px" class="mb-2"></app-skeleton>
          <div class="card mb-2 border-0 shadow-sm p-3 rounded-3" style="background: var(--theme-white, #ffffff);">
            <div class="d-flex align-items-center gap-3">
              <app-skeleton variant="circular" width="44px" height="44px"></app-skeleton>
              <div class="d-flex flex-column gap-1 flex-grow-1">
                <app-skeleton variant="text" width="130px" height="15px"></app-skeleton>
                <app-skeleton variant="text" width="180px" height="12px"></app-skeleton>
              </div>
            </div>
          </div>
        </div>

        <!-- Posts Section -->
        <div class="mb-3">
          <app-skeleton variant="text" width="90px" height="18px" class="mb-2"></app-skeleton>
          <div *ngFor="let i of [1, 2]" class="card mb-2 border-0 shadow-sm p-3 rounded-3" style="background: var(--theme-white, #ffffff);">
            <div class="d-flex gap-3">
              <app-skeleton variant="rounded" width="80px" height="80px" borderRadius="8px" class="flex-shrink-0"></app-skeleton>
              <div class="d-flex flex-column gap-2 flex-grow-1">
                <app-skeleton variant="text" width="70%" height="16px"></app-skeleton>
                <app-skeleton variant="text" width="95%" height="13px"></app-skeleton>
                <app-skeleton variant="text" width="40%" height="11px"></app-skeleton>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- USERS TAB -->
      <ng-container *ngIf="tab === 'users'">
        <div *ngFor="let item of items" class="card border-0 shadow-sm p-3 rounded-3 mb-2" style="background: var(--theme-white, #ffffff);">
          <div class="d-flex align-items-center gap-3">
            <app-skeleton variant="circular" width="44px" height="44px"></app-skeleton>
            <div class="d-flex flex-column gap-1 flex-grow-1">
              <app-skeleton variant="text" width="140px" height="15px"></app-skeleton>
              <app-skeleton variant="text" width="200px" height="12px"></app-skeleton>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- POSTS TAB -->
      <ng-container *ngIf="tab === 'posts'">
        <div *ngFor="let item of items" class="card border-0 shadow-sm p-3 rounded-3 mb-2" style="background: var(--theme-white, #ffffff);">
          <div class="d-flex gap-3">
            <app-skeleton variant="rounded" width="80px" height="80px" borderRadius="8px" class="flex-shrink-0"></app-skeleton>
            <div class="d-flex flex-column gap-2 flex-grow-1">
              <app-skeleton variant="text" width="75%" height="16px"></app-skeleton>
              <app-skeleton variant="text" width="98%" height="13px"></app-skeleton>
              <app-skeleton variant="text" width="45%" height="11px"></app-skeleton>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- CATEGORIES TAB -->
      <ng-container *ngIf="tab === 'categories'">
        <div *ngFor="let item of items" class="card border-0 shadow-sm p-3 rounded-3 mb-2" style="background: var(--theme-white, #ffffff);">
          <div class="d-flex flex-column gap-1">
            <app-skeleton variant="text" width="160px" height="16px"></app-skeleton>
            <app-skeleton variant="text" width="80%" height="13px"></app-skeleton>
          </div>
        </div>
      </ng-container>

      <!-- POLLS TAB -->
      <ng-container *ngIf="tab === 'polls'">
        <div *ngFor="let item of items" class="card border-0 shadow-sm p-3 rounded-3 mb-2" style="background: var(--theme-white, #ffffff);">
          <div class="d-flex flex-column gap-1">
            <app-skeleton variant="text" width="85%" height="16px"></app-skeleton>
            <app-skeleton variant="text" width="70px" height="12px"></app-skeleton>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class SearchSkeletonComponent {
  @Input() tab: 'all' | 'users' | 'posts' | 'categories' | 'polls' = 'all';
  @Input() count: number = 4;

  get items(): number[] {
    return Array.from({ length: Math.max(1, this.count) }, (_, i) => i);
  }
}
