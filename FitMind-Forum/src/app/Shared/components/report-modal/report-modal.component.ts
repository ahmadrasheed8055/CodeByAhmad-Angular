import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../report.service';
import { SnackBarServiceService } from '../../snack-bar-service.service';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-modal.component.html',
  styleUrl: './report-modal.component.css'
})
export class ReportModalComponent {
  @Input() modalId: string = 'reportModal';
  @Input() targetType: 'post' | 'poll' | 'profile' = 'post';
  @Input() targetId: number | null = null;
  @Output() reportSubmitted = new EventEmitter<void>();
  @ViewChild('closeBtn') closeBtn!: ElementRef;

  selectedReason: string = '';
  otherReason: string = '';
  isSubmitting = false;

  reportService = inject(ReportService);
  snackbar = inject(SnackBarServiceService);

  get title(): string {
    if (this.targetType === 'post') return 'Report Post';
    if (this.targetType === 'poll') return 'Report Poll';
    return 'Report Profile';
  }

  get description(): string {
    return `Why are you reporting this ${this.targetType}?`;
  }

  get reasons(): string[] {
    if (this.targetType === 'profile') {
      return [
        'Fake or impersonating account',
        'Harassment or bullying',
        'Hate speech',
        'Inappropriate content',
        'Spam',
        'Scam or fraud',
        'Other'
      ];
    }
    
    return [
      'Spam or misleading content',
      'Harassment or bullying',
      'Hate speech',
      'Inappropriate or offensive content',
      'Violence or dangerous content',
      'Harmful health/fitness advice',
      'Scam or fraud',
      'Copyright violation',
      'Other'
    ];
  }

  get isFormValid(): boolean {
    if (!this.selectedReason) return false;
    return true;
  }

  submitReport() {
    if (!this.isFormValid || !this.targetId) return;

    const finalReason = this.selectedReason === 'Other' 
      ? `Other: ${this.otherReason}`.trim() 
      : this.selectedReason;

    this.isSubmitting = true;

    const observer = {
      next: (res: any) => {
        this.isSubmitting = false;
        const msg = res?.message || 'Thanks for letting us know. We have received your report and will review it.';
        this.snackbar.showSuccess(msg);
        this.reportSubmitted.emit();
        this.resetForm();
        if (this.closeBtn) this.closeBtn.nativeElement.click();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'An error occurred while submitting the report.';
        this.snackbar.showError(msg);
      }
    };

    if (this.targetType === 'post') {
      this.reportService.reportPost(this.targetId, finalReason).subscribe(observer);
    } else if (this.targetType === 'poll') {
      this.reportService.reportPoll(this.targetId, finalReason).subscribe(observer);
    } else if (this.targetType === 'profile') {
      this.reportService.reportProfile(this.targetId, finalReason).subscribe(observer);
    }
  }

  resetForm() {
    this.selectedReason = '';
    this.otherReason = '';
  }
}
