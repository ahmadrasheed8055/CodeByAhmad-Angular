import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminDataService } from '../services/admin-data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private dataService = inject(AdminDataService);
  private toastr = inject(ToastrService);

  summary: any = null;
  recentActivity: any = null;
  liveDb: any = null;
  isLoading = true;
  activeTab: 'timeline' | 'posts' | 'users' | 'dbLogs' = 'timeline';
  lastRefreshedAt = new Date();

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.dataService.getDashboardSummary().subscribe({
      next: (res: any) => {
        this.summary = res.summary || {};
        this.recentActivity = res.recentActivity || {};
        this.liveDb = res.liveDb || {
          status: 'Online',
          databaseName: 'FitMindDB',
          serverTime: new Date(),
          uptimeMinutes: 45.2,
          allocatedMemoryMb: 82.4
        };
        this.lastRefreshedAt = new Date();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching dashboard metrics:', err);
        this.toastr.error('Failed to connect or load dashboard metrics.');
        this.isLoading = false;
      }
    });
  }

  setTab(tab: 'timeline' | 'posts' | 'users' | 'dbLogs'): void {
    this.activeTab = tab;
  }
}
