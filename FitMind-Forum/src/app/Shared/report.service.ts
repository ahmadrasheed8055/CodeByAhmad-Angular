import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:5177/api/reports';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private reportedPosts = new Set<number>();
  private reportedPolls = new Set<number>();
  private reportedProfiles = new Set<number>();

  private isInitialized = new BehaviorSubject<boolean>(false);

  constructor() {
    this.authService.appUserData$.subscribe((user: any) => {
      if (user) {
        this.fetchMyReports();
      } else {
        this.clearState();
      }
    });
  }

  private fetchMyReports() {
    const headers = new HttpHeaders({ Authorization: `Bearer ${sessionStorage.getItem('token')}` });
    this.http.get<any>(`${this.apiUrl}/my-reports`, { headers }).subscribe({
      next: (res) => {
        this.reportedPosts = new Set(res.reportedPosts || []);
        this.reportedPolls = new Set(res.reportedPolls || []);
        this.reportedProfiles = new Set(res.reportedProfiles || []);
        this.isInitialized.next(true);
      },
      error: (err) => {
        console.error('Failed to load my reports', err);
      }
    });
  }

  private clearState() {
    this.reportedPosts.clear();
    this.reportedPolls.clear();
    this.reportedProfiles.clear();
    this.isInitialized.next(false);
  }

  private getHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${sessionStorage.getItem('token')}` });
  }

  reportPost(postId: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts/${postId}`, { reason }, { headers: this.getHeaders() })
      .pipe(tap(() => this.reportedPosts.add(postId)));
  }

  reportPoll(pollId: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/polls/${pollId}`, { reason }, { headers: this.getHeaders() })
      .pipe(tap(() => this.reportedPolls.add(pollId)));
  }

  reportProfile(profileId: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/profiles/${profileId}`, { reason }, { headers: this.getHeaders() })
      .pipe(tap(() => this.reportedProfiles.add(profileId)));
  }

  isPostReported(postId: number): boolean {
    return this.reportedPosts.has(postId);
  }

  isPollReported(pollId: number): boolean {
    return this.reportedPolls.has(pollId);
  }

  isProfileReported(profileId: number): boolean {
    return this.reportedProfiles.has(profileId);
  }
}
