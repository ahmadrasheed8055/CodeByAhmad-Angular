/* CodeByAhmad - FitMind Forum Standard Categories Module */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MasterService } from '../../Shared/master.service';
import { CategoryFilterService, CategoryStats } from '../../Shared/category-filter.service';
import { ICategories } from './../../Model/categories';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule, RouterModule],
  standalone: true,
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  masterService = inject(MasterService);
  categoryFilterService = inject(CategoryFilterService);
  route = inject(ActivatedRoute);

  categories: ICategories[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  selectedCategoryId: number | null = null;
  categoryCounts: { [categoryId: number]: CategoryStats } = {};
  totalDiscussionsCount: number = 0;

  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    this.getAllCategories();

    // Subscribe to selected category ID
    this.subscriptions.add(
      this.categoryFilterService.selectedCategoryId$.subscribe(id => {
        this.selectedCategoryId = id;
      })
    );

    // Subscribe to category live counts
    this.subscriptions.add(
      this.categoryFilterService.categoryCounts$.subscribe(counts => {
        this.categoryCounts = counts || {};
      })
    );

    // Subscribe to total discussions count
    this.subscriptions.add(
      this.categoryFilterService.totalDiscussions$.subscribe(total => {
        this.totalDiscussionsCount = total;
      })
    );

    // Sync with initial URL query params if present
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        if (params['category']) {
          const catId = Number(params['category']);
          if (!isNaN(catId) && catId > 0) {
            this.categoryFilterService.selectCategoryId(catId, false);
          }
        } else if (params['category'] === undefined) {
          // If no param, default to all if not already explicitly set
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getAllCategories() {
    this.loading = true;
    this.masterService.getAllCategories().subscribe({
      next: (data: ICategories[]) => {
        this.categories = data || [];
        this.categoryFilterService.setCategories(this.categories);
        this.loading = false;

        // Check if query params matched any category
        const currentParam = this.route.snapshot.queryParams['category'];
        if (currentParam) {
          const catId = Number(currentParam);
          const found = this.categories.find(c => c.id === catId);
          if (found) {
            this.categoryFilterService.selectCategory(found, false);
          }
        }
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 404) {
          this.errorMessage = 'No categories found.';
        } else {
          this.errorMessage = 'Unable to load categories right now.';
        }
      }
    });
  }

  get filteredCategories(): ICategories[] {
    let list = this.categories.filter(c => c.isActive);
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return list;
  }

  onSelectCategory(category: ICategories | null) {
    if (category === null) {
      this.categoryFilterService.clearFilter(true);
    } else {
      if (this.selectedCategoryId === category.id) {
        // Clicking active category toggles it off
        this.categoryFilterService.clearFilter(true);
      } else {
        this.categoryFilterService.selectCategory(category, true);
      }
    }
  }

  getCategoryCount(categoryId: number): number {
    return this.categoryCounts[categoryId]?.total || 0;
  }

  getCategoryIcon(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('fitness') || lower.includes('workout') || lower.includes('gym') || lower.includes('exercise')) {
      return 'bi-lightning-charge-fill';
    }
    if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('food') || lower.includes('meal')) {
      return 'bi-egg-fried';
    }
    if (lower.includes('mind') || lower.includes('mental') || lower.includes('meditation') || lower.includes('health')) {
      return 'bi-heart-pulse-fill';
    }
    if (lower.includes('running') || lower.includes('cardio') || lower.includes('walk')) {
      return 'bi-speedometer2';
    }
    if (lower.includes('strength') || lower.includes('muscle') || lower.includes('weight')) {
      return 'bi-trophy-fill';
    }
    if (lower.includes('q&a') || lower.includes('question') || lower.includes('ask')) {
      return 'bi-question-circle-fill';
    }
    if (lower.includes('poll') || lower.includes('survey')) {
      return 'bi-bar-chart-fill';
    }
    if (lower.includes('tip') || lower.includes('guide') || lower.includes('advice')) {
      return 'bi-lightbulb-fill';
    }
    return 'bi-bookmark-star-fill';
  }

  getCategoryGradient(name: string, index: number): string {
    const gradients = [
      'linear-gradient(135deg, #87bf17 0%, #4a8505 100%)',
      'linear-gradient(135deg, #0195ff 0%, #0066cc 100%)',
      'linear-gradient(135deg, #ec595a 0%, #c43839 100%)',
      'linear-gradient(135deg, #9b51e0 0%, #6f2dbd 100%)',
      'linear-gradient(135deg, #f2994a 0%, #e27d22 100%)',
      'linear-gradient(135deg, #27ae60 0%, #1e824c 100%)',
      'linear-gradient(135deg, #00c9a7 0%, #008f7a 100%)',
      'linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%)',
    ];
    return gradients[index % gradients.length];
  }
}
