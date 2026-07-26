export interface CreatePollDTO {
  title: string;
  categoryId: number;
  options: string[];
  expiresAt?: Date | null;
  userId: number;
  allowUserOptions: boolean;
  isMultipleChoice: boolean;
  allowVoteEdit: boolean;
}

export interface VotePollDTO {
  pollId: number;
  optionIds: number[];
  userId: number;
}

export interface PollOptionResultDTO {
  optionId: number;
  optionText: string;
  optionLetter: string;
  voteCount: number;
  votePercentage: number;
}

export interface PollDTO {
  pollId: number;
  postId: number;
  question: string;
  expiresAt?: Date | null;
  isExpired: boolean;
  totalVotes: number;
  userVotedOptionIds?: number[] | null;
  allowUserOptions: boolean;
  isMultipleChoice: boolean;
  allowVoteEdit: boolean;
  isPinned: boolean;
  isClosed: boolean;
  options: PollOptionResultDTO[];
}
