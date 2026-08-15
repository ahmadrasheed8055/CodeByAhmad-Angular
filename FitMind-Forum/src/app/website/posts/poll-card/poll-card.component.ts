import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PollDTO, VotePollDTO } from '../../../Model/PollDTO';
import { MasterService } from '../../../Shared/master.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../Shared/auth.service';
import { RouterModule } from '@angular/router';
import { PendingActionService } from '../../../Shared/pending-action.service';

@Component({
  selector: 'app-poll-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './poll-card.component.html',
  styleUrl: './poll-card.component.css'
})
export class PollCardComponent implements OnInit {
  @Input() poll!: PollDTO;
  @Input() post: any;
  @Output() pollDeleted = new EventEmitter<number>();
  loggedInUserId: number = 0;
  isVoting: boolean = false;
  isVotingMode: boolean = true;

  selectedOptions: number[] = [];
  customOptionText: string = '';
  isAddingOption: boolean = false;
  shareLink: string = '';
  @ViewChild('shareInput') shareInput!: ElementRef;

  constructor(
    private masterService: MasterService,
    private toastr: ToastrService,
    public authService: AuthService,
    private pendingActionService: PendingActionService
  ) {}

  ngOnInit(): void {
    this.authService.appUserId$.subscribe((userId) => {
      this.loggedInUserId = userId || 0;
      if (!this.poll.userVotedOptionIds) {
        this.poll.userVotedOptionIds = [];
      }
    });

    // Subscribe to pending action replay after login
    this.pendingActionService.actionReady$.subscribe(({ action, userId }) => {
      switch (action.type) {
        case 'VOTE_POLL': {
          if (action.pollId === this.poll?.pollId) {
            this.toggleOption(action.optionId);
          }
          break;
        }
        case 'ADD_POLL_OPTION': {
          if (action.pollId === this.poll?.pollId) {
            this.customOptionText = action.optionText;
            this.addCustomOption();
          }
          break;
        }
        case 'FOLLOW_USER': {
          if (this.post && this.post.userId === action.targetUserId) {
            this.toggleFollow(this.post);
          }
          break;
        }
      }
    });
  }

  get canShowResults(): boolean {
    if (!this.poll) return false;
    const hasVoted = !!(this.poll.userVotedOptionIds && this.poll.userVotedOptionIds.length > 0);
    return hasVoted || !!this.poll.isClosed || !!this.poll.isExpired || !!this.poll.showResultsBeforeVoting;
  }

  toggleOption(optionId: number) {
    if (!this.loggedInUserId) {
      this.pendingActionService.setPendingAction({ type: 'VOTE_POLL', pollId: this.poll.pollId, optionId });
      return;
    }
    if (this.poll.isExpired || this.poll.isClosed) {
      this.toastr.warning('This poll is closed or expired');
      return;
    }

    const hasVoted = (this.poll.userVotedOptionIds && this.poll.userVotedOptionIds.length > 0);
    if (!this.poll.allowVoteEdit && hasVoted) {
      return;
    }

    // Keep a backup of current state
    const previousVotes = [...(this.poll.userVotedOptionIds || [])];
    let newVotes = [...previousVotes];

    const idx = newVotes.indexOf(optionId);
    if (this.poll.isMultipleChoice) {
      if (idx > -1) {
        newVotes.splice(idx, 1);
      } else {
        if (newVotes.length >= 2) {
          this.toastr.warning('Maximum 2 options allowed.');
          return;
        }
        newVotes.push(optionId);
      }
    } else {
      if (idx > -1) {
        // Toggle off if already selected in single choice
        newVotes = [];
      } else {
        newVotes = [optionId];
      }
    }

    // Optimistic Update
    this.applyOptimisticUpdate(previousVotes, newVotes);

    // Silent Sync
    const payload: VotePollDTO = {
      pollId: this.poll.pollId,
      optionIds: newVotes,
      userId: this.loggedInUserId
    };

    this.masterService.votePoll(payload).subscribe({
      next: (res: PollDTO) => {
        // The backend returns the perfectly calculated true state, sync it silently.
        this.poll = res;
      },
      error: (err) => {
        // Rollback on failure
        this.applyOptimisticUpdate(newVotes, previousVotes);
        this.toastr.error(err.error?.message || 'Failed to vote');
      }
    });
  }

