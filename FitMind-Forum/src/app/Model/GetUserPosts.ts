export interface GetUserPostsDTO {
  postId: number;
  title: string;
  description?: string;
  updatedAt?: Date;
  publishAt: Date;
  isPublished: boolean;
  userId: number;
  userName?: string;
  categoryId: number;
  categoryName?: string;
postImageUrl?: string;
  createdAt: Date;
  viewCount: number;
  likeCount?: number;
  dislikeCount?: number;

  isReactedByMe?: boolean;

}
