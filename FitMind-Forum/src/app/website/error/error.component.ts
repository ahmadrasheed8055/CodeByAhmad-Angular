import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css',
})
export class ErrorComponent implements OnInit {
  status: number = 404;
  message: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['status']) {
        this.status = Number(params['status']);
      }
      this.message = params['message'] || '';
    });
  }

  get errorTitle(): string {
    if (this.message) return this.message;
    switch (this.status) {
      case 404:
        return 'Page Not Found';
      case 500:
        return 'Internal Server Error';
      case 400:
        return 'Invalid or Expired Link';
      case 403:
        return 'Access Forbidden';
      default:
        return 'Something Went Wrong';
    }
  }

  get errorDescription(): string {
    switch (this.status) {
      case 404:
        return "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.";
      case 500:
        return "Our servers encountered an unexpected condition. Please try again shortly or return to the main dashboard.";
      case 400:
        return "The verification link or action token is invalid or has expired. Please request a new link.";
      case 403:
        return "You do not have the required permissions to access this requested resource.";
      default:
        return "An unexpected error occurred while processing your request. Please try again or head back to home.";
    }
  }

  get errorBadge(): string {
    if (this.status > 0) return `Error ${this.status}`;
    return 'Attention Required';
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/home']);
    }
  }

  refreshPage() {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
}
