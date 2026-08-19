import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../services/admin-data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-list.component.html',
  styleUrl: './admin-list.component.css'
})
export class AdminListComponent implements OnInit {
  private dataService = inject(AdminDataService);
  private toastr = inject(ToastrService);

  admins: any[] = [];
  isLoading = false;
  
  newAdminEmail = '';

  ngOnInit() {
    this.loadAdmins();
  }

  loadAdmins() {
    this.isLoading = true;
    this.dataService.getAdmins().subscribe({
      next: (res) => {
        this.admins = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load admins');
        this.isLoading = false;
      }
    });
  }

  addAdmin() {
    if (!this.newAdminEmail) {
      this.toastr.warning('Please enter an email address');
      return;
    }

    this.dataService.addAdmin(this.newAdminEmail).subscribe({
      next: () => {
        this.toastr.success('Admin added successfully');
        this.newAdminEmail = '';
        this.loadAdmins();
      },
      error: (err) => {
        this.toastr.error(err.error || 'Failed to add admin');
      }
    });
  }

  toggleStatus(admin: any) {
    this.dataService.toggleAdminStatus(admin.adminId).subscribe({
      next: (res: any) => {
        this.toastr.success('Admin status updated');
        admin.isActive = res.isActive;
      },
      error: (err) => {
        this.toastr.error(err.error || 'Failed to update status');
      }
    });
  }

  deleteAdmin(admin: any) {
    if (confirm(`Are you sure you want to remove admin access for ${admin.email}?`)) {
      this.dataService.deleteAdmin(admin.adminId).subscribe({
        next: () => {
          this.toastr.success('Admin removed');
          this.loadAdmins();
        },
        error: (err) => {
          this.toastr.error(err.error || 'Failed to remove admin');
        }
      });
    }
  }
}
