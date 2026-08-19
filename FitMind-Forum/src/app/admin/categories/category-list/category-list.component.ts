import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../services/admin-data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css'
})
export class CategoryListComponent implements OnInit {
  private dataService = inject(AdminDataService);
  private toastr = inject(ToastrService);

  categories: any[] = [];
  isLoading = false;
  
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  
  formData = {
    name: '',
    slug: '',
    imageUrl: '',
    description: ''
  };

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.dataService.getCategories().subscribe({
      next: (res) => {
        this.categories = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load categories');
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.formData = { name: '', slug: '', imageUrl: '', description: '' };
    this.showModal = true;
  }

  openEditModal(category: any) {
    this.isEditing = true;
    this.editingId = category.id;
    this.formData = {
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      description: category.description
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCategory() {
    if (!this.formData.name) {
      this.toastr.warning('Name is required');
      return;
    }

    if (this.isEditing && this.editingId) {
      this.dataService.updateCategory(this.editingId, this.formData).subscribe({
        next: () => {
          this.toastr.success('Category updated');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.toastr.error(err.error || 'Failed to update category');
        }
      });
    } else {
      this.dataService.createCategory(this.formData).subscribe({
        next: () => {
          this.toastr.success('Category created');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.toastr.error(err.error || 'Failed to create category');
        }
      });
    }
  }

  deleteCategory(category: any) {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.dataService.deleteCategory(category.id).subscribe({
        next: () => {
          this.toastr.success('Category deleted');
          this.loadCategories();
        },
        error: (err) => {
          // Display backend validation error if it has posts attached
          this.toastr.error(typeof err.error === 'string' ? err.error : 'Failed to delete category');
        }
      });
    }
  }
}
