import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';

@Component({
  selector: 'app-form-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="form-skeleton d-flex flex-column gap-3 py-3">
      <div *ngFor="let f of fieldList" class="d-flex flex-column gap-2">
        <app-skeleton variant="text" width="30%" height="14px"></app-skeleton>
        <app-skeleton variant="rounded" width="100%" height="42px" borderRadius="8px"></app-skeleton>
      </div>
      <div class="mt-2">
        <app-skeleton variant="rounded" width="100%" height="44px" borderRadius="25px"></app-skeleton>
      </div>
    </div>
  `
})
export class FormSkeletonComponent {
  @Input() fields: number = 2;

  get fieldList(): number[] {
    return Array.from({ length: Math.max(1, this.fields) }, (_, i) => i);
  }
}
