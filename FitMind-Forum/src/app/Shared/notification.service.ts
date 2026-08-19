/* CodeByAhmad - FitMind Forum Standard Professional Module */

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationItem } from '../Model/NotificationDTO';
import { AuthService } from './auth.service';
import { MasterService } from './master.service';
import { CommentService } from './comment.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private masterService = inject(MasterService);
  private commentService = inject(CommentService);
  private broadcastChannel: BroadcastChannel | null = null;
  
  private knownPostIds = new Set<number>();
  private isFirstPoll = true;
  
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  public notifications$: Observable<NotificationItem[]> = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$: Observable<number> = this.unreadCountSubject.asObservable();

  private newContentCountSubject = new BehaviorSubject<number>(0);
  public newContentCount$: Observable<number> = this.newContentCountSubject.asObservable();

  constructor() {
    this.setupBroadcastChannel();
    this.startBackgroundPolling();
  }

  public resetNewContentCount() {
    this.newContentCountSubject.next(0);
  }

  private incrementNewContentCount() {
    this.newContentCountSubject.next(this.newContentCountSubject.value + 1);
  }

  private startBackgroundPolling() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.pollBackendData();

    // Poll lightweight user notifications every 20s
    setInterval(() => {
      this.pollBackendData();
    }, 20000);
  }

  private pollBackendData() {
    const currentUserId = this.authService.userIdExists() || Number(sessionStorage.getItem('appUserId')) || 0;

    // Poll for Backend Notifications (Likes, Comments, Replies)
    if (currentUserId > 0) {
      this.masterService.getMyNotifications(currentUserId).subscribe({
        next: (backendNotifs) => {
          if (!backendNotifs || !Array.isArray(backendNotifs)) return;
          
          const mappedItems: NotificationItem[] = backendNotifs.map(n => {
            let title = 'New Notification';
            if (n.notificationType === 'comment') title = 'New Comment';
            if (n.notificationType === 'reaction') title = 'New Reaction';
            
            return {
              id: n.notificationId.toString(),
              type: n.notificationType as any,
              title: title,
              message: n.message,
              userName: n.actorName || 'Member',
              userImage: n.actorImage || '',
              timestamp: new Date(n.createdAt),
              isRead: n.isRead,
              targetId: n.targetId,
              isFollowingActor: n.isFollowingActor
            };
          });

          mappedItems.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

          this.notificationsSubject.next(mappedItems);
          const unread = mappedItems.filter(i => !i.isRead).length;
          this.unreadCountSubject.next(unread);
        },
        error: () => {}
      });
    }
  }

  private setupBroadcastChannel() {
    if (isPlatformBrowser(this.platformId) && typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('fitmind_community_notifications');
      this.broadcastChannel.onmessage = (event) => {
        if (!event.data) return;
        
        const currentUserId = this.authService.userIdExists() || Number(sessionStorage.getItem('appUserId')) || 0;

        if (event.data.type === 'NEW_COMMUNITY_CONTENT') {
          const { authorUserId } = event.data;
          if (authorUserId !== currentUserId) {
             this.incrementNewContentCount();
          }
        } else if (event.data.type === 'FORCE_POLL') {
          // Immediately fetch notifications if instructed
          this.pollBackendData();
        }
      };
    }
  }

  public notifyNewPost(authorUserId: number, userName: string, postTitle: string, userImage?: string, targetId?: number) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'NEW_COMMUNITY_CONTENT',
        contentType: 'post',
        authorUserId,
        userName,
        postTitle,
        userImage,
        targetId
      });
    }
  }

  public notifyNewPoll(authorUserId: number, userName: string, pollQuestion: string, userImage?: string, targetId?: number) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'NEW_COMMUNITY_CONTENT',
        contentType: 'poll',
        authorUserId,
        userName,
        postTitle: pollQuestion,
        userImage,
        targetId
      });
    }
  }

  // Note: Local notifications for likes/comments are no longer manually dispatched 
  // because the backend accurately creates them and the client polls them.
  // The frontend components can still call these stubs if they want, but the actual state is fetched from DB.
  public notifyPostReaction(targetUserId: number, userName: string, postTitle: string, isLike: boolean, targetId?: number) {}
  public notifyNewComment(targetUserId: number, userName: string, commentText: string, targetId?: number) {}
  public notifyCommentReply(targetUserId: number, userName: string, replyText: string, targetId?: number) {}
  public notifyCommentReaction(targetUserId: number, userName: string, isLike: boolean) {}

  public markAsRead(id: string) {
    this.masterService.markNotificationAsRead(Number(id)).subscribe({
      next: () => {
         const updated = this.notificationsSubject.value.map(item => {
           if (item.id === id) {
             return { ...item, isRead: true };
           }
           return item;
         });
         this.notificationsSubject.next(updated);
         this.unreadCountSubject.next(updated.filter(i => !i.isRead).length);
      },
      error: () => {}
    });
  }

  public markAllAsRead() {
    const currentUserId = this.authService.userIdExists() || Number(sessionStorage.getItem('appUserId')) || 0;
    if (currentUserId === 0) return;
    
    this.masterService.markAllNotificationsAsRead(currentUserId).subscribe({
      next: () => {
        const updated = this.notificationsSubject.value.map(item => ({ ...item, isRead: true }));
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(0);
      },
      error: () => {}
    });
  }

  public deleteNotification(id: string) {
    this.masterService.deleteNotification(Number(id)).subscribe({
      next: () => {
         const updated = this.notificationsSubject.value.filter(item => item.id !== id);
         this.notificationsSubject.next(updated);
         this.unreadCountSubject.next(updated.filter(i => !i.isRead).length);
      },
      error: () => {}
    });
  }

  public timeAgo(date: Date | string): string {
    const inputDate = new Date(date);
    const now = new Date();
    const seconds = Math.floor((+now - +inputDate) / 1000);
    
    if (seconds < 60) return 'Just now';

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval === 1 ? '1 year ago' : `${interval} years ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval === 1 ? '1 month ago' : `${interval} months ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval === 1 ? '1 day ago' : `${interval} days ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval === 1 ? '1 hour ago' : `${interval} hours ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;

    return 'Just now';
  }
}
