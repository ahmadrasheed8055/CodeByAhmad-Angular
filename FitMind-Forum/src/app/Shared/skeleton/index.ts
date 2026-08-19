export * from './skeleton.component';
export * from './post-card-skeleton.component';
export * from './comment-skeleton.component';
export * from './list-item-skeleton.component';
export * from './profile-skeleton.component';
export * from './search-skeleton.component';
export * from './form-skeleton.component';

import { SkeletonComponent } from './skeleton.component';
import { PostCardSkeletonComponent } from './post-card-skeleton.component';
import { CommentSkeletonComponent } from './comment-skeleton.component';
import { ListItemSkeletonComponent } from './list-item-skeleton.component';
import { ProfileSkeletonComponent } from './profile-skeleton.component';
import { SearchSkeletonComponent } from './search-skeleton.component';
import { FormSkeletonComponent } from './form-skeleton.component';

export const SKELETON_COMPONENTS = [
  SkeletonComponent,
  PostCardSkeletonComponent,
  CommentSkeletonComponent,
  ListItemSkeletonComponent,
  ProfileSkeletonComponent,
  SearchSkeletonComponent,
  FormSkeletonComponent
] as const;
