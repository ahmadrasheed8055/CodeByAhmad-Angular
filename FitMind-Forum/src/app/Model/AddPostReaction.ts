export interface PostReactionsDTO {                  // optional if not needed on create
  postId: number;
  userId: number;
  isLike: boolean | null;
}
