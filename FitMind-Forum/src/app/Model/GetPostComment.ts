// src/app/Model/GetPostComment.ts
export interface GetPostComment {
  id: number;
  postId: number;
  userName: string;
  userAvatar: string;
  commentText: string;
  timestamp: string; // ISO format
  replies?: GetPostComment[]; // Nested replies
}
