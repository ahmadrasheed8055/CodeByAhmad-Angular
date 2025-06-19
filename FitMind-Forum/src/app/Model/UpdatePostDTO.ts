export interface UpdatePostDTO {
  PostId: number;
  Title: string;
  Description: string ;
//   UpdatedAt?: Date | null;
  IsPublished: boolean;
//   UserId: number;
  CategoryId: number;
  PostImage?: File | null;
}

