import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminAuthService } from '../auth/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private http = inject(HttpClient);
  private authService = inject(AdminAuthService);
  private apiUrl = 'http://localhost:5177/api/admin';

  private get headers() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  // Dashboard
  getDashboardSummary() {
    return this.http.get<any>(`${this.apiUrl}/dashboard`, { headers: this.headers });
  }

  // Users
  getUsers(page = 1, pageSize = 10, search = '', status?: number) {
    let url = `${this.apiUrl}/users?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
    if (status !== undefined && status !== null) url += `&status=${status}`;
    return this.http.get<any>(url, { headers: this.headers });
  }

  getUser(id: number) {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`, { headers: this.headers });
  }

  updateUserStatus(id: number, status: number) {
    return this.http.put(`${this.apiUrl}/users/${id}/status`, status, { headers: this.headers });
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.apiUrl}/users/${id}`, { headers: this.headers });
  }

  // Posts
  getPosts(page = 1, pageSize = 10, search = '', isPublished?: boolean) {
    let url = `${this.apiUrl}/posts?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`;
    if (isPublished !== undefined && isPublished !== null) url += `&isPublished=${isPublished}`;
    return this.http.get<any>(url, { headers: this.headers });
  }

  getPost(id: number) {
    return this.http.get<any>(`${this.apiUrl}/posts/${id}`, { headers: this.headers });
  }

  togglePostVisibility(id: number) {
    return this.http.put(`${this.apiUrl}/posts/${id}/toggle-visibility`, {}, { headers: this.headers });
  }

  deletePost(id: number) {
    return this.http.delete(`${this.apiUrl}/posts/${id}`, { headers: this.headers });
  }

  deleteComment(id: number) {
    return this.http.delete(`${this.apiUrl}/posts/comments/${id}`, { headers: this.headers });
  }

  // Reports
  getReportsSummary() {
    return this.http.get<any>(`${this.apiUrl}/reports/summary`, { headers: this.headers });
  }

  getReports(page = 1, pageSize = 10, status = 'Pending', type = '') {
    let url = `${this.apiUrl}/reports?page=${page}&pageSize=${pageSize}&status=${encodeURIComponent(status)}`;
    if (type) url += `&type=${encodeURIComponent(type)}`;
    return this.http.get<any>(url, { headers: this.headers });
  }

  getReport(id: number) {
    return this.http.get<any>(`${this.apiUrl}/reports/${id}`, { headers: this.headers });
  }

  updateReportStatus(id: number, status: string) {
    return this.http.put(`${this.apiUrl}/reports/${id}/status`, { status }, { headers: this.headers });
  }

  resolveReport(id: number) {
    return this.updateReportStatus(id, 'Resolved');
  }

  dismissReport(id: number) {
    return this.updateReportStatus(id, 'Dismissed');
  }

  // Categories
  getCategories() {
    return this.http.get<any[]>(`${this.apiUrl}/categories`, { headers: this.headers });
  }

  createCategory(category: any) {
    return this.http.post(`${this.apiUrl}/categories`, category, { headers: this.headers });
  }

  updateCategory(id: number, category: any) {
    return this.http.put(`${this.apiUrl}/categories/${id}`, category, { headers: this.headers });
  }

  deleteCategory(id: number) {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, { headers: this.headers });
  }

  // Polls
  getPolls(page = 1, pageSize = 10, search = '') {
    return this.http.get<any>(`${this.apiUrl}/polls?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`, { headers: this.headers });
  }

  getPoll(id: number) {
    return this.http.get<any>(`${this.apiUrl}/polls/${id}`, { headers: this.headers });
  }

  updatePoll(id: number, poll: any) {
    return this.http.put(`${this.apiUrl}/polls/${id}`, poll, { headers: this.headers });
  }

  deletePoll(id: number) {
    return this.http.delete(`${this.apiUrl}/polls/${id}`, { headers: this.headers });
  }

  // Admins
  getAdmins() {
    return this.http.get<any[]>(`${this.apiUrl}/admins`, { headers: this.headers });
  }

  addAdmin(email: string) {
    return this.http.post(`${this.apiUrl}/admins`, { email }, { headers: this.headers });
  }

  toggleAdminStatus(id: number) {
    return this.http.put(`${this.apiUrl}/admins/${id}/toggle-status`, {}, { headers: this.headers });
  }

  deleteAdmin(id: number) {
    return this.http.delete(`${this.apiUrl}/admins/${id}`, { headers: this.headers });
  }
}
