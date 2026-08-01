/* CodeByAhmad - FitMind Forum Standard Professional Module */

export interface NotificationItem {
  id: string;
  type: 'post' | 'poll' | 'reaction' | 'comment' | 'follow';
  title: string;
  message: string;
  userName: string;
  userImage?: string;
  timestamp: Date;
  isRead: boolean;
  targetId?: number;
  isFollowingActor?: boolean;
}
