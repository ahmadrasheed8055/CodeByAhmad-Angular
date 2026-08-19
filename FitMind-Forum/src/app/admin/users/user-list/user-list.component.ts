import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../services/admin-data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  private dataService = inject(AdminDataService);
  private toastr = inject(ToastrService);

  users: any[] = [];
  isLoading = false;
  
  page = 1;
  pageSize = 10;
  searchQuery = '';
  statusFilter: number | null = null; // 1 = Active, 2 = Suspended, 3 = Banned
  
  totalItems = 0;
  totalPages = 0;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.dataService.getUsers(this.page, this.pageSize, this.searchQuery, this.statusFilter !== null ? this.statusFilter : undefined)
      .subscribe({
        next: (res) => {
          this.users = res.data;
          this.totalItems = res.totalItems;
          this.totalPages = res.totalPages;
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error('Failed to load users');
          this.isLoading = false;
        }
      });
  }

  onSearch() {
    this.page = 1;
    this.loadUsers();
  }

  onFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter = value ? parseInt(value, 10) : null;
    this.page = 1;
    this.loadUsers();
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadUsers();
    }
  }

  updateStatus(user: any, status: number) {
    if (confirm(`Are you sure you want to change the status for ${user.username}?`)) {
      this.dataService.updateUserStatus(user.id, status).subscribe({
        next: () => {
          this.toastr.success('User status updated');
          user.status = status;
        },
        error: (err) => {
          this.toastr.error(err.error || 'Failed to update status');
        }
      });
    }
  }

  deleteUser(user: any) {
    if (confirm(`WARNING: This will delete ${user.username}. Are you sure?`)) {
      this.dataService.deleteUser(user.id).subscribe({
        next: () => {
          this.toastr.success('User deleted');
          this.loadUsers();
        },
        error: (err) => {
          this.toastr.error(err.error || 'Failed to delete user');
        }
      });
    }
  }
}
