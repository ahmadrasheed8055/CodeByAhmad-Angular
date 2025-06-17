export interface GetDraftedPostDTO {
  postId: number;  
  title: string;
  description?: string;
  createdAt: string;     // Use string to handle ISO Date from API
  updatedAt?: string;
  isPublished: boolean;
  userId: number;
  categoryId: number;
}
