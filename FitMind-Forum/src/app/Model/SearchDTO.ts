import { PublicAppUserDTO } from './AppUsers';
import { GetAllPostsDTO } from './GetAllPostsDTO';
import { ICategories } from './categories';
import { PollDTO } from './PollDTO';

export interface SearchGroup<T> {
  items: T[];
  totalCount: number;
}

export interface SearchUserDTO {
  id: number;
  username: string;
  email: string;
  uniqueName?: string;
  bio?: string;
  profilePhoto?: string;
}

export interface SearchResultDTO {
  users?: SearchGroup<SearchUserDTO>;
  posts?: SearchGroup<GetAllPostsDTO>;
  categories?: SearchGroup<ICategories>;
  polls?: SearchGroup<PollDTO>;
}
