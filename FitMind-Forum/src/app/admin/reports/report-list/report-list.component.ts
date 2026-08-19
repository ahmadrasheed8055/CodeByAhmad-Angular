import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminDataService } from '../../services/admin-data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.css'
})
export class ReportListComponent implements OnInit {
  private dataService = inject(AdminDataService);
  private toastr = inject(ToastrService);

  summary: any = {
    total: 0,
    pending: 0,
    underReview: 0,
    resolved: 0,
    dismissed: 0
  };

  reports: any[] = [];
  isLoading = false;
  
  page = 1;
  pageSize = 10;
  statusFilter = 'Pending';
  typeFilter = '';
  
  totalItems = 0;
  totalPages = 0;

  ngOnInit() {
    this.loadSummary();
    this.loadReports();
  }

  loadSummary() {
    this.dataService.getReportsSummary().subscribe({
      next: (res) => {
        this.summary = {
          total: res?.total ?? res?.Total ?? 0,
          pending: res?.pending ?? res?.Pending ?? 0,
          underReview: res?.underReview ?? res?.UnderReview ?? 0,
          resolved: res?.resolved ?? res?.Resolved ?? 0,
          dismissed: res?.dismissed ?? res?.Dismissed ?? 0
        };
      },
      error: (err) => {
        console.error('Failed to load summary', err);
      }
    });
  }

  loadReports() {
    this.isLoading = true;
    this.dataService.getReports(this.page, this.pageSize, this.statusFilter, this.typeFilter).subscribe({
      next: (res) => {
        this.reports = res.data;
        this.totalItems = res.totalItems;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load reports');
        this.isLoading = false;
      }
    });
  }

  onFilterChange(event: Event) {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.page = 1;
    this.loadReports();
  }

