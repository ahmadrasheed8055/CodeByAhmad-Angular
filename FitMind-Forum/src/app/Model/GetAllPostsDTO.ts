import { PollDTO } from "./PollDTO";

export interface GetAllPostsDTO {
  postId: number;
  title: string;
  description?: string;
  updatedAt?: Date;
  publishAt: Date;
  isPublished: boolean;
  userId: number;
  userName?: string;
  userImage?: string;
  categoryId: number;
  categoryName?: string;
  postImage?: string;
  createdAt: Date;
  viewCount: number;
  likeCount?: number;
  dislikeCount?: number;

  isReactedByMe?: boolean | null;
  isSavedByMe?: boolean;
  poll?: PollDTO;
  isDeleted?: boolean;
  isFollowingAuthor?: boolean;
  authorRole?: string;
}
