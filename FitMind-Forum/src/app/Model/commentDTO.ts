// ---- Response model (jo backend GET APIs se wapas aata hai) ----
export interface GetPostComment {
  commentId: number;
  postId: number;
  userId: number;
  userName: string;
  userImage: string;
  commentContent: string;
  createdAt: string;
  likeCount?: number;
  dislikeCount?: number;
  currentUserReaction?: boolean | null; // true = liked, false = disliked, null = none
  replies?: GetPostComment[];
}

// ---- Request DTOs (backend field names EXACTLY match — PascalCase) ----
export interface PostComments {
  PostId: number;
  UserId: number;
  CommentContent: string;
}

export interface CommentReactionDTO {
  CommentId: number;
  UserId: number;
  IsLike?: boolean | null; // true = like, false = dislike
}