import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../services/admin-data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-poll-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poll-list.component.html',
  styleUrl: './poll-list.component.css'
})
export class PollListComponent implements OnInit {
  private dataService = inject(AdminDataService);
  private toastr = inject(ToastrService);

  polls: any[] = [];
  isLoading = false;
  
  page = 1;
  pageSize = 10;
  searchQuery = '';
  
  totalItems = 0;
  totalPages = 0;

  ngOnInit() {
    this.loadPolls();
  }

  loadPolls() {
    this.isLoading = true;
    this.dataService.getPolls(this.page, this.pageSize, this.searchQuery).subscribe({
      next: (res) => {
        this.polls = res.data;
        this.totalItems = res.totalItems;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load polls');
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.page = 1;
    this.loadPolls();
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadPolls();
    }
  }

  deletePoll(poll: any) {
    if (confirm(`WARNING: This will permanently delete the poll "${poll.question}". Are you sure?`)) {
      this.dataService.deletePoll(poll.pollId).subscribe({
        next: () => {
          this.toastr.success('Poll deleted');
          this.loadPolls();
        },
        error: (err) => {
          this.toastr.error(err.error || 'Failed to delete poll');
        }
      });
    }
  }
}
