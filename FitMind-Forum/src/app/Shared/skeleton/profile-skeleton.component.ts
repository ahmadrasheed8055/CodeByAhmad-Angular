import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-profile-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="fitjoin-profile-skeleton card border-0 shadow-sm mb-4 overflow-hidden rounded-4" style="background: var(--theme-white, #ffffff); border: 1px solid var(--border-color, #e5e7eb) !important;">
      <!-- Attached Cover Banner -->
      <div class="w-100 position-relative" style="height: 180px;">
        <app-skeleton variant="rectangular" width="100%" height="180px"></app-skeleton>
      </div>

      <!-- Card Body -->
      <div class="card-body p-4 p-md-5 pt-0">
        <div class="row align-items-end g-3" style="margin-top: -60px;">
          <!-- Large Circular Avatar -->
          <div class="col-12 col-md-auto text-center text-md-start">
            <div class="position-relative d-inline-block p-1 bg-white rounded-circle shadow" style="width: 120px; height: 120px;">
              <app-skeleton variant="circular" width="100%" height="100%"></app-skeleton>
            </div>
          </div>

          <!-- User Info & Action -->
          <div class="col-12 col-md d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div class="d-flex flex-column gap-1 text-center text-md-start">
              <app-skeleton variant="text" width="180px" height="24px" class="mx-auto mx-md-0"></app-skeleton>
              <app-skeleton variant="text" width="120px" height="14px" class="mx-auto mx-md-0"></app-skeleton>
            </div>
            <div class="d-flex justify-content-center justify-content-md-end gap-2">
              <app-skeleton variant="rounded" width="110px" height="38px" borderRadius="20px"></app-skeleton>
              <app-skeleton variant="rounded" width="90px" height="38px" borderRadius="20px"></app-skeleton>
            </div>
          </div>
        </div>

        <!-- Bio & Metadata Pills Grid -->
        <div class="mt-4 pt-3 border-top d-flex flex-column gap-2" style="border-color: var(--border-color, #e5e7eb) !important;">
          <app-skeleton variant="text" width="80%" height="14px"></app-skeleton>
          <app-skeleton variant="text" width="60%" height="14px"></app-skeleton>
          
          <div class="d-flex align-items-center gap-4 flex-wrap mt-2">
            <app-skeleton variant="rounded" width="120px" height="24px" borderRadius="6px"></app-skeleton>
            <app-skeleton variant="rounded" width="100px" height="24px" borderRadius="6px"></app-skeleton>
            <app-skeleton variant="rounded" width="130px" height="24px" borderRadius="6px"></app-skeleton>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileSkeletonComponent {}