  onTypeChange(event: Event) {
    this.typeFilter = (event.target as HTMLSelectElement).value;
    this.page = 1;
    this.loadReports();
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadReports();
    }
  }

  resolveReport(report: any) {
    this.openConfirmModal(
      'Resolve Report',
      'Are you sure you want to mark this report as resolved?',
      'success',
      'bi-check-circle',
      'Resolve',
      () => {
        this.dataService.resolveReport(report.reportId || report.ReportId).subscribe({
          next: () => {
            this.toastr.success('Report marked as resolved');
            this.loadReports();
            this.loadSummary();
          },
          error: (err) => {
            this.toastr.error('Failed to resolve report');
          }
        });
      }
    );
  }

  dismissReport(report: any) {
    this.openConfirmModal(
      'Dismiss Report',
      'Are you sure you want to dismiss this report? This action will ignore the report.',
      'danger',
      'bi-x-circle',
      'Dismiss',
      () => {
        this.dataService.dismissReport(report.reportId || report.ReportId).subscribe({
          next: () => {
            this.toastr.success('Report dismissed');
            this.loadReports();
            this.loadSummary();
          },
          error: (err) => {
            this.toastr.error('Failed to dismiss report');
          }
        });
      }
    );
  }

  // --- Offcanvas Detail View Logic ---
  selectedReportDetails: any = null;
  isDetailLoading = false;

  normalizeReportDetails(data: any): any {
    if (!data) return data;
    const normalized: any = {};
    const reportObj = data.report || data.Report;
    const targetObj = data.targetDetails || data.TargetDetails;
    
    if (reportObj) {
      normalized.report = {
        reportId: reportObj.reportId || reportObj.ReportId,
        targetType: reportObj.targetType || reportObj.TargetType || '',
        targetId: reportObj.targetId || reportObj.TargetId,
        reason: reportObj.reason || reportObj.Reason,
        status: reportObj.status || reportObj.Status,
        createdAt: reportObj.createdAt || reportObj.CreatedAt,
        reporter: {
          username: reportObj.reporter?.username || reportObj.Reporter?.Username || 'Unknown',
          email: reportObj.reporter?.email || reportObj.Reporter?.Email || 'Unknown'
        }
      };
    }
    
    if (targetObj) {
      normalized.targetDetails = {
        postId: targetObj.postId || targetObj.PostId,
        pollId: targetObj.pollId || targetObj.PollId,
        id: targetObj.id || targetObj.Id,
        title: targetObj.title || targetObj.Title,
        description: targetObj.description || targetObj.Description,
        createdAt: targetObj.createdAt || targetObj.CreatedAt,
        hasMedia: targetObj.hasMedia || targetObj.HasMedia,
        postImageBase64: targetObj.postImageBase64 || targetObj.PostImageBase64,
        authorName: targetObj.authorName || targetObj.AuthorName || 'Unknown User',
        authorId: targetObj.authorId || targetObj.AuthorId,
        question: targetObj.question || targetObj.Question,
        username: targetObj.username || targetObj.Username || 'Unknown User',
        email: targetObj.email || targetObj.Email,
        bio: targetObj.bio || targetObj.Bio,
        joinedDate: targetObj.joinedDate || targetObj.JoinedDate,
        status: targetObj.status !== undefined ? targetObj.status : targetObj.Status
      };
      
      const opts = targetObj.options || targetObj.Options;
      if (Array.isArray(opts)) {
        normalized.targetDetails.options = opts.map((o: any, i: number) => ({
          optionId: o.optionId || o.OptionId,
          optionText: o.optionText || o.OptionText,
          optionLetter: String.fromCharCode(65 + i)
        }));
      } else {
        normalized.targetDetails.options = [];
      }
    }
    return normalized;
  }

  openReportDetail(report: any) {
    this.isDetailLoading = true;
    this.selectedReportDetails = null;
    const reportId = report.reportId || report.ReportId;
    
    this.dataService.getReport(reportId).subscribe({
      next: (res) => {
        this.selectedReportDetails = this.normalizeReportDetails(res);
        this.isDetailLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load report details');
        this.isDetailLoading = false;
      }
    });
  }

  // --- Confirmation Modal Logic ---
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalType = 'primary';
  confirmModalIcon = 'bi-exclamation-triangle';
  confirmModalActionText = 'Confirm';
  confirmActionCallback: () => void = () => {};

  openConfirmModal(title: string, message: string, type: 'primary' | 'danger' | 'warning' | 'success', icon: string, actionText: string, callback: () => void) {
    this.confirmModalTitle = title;
    this.confirmModalMessage = message;
    this.confirmModalType = type;
    this.confirmModalIcon = icon;
    this.confirmModalActionText = actionText;
    this.confirmActionCallback = callback;

    const modalElement = document.getElementById('adminConfirmModal');
    if (modalElement) {
      // @ts-ignore
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  executeConfirmAction() {
    if (this.confirmActionCallback) {
      this.confirmActionCallback();
    }
  }

  updateReportStatus(status: string) {
    if (!this.selectedReportDetails) return;
    
    this.openConfirmModal(
      'Update Status',
      `Change report status to ${status}?`,
      status === 'Dismissed' ? 'danger' : 'primary',
      'bi-question-circle',
      'Update',
      () => {
        this.dataService.updateReportStatus(this.selectedReportDetails.report.reportId, status).subscribe({
          next: () => {
            this.toastr.success(`Report status updated to ${status}`);
            this.selectedReportDetails.report.status = status;
            this.loadReports();
            this.loadSummary();
          },
          error: () => this.toastr.error('Failed to update report status')
        });
      }
    );
  }

  updateReportStatusSilently(status: string) {
    if (this.selectedReportDetails) {
      this.dataService.updateReportStatus(this.selectedReportDetails.report.reportId, status).subscribe({
        next: () => {
          this.selectedReportDetails.report.status = status;
          this.loadReports();
          this.loadSummary();
        }
      });
    }
  }

  deletePost(postId: number) {
    this.openConfirmModal(
      'Delete Post',
      'Are you sure you want to permanently delete this post?',
      'danger',
      'bi-trash3',
      'Delete',
      () => {
        this.dataService.deletePost(postId).subscribe({
          next: () => {
            this.toastr.success('Post deleted');
            this.updateReportStatusSilently('Resolved');
          },
          error: () => this.toastr.error('Failed to delete post')
        });
      }
    );
  }

  deletePoll(pollId: number) {
    this.openConfirmModal(
      'Delete Poll',
      'Are you sure you want to permanently delete this poll?',
      'danger',
      'bi-trash3',
      'Delete',
      () => {
        this.dataService.deletePoll(pollId).subscribe({
          next: () => {
            this.toastr.success('Poll deleted');
            this.updateReportStatusSilently('Resolved');
          },
          error: () => this.toastr.error('Failed to delete poll')
        });
      }
    );
  }

  warnUser(userId: number) {
    this.openConfirmModal(
      'Warn User',
      'Send a warning to this user? This will also mark the report as resolved.',
      'warning',
      'bi-exclamation-triangle',
      'Warn',
      () => {
        this.updateReportStatusSilently('Resolved');
        this.toastr.success('Warning issued to user');
      }
    );
  }

  suspendUser(userId: number) {
    this.openConfirmModal(
      'Suspend User',
      'Are you sure you want to suspend this user account? They will lose access temporarily.',
      'danger',
      'bi-pause-circle',
      'Suspend',
      () => {
        this.dataService.updateUserStatus(userId, 2).subscribe({
          next: () => {
            this.toastr.success('User suspended');
            this.updateReportStatusSilently('Resolved');
          },
          error: () => this.toastr.error('Failed to suspend user')
        });
      }
    );
  }

  banUser(userId: number) {
    this.openConfirmModal(
      'Ban User',
      'Are you sure you want to permanently ban this user account?',
      'danger',
      'bi-slash-circle',
      'Ban',
      () => {
        this.dataService.updateUserStatus(userId, 3).subscribe({
          next: () => {
            this.toastr.success('User banned');
            this.updateReportStatusSilently('Resolved');
          },
          error: () => this.toastr.error('Failed to ban user')
        });
      }
    );
  }
}
