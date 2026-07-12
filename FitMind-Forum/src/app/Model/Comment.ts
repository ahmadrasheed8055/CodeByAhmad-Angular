export interface CommentDTO {
  commentId: number;
  postId: number;
  userId: number;
  userName?: string;
  userImage?: string;
  commentText: string;
  publishAt: string | Date;
}

export interface AddCommentDTO {
  postId: number;
  userId: number;
  commentText: string;
}
