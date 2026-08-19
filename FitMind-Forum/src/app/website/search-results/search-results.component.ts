import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MasterService } from '../../Shared/master.service';
import { SearchResultDTO } from '../../Model/SearchDTO';
import { SearchSkeletonComponent } from '../../Shared/skeleton';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchSkeletonComponent],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  masterService = inject(MasterService);
  location = inject(Location);

  query: string = '';
  type: string = 'all';
  page: number = 1;
  pageSize: number = 10;

  searchResults: SearchResultDTO | null = null;
  loading: boolean = false;
  error: string | null = null;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      this.type = params['type'] || 'all';
      this.page = params['page'] ? parseInt(params['page'], 10) : 1;
      
      if (this.query.trim().length >= 2) {
        this.fetchResults();
      }
    });
  }

  fetchResults(append: boolean = false) {
    this.loading = true;
    this.error = null;
    this.masterService.globalSearch(this.query, this.type, this.page, this.pageSize).subscribe({
      next: (res) => {
        if (append && this.searchResults) {
          if (this.type === 'all' || this.type === 'users') {
             this.searchResults.users = this.searchResults.users || { items: [], totalCount: 0 };
             if (res.users?.items) this.searchResults.users.items.push(...res.users.items);
          }
          if (this.type === 'all' || this.type === 'posts') {
             this.searchResults.posts = this.searchResults.posts || { items: [], totalCount: 0 };
             if (res.posts?.items) this.searchResults.posts.items.push(...res.posts.items);
          }
          if (this.type === 'all' || this.type === 'categories') {
             this.searchResults.categories = this.searchResults.categories || { items: [], totalCount: 0 };
             if (res.categories?.items) this.searchResults.categories.items.push(...res.categories.items);
          }
          if (this.type === 'all' || this.type === 'polls') {
             this.searchResults.polls = this.searchResults.polls || { items: [], totalCount: 0 };
             if (res.polls?.items) this.searchResults.polls.items.push(...res.polls.items);
          }
        } else {
          this.searchResults = res;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      }
    });
  }

  changeTab(newType: string) {
    this.type = newType;
    this.page = 1;
    this.searchResults = null;
    this.updateUrl();
  }

  loadMore() {
    this.page++;
    this.updateUrl();
  }

  updateUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.query, type: this.type, page: this.page },
      queryParamsHandling: 'merge'
    });
  }

  get hasMore(): boolean {
    if (!this.searchResults) return false;
    
    if (this.type === 'users') {
      return this.searchResults.users ? this.searchResults.users.items.length < this.searchResults.users.totalCount : false;
    } else if (this.type === 'posts') {
      return this.searchResults.posts ? this.searchResults.posts.items.length < this.searchResults.posts.totalCount : false;
    } else if (this.type === 'categories') {
      return this.searchResults.categories ? this.searchResults.categories.items.length < this.searchResults.categories.totalCount : false;
    } else if (this.type === 'polls') {
      return this.searchResults.polls ? this.searchResults.polls.items.length < this.searchResults.polls.totalCount : false;
    }
    
    return false;
  }
}
