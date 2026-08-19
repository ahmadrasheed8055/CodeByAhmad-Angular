import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fitjoin-skeleton"
      [ngClass]="[
        'variant-' + variant,
        animated ? 'animated' : '',
        className || ''
      ]"
      [ngStyle]="customStyles"
      role="status"
      aria-busy="true"
      aria-label="Loading content..."
    >
      <span class="visually-hidden">Loading...</span>
    </div>
  `,
  styleUrls: ['./skeleton.component.css']
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'text';
  @Input() width: string = '100%';
  @Input() height?: string;
  @Input() borderRadius?: string;
  @Input() animated: boolean = true;
  @Input() className?: string;

  get customStyles(): Record<string, string> {
    const styles: Record<string, string> = {
      width: this.width
    };

    if (this.height) {
      styles['height'] = this.height;
    }

    if (this.borderRadius) {
      styles['borderRadius'] = this.borderRadius;
    }

    return styles;
  }
}
