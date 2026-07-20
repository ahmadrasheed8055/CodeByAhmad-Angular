export interface PostComment {
  commentId: number;
  postId: number;
  userId: number;
  commentContent: string;
  createdAt: Date | string;
  isDeleted: boolean;
  
  // User Data
  userName: string;
  userImage?: string | null;

  // Comments System Metadata
  parentCommentId?: number | null;
  repliesCount: number;
  likeCount: number;
  dislikeCount: number;
  isReactedByMe?: boolean | null; // true = Liked, false = Disliked, null = No Reaction
  
  // Client-side properties
  replies?: PostComment[];
}

export interface AddCommentRequest {
  postId: number;
  userId: number;
  commentContent: string;
  parentCommentId?: number | null; // Provide this ONLY if you are replying to a comment
}
