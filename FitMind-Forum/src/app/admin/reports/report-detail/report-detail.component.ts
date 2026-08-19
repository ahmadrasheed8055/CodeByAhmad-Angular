import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDataService } from '../../services/admin-data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css'
})
export class ReportDetailComponent implements OnInit {
  private dataService = inject(AdminDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private toastr = inject(ToastrService);

  reportId: number = 0;
  reportDetails: any = null;
  isLoading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.reportId = +params['id'];
      if (this.reportId) {
        this.loadReportDetails();
      }
    });
  }

  loadReportDetails() {
    this.isLoading = true;
    this.dataService.getReport(this.reportId).subscribe({
      next: (res) => {
        this.reportDetails = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load report details');
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  goBack() {
    this.location.back();
  }

  updateReportStatus(status: string) {
    if (confirm(`Change report status to ${status}?`)) {
      this.dataService.updateReportStatus(this.reportId, status).subscribe({
        next: () => {
          this.toastr.success(`Report status updated to ${status}`);
          this.reportDetails.report.status = status;
        },
        error: (err) => {
          this.toastr.error('Failed to update report status');
        }
      });
    }
  }

  // Target Actions (Moderation)
  warnUser(userId: number) {
    if (confirm('Send a warning to this user? (This will mark the report as Resolved)')) {
      // Assuming warning is just resolving for now
      this.dataService.updateReportStatus(this.reportId, 'Resolved').subscribe({
        next: () => {
          this.toastr.success('Warning issued to user');
          this.reportDetails.report.status = 'Resolved';
        },
        error: () => this.toastr.error('Failed to issue warning')
      });
    }
  }

  suspendUser(userId: number) {
    if (confirm('Suspend this user account?')) {
      this.dataService.updateUserStatus(userId, 2).subscribe({
        next: () => {
          this.toastr.success('User suspended');
          // Auto-resolve report
          this.updateReportStatusSilently('Resolved');
        },
        error: () => this.toastr.error('Failed to suspend user')
      });
    }
  }

  banUser(userId: number) {
    if (confirm('Ban this user account permanently?')) {
      this.dataService.updateUserStatus(userId, 3).subscribe({
        next: () => {
          this.toastr.success('User banned');
          this.updateReportStatusSilently('Resolved');
        },
        error: () => this.toastr.error('Failed to ban user')
      });
    }
  }

  deletePost(postId: number) {
    if (confirm('Delete this post?')) {
      this.dataService.deletePost(postId).subscribe({
        next: () => {
          this.toastr.success('Post deleted');
          this.updateReportStatusSilently('Resolved');
        },
        error: () => this.toastr.error('Failed to delete post')
      });
    }
  }

  deletePoll(pollId: number) {
    if (confirm('Delete this poll?')) {
      this.dataService.deletePoll(pollId).subscribe({
        next: () => {
          this.toastr.success('Poll deleted');
          this.updateReportStatusSilently('Resolved');
        },
        error: () => this.toastr.error('Failed to delete poll')
      });
    }
  }

  private updateReportStatusSilently(status: string) {
    this.dataService.updateReportStatus(this.reportId, status).subscribe({
      next: () => {
        this.reportDetails.report.status = status;
      }
    });
  }
}