  applyOptimisticUpdate(oldVotes: number[], newVotes: number[]) {
    // 1. Identify added and removed options
    const added = newVotes.filter(id => !oldVotes.includes(id));
    const removed = oldVotes.filter(id => !newVotes.includes(id));

    // 2. Adjust vote counts & total votes
    added.forEach(id => {
      const opt = this.poll.options.find(o => o.optionId === id);
      if (opt) opt.voteCount++;
      this.poll.totalVotes++;
    });

    removed.forEach(id => {
      const opt = this.poll.options.find(o => o.optionId === id);
      if (opt) opt.voteCount--;
      this.poll.totalVotes--;
    });

    // 3. Recalculate percentages
    this.poll.options.forEach(opt => {
      opt.votePercentage = this.poll.totalVotes === 0 ? 0 : Math.round((opt.voteCount / this.poll.totalVotes) * 100);
    });

    // 4. Update the current user voted array
    this.poll.userVotedOptionIds = newVotes;
  }

  addCustomOption() {
    if (!this.loggedInUserId) {
      if (this.customOptionText.trim()) {
        this.pendingActionService.setPendingAction({ type: 'ADD_POLL_OPTION', pollId: this.poll.pollId, optionText: this.customOptionText.trim() });
      }
      return;
    }
    if (!this.customOptionText.trim()) return;

    this.isAddingOption = true;
    const payload = {
      pollId: this.poll.pollId,
      userId: this.loggedInUserId,
      optionText: this.customOptionText
    };

    this.masterService.addCustomPollOption(payload).subscribe({
      next: (res: any) => {
        this.toastr.success('Option added successfully!');
        this.poll.options.push({
          optionId: res.optionId,
          optionText: this.customOptionText,
          optionLetter: '?',
          voteCount: 0,
          votePercentage: 0
        });
        this.customOptionText = '';
        this.isAddingOption = false;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to add option');
        this.isAddingOption = false;
      }
    });
  }

  togglePin() {
    this.masterService.togglePollPin(this.poll.pollId).subscribe({
      next: (res: any) => {
        this.poll.isPinned = !this.poll.isPinned;
        this.toastr.success(res.message || (this.poll.isPinned ? 'Poll pinned' : 'Poll unpinned'));
      }
    });
  }

  toggleClose() {
    this.masterService.togglePollClose(this.poll.pollId).subscribe({
      next: (res: any) => {
        this.poll.isClosed = !this.poll.isClosed;
        this.toastr.success(res.message || (this.poll.isClosed ? 'Poll closed' : 'Poll reopened'));
      }
    });
  }

  isDeletingPoll: boolean = false;
  showDeleteConfirm: boolean = false;

  deletePoll() {
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  confirmDeletePoll() {
    this.isDeletingPoll = true;
    this.masterService.deletePoll(this.poll.pollId).subscribe({
      next: () => {
        this.isDeletingPoll = false;
        this.showDeleteConfirm = false;
        this.toastr.success('Poll deleted.');
        this.pollDeleted.emit(this.poll.pollId);
      },
      error: (err) => {
        this.isDeletingPoll = false;
        this.toastr.error(err.error?.message || 'Failed to delete poll');
      }
    });
  }

  openShareModal() {
    this.shareLink = window.location.origin + '/post/' + this.post.postId;
  }
  copyShareLink() {
    if (this.shareInput) {
      this.shareInput.nativeElement.select();
      document.execCommand('copy');
      this.toastr.success('Link copied to clipboard!');
    }
  }

  timeAgo(date: Date | string): string {
    const inputDate = new Date(date);
    const now = new Date();
    const seconds = Math.floor((+now - +inputDate) / 1000);
    if (seconds < 10) return 'Just now';
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return inputDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1 || Math.floor(seconds / 86400) > 6) {
      return inputDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
    return `${Math.floor(seconds)} seconds ago`;
  }

  toggleFollow(post: any) {
    if (!this.authService.isLoggedIn()) {
      this.pendingActionService.setPendingAction({ type: 'FOLLOW_USER', targetUserId: post.userId });
      return;
    }
    
    if (post.isFollowingAuthor) {
      // Unfollow
      this.masterService.unfollowUser(post.userId).subscribe({
        next: () => {
          post.isFollowingAuthor = false;
          // Broadcast update so other components update
          const bc = new BroadcastChannel('fitmind_community_notifications');
          bc.postMessage({ type: 'FOLLOW_UPDATE', targetUserId: post.userId, isFollowing: false });
          bc.close();
        },
        error: () => this.toastr.error('Failed to unfollow user')
      });
    } else {
      // Follow
      this.masterService.followUser(post.userId).subscribe({
        next: () => {
          post.isFollowingAuthor = true;
          // Broadcast update
          const bc = new BroadcastChannel('fitmind_community_notifications');
          bc.postMessage({ type: 'FOLLOW_UPDATE', targetUserId: post.userId, isFollowing: true });
          bc.close();
        },
        error: () => this.toastr.error('Failed to follow user')
      });
    }
  }
}
