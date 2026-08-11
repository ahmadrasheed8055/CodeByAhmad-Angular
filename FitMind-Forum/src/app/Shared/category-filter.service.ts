import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ICategories } from '../Model/categories';
import { GetAllPostsDTO } from '../Model/GetAllPostsDTO';
import { Router, ActivatedRoute } from '@angular/router';

export interface CategoryStats {
  total: number;
  posts: number;
  polls: number;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryFilterService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private selectedCategoryIdSubject = new BehaviorSubject<number | null>(null);
  public selectedCategoryId$: Observable<number | null> = this.selectedCategoryIdSubject.asObservable();

  private selectedCategorySubject = new BehaviorSubject<ICategories | null>(null);
  public selectedCategory$: Observable<ICategories | null> = this.selectedCategorySubject.asObservable();

  private categoryCountsSubject = new BehaviorSubject<{ [categoryId: number]: CategoryStats }>({});
  public categoryCounts$: Observable<{ [categoryId: number]: CategoryStats }> = this.categoryCountsSubject.asObservable();

  private totalDiscussionsSubject = new BehaviorSubject<number>(0);
  public totalDiscussions$: Observable<number> = this.totalDiscussionsSubject.asObservable();

  private allCategoriesSubject = new BehaviorSubject<ICategories[]>([]);
  public allCategories$: Observable<ICategories[]> = this.allCategoriesSubject.asObservable();

  get selectedCategoryId(): number | null {
    return this.selectedCategoryIdSubject.value;
  }

  get selectedCategory(): ICategories | null {
    return this.selectedCategorySubject.value;
  }

  setCategories(categories: ICategories[]) {
    this.allCategoriesSubject.next(categories || []);
    // If a category ID was already selected, update the full object
    if (this.selectedCategoryId) {
      const found = (categories || []).find(c => c.id === this.selectedCategoryId);
      if (found) {
        this.selectedCategorySubject.next(found);
      }
    }
  }

  selectCategory(category: ICategories | null, updateUrl: boolean = true) {
    this.selectedCategorySubject.next(category);
    this.selectedCategoryIdSubject.next(category ? category.id : null);

    if (updateUrl) {
      this.syncUrlParams(category ? category.id : null);
    }
  }

  selectCategoryId(categoryId: number | null, updateUrl: boolean = true) {
    this.selectedCategoryIdSubject.next(categoryId);
    const categories = this.allCategoriesSubject.value;
    const found = categoryId ? categories.find(c => c.id === categoryId) || null : null;
    this.selectedCategorySubject.next(found);

    if (updateUrl) {
      this.syncUrlParams(categoryId);
    }
  }

  clearFilter(updateUrl: boolean = true) {
    this.selectCategory(null, updateUrl);
  }

  updateCounts(posts: GetAllPostsDTO[]) {
    if (!posts) {
      this.categoryCountsSubject.next({});
      this.totalDiscussionsSubject.next(0);
      return;
    }

    const counts: { [categoryId: number]: CategoryStats } = {};
    let totalCount = 0;

    posts.forEach((post) => {
      if (post.isDeleted) return;
      totalCount++;
      const catId = post.categoryId;
      if (!counts[catId]) {
        counts[catId] = { total: 0, posts: 0, polls: 0 };
      }
      counts[catId].total++;
      if (post.poll) {
        counts[catId].polls++;
      } else {
        counts[catId].posts++;
      }
    });

    this.categoryCountsSubject.next(counts);
    this.totalDiscussionsSubject.next(totalCount);
  }

  private syncUrlParams(categoryId: number | null) {
    try {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { category: categoryId ? categoryId : null },
        queryParamsHandling: 'merge',
        replaceUrl: false,
      });
    } catch (e) {
      // safe fallback if route context is not available
    }
  }
}
