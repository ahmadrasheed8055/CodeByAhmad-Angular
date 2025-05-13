export interface AddPostDTO {
  Title: string;
  Description: string;

  updatedAt?: Date;
  isPublished: boolean;

  userId: number;
  categoryId: number;
  postImage?: File; // The File object representing the uploaded image

}
