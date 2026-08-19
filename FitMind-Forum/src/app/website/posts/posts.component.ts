/* CodeByAhmad - FitMind Forum Standard Professional Module */

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AddPostComponent } from '../user/add-post/add-post.component';
import { MasterService } from '../../Shared/master.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { NotificationService } from '../../Shared/notification.service';
import { GetAllPostsDTO } from '../../Model/GetAllPostsDTO';
import { PostReactionsDTO } from '../../Model/AddPostReaction';
import { GetPostReactionsCount } from '../../Model/GetPostReactionsCount';
import { AuthService } from '../../Shared/auth.service';
import { CommentsComponent } from './comments/comments.component';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PollCardComponent } from './poll-card/poll-card.component';
import { CreatePollDTO } from '../../Model/PollDTO';
import { CategoryFilterService } from '../../Shared/category-filter.service';
import { ICategories } from '../../Model/categories';
import { ChatbotService, ChatMessage } from '../../Shared/chatbot.service';
import { MarkdownPipe } from '../../Shared/markdown.pipe';
import { PendingActionService } from '../../Shared/pending-action.service';
import { PostCardSkeletonComponent, SkeletonComponent } from '../../Shared/skeleton';
import { ReportModalComponent } from '../../Shared/components/report-modal/report-modal.component';
import { ReportService } from '../../Shared/report.service';

@Component({
  selector: 'app-posts',
  imports: [CommonModule, CommentsComponent, RouterModule, FormsModule, ReactiveFormsModule, PollCardComponent, MarkdownPipe, PostCardSkeletonComponent, SkeletonComponent, ReportModalComponent],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent implements OnInit {
  constructor() {}
  posts!: GetAllPostsDTO[];
  isLoadingPosts: boolean = true;
  MasterService = inject(MasterService);
  AuthService = inject(AuthService);
  snackBarService = inject(SnackBarServiceService);
  notificationService = inject(NotificationService);
  categoryFilterService = inject(CategoryFilterService);
  chatbotService = inject(ChatbotService);
  pendingActionService = inject(PendingActionService);
  public reportService = inject(ReportService);

  // Post AI Assistant State
  selectedAiPost: GetAllPostsDTO | null = null;
  isAiAnalyzing: boolean = false;
  aiAnalysisResult: string = '';
  aiFollowUpQuestion: string = '';
  aiChatHistory: ChatMessage[] = [];
  activeAiPromptType: 'summary' | 'action' | 'science' | 'custom' = 'summary';

  selectedCategory: ICategories | null = null;
  selectedCategoryId: number | null = null;
  userId: number = 0;
  currentUserImage: string = '';
  postReactionsCount: GetPostReactionsCount | null = null;
  reactionIcons: boolean = false;
  selectedPostId: number = 0;

  pollQuestion: string = '';
  pollOptions: string[] = ['', ''];
  selectedPollCategory: number = 0;
  pollExpiresAt: string = '';
  isSubmittingPoll: boolean = false;
  categories: any[] = [];
  pollAllowUserOptions: boolean = false;
  pollIsMultipleChoice: boolean = false;
  pollAllowVoteEdit: boolean = false;
  pollShowResultsBeforeVoting: boolean = false;
  // Inline Add Post Form state & logic
  fb = inject(FormBuilder);
  inlinePostForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    category: ['', [Validators.required]],
    image: [null]
  });

  isInlineAddPostOpen: boolean = false;
  inlinePreviewUrl: string | null = null;
  isSubmittingInlinePost: boolean = false;
  inlineFormSubmitted: boolean = false;

  toggleInlineAddPost(open: boolean, triggerPhotoPicker: boolean = false) {
    if (open && !this.AuthService.isLoggedIn()) {
      this.pendingActionService.setPendingAction({ type: 'NAVIGATE', targetUrl: '/add-post' });
      return;
    }
    this.isInlineAddPostOpen = open;
    this.inlineFormSubmitted = false;
    if (!open) {
      this.resetInlineForm();
    } else {
      if (this.categories && this.categories.length > 0 && !this.inlinePostForm.get('category')?.value) {
        this.inlinePostForm.patchValue({ category: this.categories[0].id });
      }
      if (triggerPhotoPicker) {
        setTimeout(() => {
          const fileInput = document.getElementById('inlineFileInput') as HTMLInputElement;
          if (fileInput) {
            fileInput.click();
          }
        }, 100);
      }
    }
  }

  resetInlineForm() {
    this.inlinePostForm.reset({
      title: '',
      description: '',
      category: this.categories && this.categories.length > 0 ? this.categories[0].id : '',
      image: null
    });
    this.inlinePreviewUrl = null;
    this.inlineFormSubmitted = false;
  }

  onInlineFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.snackBarService.showError('Please select a valid image file (PNG, JPG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.snackBarService.showError('Image size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.inlinePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      this.inlinePostForm.patchValue({ image: file });
      this.inlinePostForm.get('image')?.markAsDirty();
    }
  }

  removeInlineImage() {
    this.inlinePreviewUrl = null;
    this.inlinePostForm.patchValue({ image: null });
  }

  submitInlinePost(type: 'publish' | 'draft') {
    this.inlineFormSubmitted = true;
    if (this.inlinePostForm.invalid) {
      this.snackBarService.showError('Please fill in all required fields accurately.');
      return;
    }

    const currentUserId = this.AuthService.userIdExists() || Number(sessionStorage.getItem('appUserId')) || this.userId;
    if (!currentUserId) {
      this.pendingActionService.setPendingAction({ type: 'NAVIGATE', targetUrl: '/add-post' });
      return;
    }

    this.isSubmittingInlinePost = true;
    const formData = new FormData();
    formData.append('Title', this.inlinePostForm.value.title);
    formData.append('Description', this.inlinePostForm.value.description);
    formData.append('IsPublished', type === 'publish' ? 'true' : 'false');
    formData.append('UserId', String(currentUserId));
    formData.append('CategoryId', String(this.inlinePostForm.value.category));

    const file = this.inlinePostForm.get('image')?.value;
    if (file) {
      formData.append('PostImage', file);
    }

    const postTitle = this.inlinePostForm.value.title;
    this.MasterService.addPost(formData).subscribe({
      next: (res) => {
        this.isSubmittingInlinePost = false;
        if (type === 'draft') {
          this.snackBarService.showSuccess('Post saved as draft successfully!');
        } else {
          const authorName = (this.AuthService.userIdExists() && this.currentUserImage) ? 'You' : 'Community Member';
          this.notificationService.notifyNewPost(currentUserId, authorName, postTitle, this.currentUserImage);
        }
        this.resetInlineForm();
        this.isInlineAddPostOpen = false;
        this.refreshPosts();
      },
      error: (error) => {
        this.isSubmittingInlinePost = false;
        let errorMessage = 'Failed to create post. Please try again.';
        if (error.status === 400) {
          errorMessage = typeof error.error === 'string' ? error.error : (error.error?.message || 'Invalid post data.');
        } else if (error.status === 404) {
          errorMessage = 'Category not found.';
        } else if (error.status === 422) {
          errorMessage = 'Inappropriate content detected in the image or description.';
        } else if (error.status === 500) {
          errorMessage = typeof error.error === 'string' && error.error.length < 200 ? error.error : 'Server error while processing post/image. Please try again.';
        } else if (error.status === 0) {
          errorMessage = 'Unable to reach the server. Please check your connection.';
        }
        this.snackBarService.showError(errorMessage);
      }
    });
  }

  enableUpdatePost(post: any) {
    // Implementation pending
  }
  commentCounts: { [key: number]: number } = {};
  isCommentsVisibleMap: { [key: number]: boolean } = {};
  private platformId = inject(PLATFORM_ID);

  toggleComments(postId: number) {
    this.isCommentsVisibleMap[postId] = !this.isCommentsVisibleMap[postId];
  }

  onPollDeleted(pollId: number) {
    this.posts = this.posts.filter(p => !p.poll || p.poll.pollId !== pollId);
  }

  ngOnInit() {
    // Subscribe to selected category state from CategoryFilterService
    this.categoryFilterService.selectedCategory$.subscribe((cat) => {
      this.selectedCategory = cat;
    });

    this.categoryFilterService.selectedCategoryId$.subscribe((catId) => {
      this.selectedCategoryId = catId;
      if (catId && this.categories && this.categories.length > 0) {
        this.selectedPollCategory = catId;
        this.inlinePostForm.patchValue({ category: catId });
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.AuthService.appUserId$.subscribe((userId) => {
        this.userId = userId || 0;
        this.getAllPosts();
      });

      // Subscribe to pending action replay after login
      this.pendingActionService.actionReady$.subscribe(({ action, userId }) => {
        switch (action.type) {
          case 'LIKE_POST': {
            const p = this.posts?.find(x => x.postId === action.postId);
            if (p) this.addPostReaction(action.isLike, p);
            break;
          }
          case 'SAVE_POST': {
            const p = this.posts?.find(x => x.postId === action.postId);
            if (p) this.toggleSavePost(p);
            break;
          }
          case 'HIDE_POST': {
            const p = this.posts?.find(x => x.postId === action.postId);
            if (p) this.hidePost(p);
            break;
          }
          case 'FOLLOW_USER': {
            const p = this.posts?.find(x => x.userId === action.targetUserId);
            if (p) this.toggleFollow(p);
            break;
          }
        }
      });

      this.AuthService.appUserPhotos$.subscribe((photos) => {
        if (photos && photos.profilePhoto && photos.profilePhoto !== 'data:image/jpeg;base64,null') {
          this.currentUserImage = photos.profilePhoto;
        }
      });
    } else {
      this.getAllPosts();
    }

    this.notificationService.newContentCount$.subscribe(count => {
      this.newPostsCount = count;
    });

    if (isPlatformBrowser(this.platformId)) {
      const bc = new BroadcastChannel('fitmind_community_notifications');
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'FOLLOW_UPDATE') {
          const targetId = event.data.targetUserId;
          const isFollowing = event.data.isFollowing;
          if (this.posts) {
            this.posts.forEach(p => {
              if (p.userId === targetId) {
                p.isFollowingAuthor = isFollowing;
              }
            });
          }
          if (this.filteredPosts) {
            this.filteredPosts.forEach(p => {
              if (p.userId === targetId) {
                p.isFollowingAuthor = isFollowing;
              }
            });
          }
        }
      };
    }
    
    this.MasterService.getAllCategories().subscribe(res => {
      this.categories = res || [];
      this.categoryFilterService.setCategories(this.categories);
      if (this.categories && this.categories.length > 0) {
        this.selectedPollCategory = this.selectedCategoryId || this.categories[0].id;
      }
    });
  }

  newPostsCount: number = 0;

  refreshAndClearPill() {
    this.notificationService.resetNewContentCount();
    this.refreshPosts();
  }

  getPostReactionsCount(postId: number) {
    this.MasterService.getPostReactionsCount(postId).subscribe(
      (response) => {
        console.log('Post reactions count:', response);
      },
      (error) => {
        console.error('Error fetching post reactions count:', error);
      }
    );
  }

  activeFilter: 'latest' | 'popular' | 'polls' | 'myposts' = 'latest';
  isRefreshing: boolean = false;

  setFilter(filter: 'latest' | 'popular' | 'polls' | 'myposts') {
    this.activeFilter = filter;
  }

  get filteredPosts(): GetAllPostsDTO[] {
    if (!this.posts) return [];

    let result = [...this.posts];

    // 1. Filter by Selected Category
    if (this.selectedCategoryId !== null && this.selectedCategoryId > 0) {
      result = result.filter((p) => p.categoryId === this.selectedCategoryId);
    }

    // 2. Filter by Active Tab Filter
    switch (this.activeFilter) {
      case 'popular':
        result.sort((a, b) => {
          const scoreA = (a.likeCount || 0) * 2 + (a.viewCount || 0);
          const scoreB = (b.likeCount || 0) * 2 + (b.viewCount || 0);
          return scoreB - scoreA;
        });
        break;

      case 'polls':
        result = result.filter((p) => !!p.poll);
        break;

      case 'myposts':
        result = result.filter((p) => p.userId === this.userId);
        break;

      case 'latest':
      default:
        result.sort((a, b) => {
          const dateA = new Date(a.publishAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.publishAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;
    }

    return result;
  }

  get currentCategoryItems(): GetAllPostsDTO[] {
    if (!this.posts) return [];
    if (this.selectedCategoryId) {
      return this.posts.filter(p => p.categoryId === this.selectedCategoryId && !p.isDeleted);
    }
    return this.posts.filter(p => !p.isDeleted);
  }

  get currentCategoryPostsCount(): number {
    return this.currentCategoryItems.filter(p => !p.poll).length;
  }

  get currentCategoryPollsCount(): number {
    return this.currentCategoryItems.filter(p => !!p.poll).length;
  }

  get pollsCount(): number {
    return this.currentCategoryItems.filter(p => !!p.poll).length;
  }

  get myPostsCount(): number {
    return (this.currentCategoryItems && this.userId) ? this.currentCategoryItems.filter(p => p.userId === this.userId).length : 0;
  }

  clearCategoryFilter() {
    this.categoryFilterService.clearFilter(true);
  }

  selectCategory(cat: ICategories | null) {
    this.categoryFilterService.selectCategory(cat, true);
  }

  selectCategoryId(id: number | null) {
    this.categoryFilterService.selectCategoryId(id, true);
  }

  openCreatePostForActiveCategory() {
    if (!this.AuthService.isLoggedIn()) {
      this.pendingActionService.setPendingAction({ type: 'NAVIGATE', targetUrl: '/add-post' });
      return;
    }
    this.toggleInlineAddPost(true);
    if (this.selectedCategoryId) {
      this.inlinePostForm.patchValue({ category: this.selectedCategoryId });
    }
  }

  openCreatePollForActiveCategory() {
    if (!this.AuthService.isLoggedIn()) {
      this.pendingActionService.setPendingAction({ type: 'NAVIGATE', targetUrl: '/home' });
      return;
    }
    if (this.selectedCategoryId) {
      this.selectedPollCategory = this.selectedCategoryId;
    }
  }

  openPostAiModal(post: GetAllPostsDTO) {
    this.selectedAiPost = post;
    this.aiAnalysisResult = '';
    this.aiFollowUpQuestion = '';
    this.aiChatHistory = [];
    this.activeAiPromptType = 'summary';

    // Auto-generate initial breakdown/summary
    this.generatePostAiInsight('summary');
  }

  generatePostAiInsight(promptType: 'summary' | 'action' | 'science') {
    if (!this.selectedAiPost) return;
    this.activeAiPromptType = promptType;
    this.isAiAnalyzing = true;
    this.aiAnalysisResult = '';

    let promptGoal = '';
    if (promptType === 'summary') {
      promptGoal = 'Provide a structured summary of this post with key takeaways, main points, and conclusions in bullet points.';
    } else if (promptType === 'action') {
      promptGoal = 'Provide practical, actionable fitness and nutrition advice, workout tips, or step-by-step guidance based on this post.';
    } else if (promptType === 'science') {
      promptGoal = 'Fact-check this post from an exercise physiology, sports science, and clinical nutrition perspective with evidence-based insights.';
    }

    const postContext = `[POST TITLE]: ${this.selectedAiPost.title}
[AUTHOR]: ${this.selectedAiPost.userName || 'Community Member'}
[CATEGORY]: ${this.selectedAiPost.categoryName || 'General'}
[CONTENT]: ${this.selectedAiPost.description || 'No description'}
${this.selectedAiPost.poll ? `[POLL QUESTION]: ${this.selectedAiPost.poll.question}, [OPTIONS]: ${this.selectedAiPost.poll.options?.map((o: any) => o.text).join(', ')}` : ''}

[REQUEST]: ${promptGoal}`;

    // Safety timeout: Ensure loader stops within 6s regardless of network
    const safetyTimeout = setTimeout(() => {
      if (this.isAiAnalyzing && this.selectedAiPost) {
        this.aiAnalysisResult = this.generateFallbackInsight(promptType, this.selectedAiPost);
        this.isAiAnalyzing = false;
      }
    }, 6000);

    this.chatbotService.askChatbot(postContext, []).subscribe({
      next: (res: any) => {
        clearTimeout(safetyTimeout);
        if (res && res.response && !res.response.includes('error') && !res.response.includes('high demand')) {
          this.aiAnalysisResult = res.response;
        } else {
          this.aiAnalysisResult = this.generateFallbackInsight(promptType, this.selectedAiPost!);
        }
        this.isAiAnalyzing = false;
        this.aiChatHistory = [
          { id: '1', sender: 'user', text: promptGoal, timestamp: new Date() },
          { id: '2', sender: 'bot', text: this.aiAnalysisResult, timestamp: new Date() }
        ];
      },
      error: () => {
        clearTimeout(safetyTimeout);
        if (this.selectedAiPost) {
          this.aiAnalysisResult = this.generateFallbackInsight(promptType, this.selectedAiPost);
        } else {
          this.aiAnalysisResult = '### 💡 Community Fitness Insight\n\n* Consistency and proper recovery remain the key fundamentals for sustainable athletic progress.';
        }
        this.isAiAnalyzing = false;
      }
    });
  }

  private generateFallbackInsight(promptType: string, post: GetAllPostsDTO): string {
    const cat = post.categoryName || 'Fitness';
    const title = post.title || 'Discussion';
    const desc = post.description || '';

    if (promptType === 'action') {
      return `### ⚡ Actionable Fitness Advice & Step-by-Step Tips\n\n` +
        `* **Progressive Overload:** Log and incrementally advance training volume for **${cat}** over 4–6 week blocks.\n` +
        `* **Nutritional Alignment:** Target 1.6–2.2g of protein per kg of bodyweight with high-quality hydration.\n` +
        `* **Targeted Recovery:** Schedule 1–2 rest or active mobility days weekly to optimize central nervous system recovery.\n` +
        `* **Practical Execution:** ${desc.length > 100 ? desc.slice(0, 140) + '...' : desc || 'Apply compound movements with strict form and full range of motion.'}`;
    } else if (promptType === 'science') {
      return `### 🔬 Sports Science & Exercise Physiology Perspective\n\n` +
        `* **Mechanisms of Adaptation:** Mechanical tension, muscle damage, and metabolic stress trigger local hypertrophy pathways.\n` +
        `* **Joint Safety & Biomechanics:** Maintaining a neutral spine and controlled eccentric cadence protects connective tissue.\n` +
        `* **Energy Systems:** Balances glycogen replenishment with post-exercise muscle protein synthesis (MPS).\n` +
        `* **Scientific Consensus:** Aligns with modern ACSM and NSCA exercise science literature.`;
    } else {
      return `### 📋 Key Summary & Main Takeaways\n\n` +
        `* **Core Focus:** Discussion on **${title}** within the **${cat}** community.\n` +
        `* **Author Takeaway:** Shared by **${post.userName || 'Community Athlete'}** to promote safe and effective fitness protocols.\n` +
        `* **Key Points:** Emphasizes disciplined workout consistency, nutrient timing, and community accountability.\n` +
        `* **Recommendation:** Incorporate these principles into your daily fitness and wellness routine.`;
    }
  }

  submitAiFollowUp() {
    if (!this.aiFollowUpQuestion.trim() || !this.selectedAiPost || this.isAiAnalyzing) return;
    const userQ = this.aiFollowUpQuestion.trim();
    this.aiFollowUpQuestion = '';
    this.activeAiPromptType = 'custom';
    this.isAiAnalyzing = true;

    this.aiChatHistory.push({
      id: Date.now().toString(),
      sender: 'user',
      text: userQ,
      timestamp: new Date()
    });

    const followUpPrompt = `Context: Post titled "${this.selectedAiPost.title}".
User Question: ${userQ}`;

    this.chatbotService.askChatbot(followUpPrompt, this.aiChatHistory).subscribe({
      next: (res: any) => {
        const answer = (res && res.response && !res.response.includes('error')) 
          ? res.response 
          : `Great question regarding **${this.selectedAiPost?.title}**! In general, for optimal results in ${this.selectedAiPost?.categoryName || 'fitness'}, focus on structured progression, balanced macronutrient distribution, and at least 7–8 hours of restorative sleep.`;
        this.isAiAnalyzing = false;
        this.aiChatHistory.push({
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: answer,
          timestamp: new Date()
        });
      },
      error: () => {
        this.isAiAnalyzing = false;
        this.aiChatHistory.push({
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `Focus on progressive consistency, clean nutrition, and adequate rest for optimal athletic outcomes.`,
          timestamp: new Date()
        });
      }
    });
  }

  copyAiInsight() {
    if (!this.aiAnalysisResult) return;
    navigator.clipboard.writeText(this.aiAnalysisResult);
    this.snackBarService.showSuccess('AI insights copied to clipboard!');
  }

  getCategoryFallbackIcon(name?: string): string {
    if (!name) return 'bi-grid-fill';
    const lower = name.toLowerCase();
    if (lower.includes('fitness') || lower.includes('workout') || lower.includes('gym')) return 'bi-lightning-charge-fill';
    if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('food')) return 'bi-egg-fried';
    if (lower.includes('mind') || lower.includes('mental') || lower.includes('meditation')) return 'bi-heart-pulse-fill';
    if (lower.includes('running') || lower.includes('cardio')) return 'bi-speedometer2';
    if (lower.includes('strength') || lower.includes('muscle')) return 'bi-trophy-fill';
    return 'bi-bookmark-star-fill';
  }

  getCategoryGradient(name?: string): string {
    if (!name) return 'linear-gradient(135deg, #87bf17 0%, #4a8505 100%)';
    const lower = name.toLowerCase();
    if (lower.includes('fitness') || lower.includes('workout')) return 'linear-gradient(135deg, #87bf17 0%, #4a8505 100%)';
    if (lower.includes('nutrition') || lower.includes('diet')) return 'linear-gradient(135deg, #f2994a 0%, #e27d22 100%)';
    if (lower.includes('mind') || lower.includes('mental')) return 'linear-gradient(135deg, #9b51e0 0%, #6f2dbd 100%)';
    if (lower.includes('running') || lower.includes('cardio')) return 'linear-gradient(135deg, #0195ff 0%, #0066cc 100%)';
    return 'linear-gradient(135deg, #ec595a 0%, #c43839 100%)';
  }

  refreshPosts() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    const userId = this.AuthService.userIdExists();
    if (userId === 0) {
      this.userId = 0;
    }
    this.MasterService.getAllPosts(this.userId, true).subscribe({
      next: (posts: GetAllPostsDTO[]) => {
        this.posts = posts;
        this.categoryFilterService.updateCounts(this.posts);
        setTimeout(() => {
          this.isRefreshing = false;
        }, 500);
      },
      error: (err) => {
        console.error('Error refreshing posts:', err);
        setTimeout(() => {
          this.isRefreshing = false;
        }, 500);
      }
    });
  }

  getAllPosts() {
     const userId = this.AuthService.userIdExists();
     if (userId === 0) {
      this.userId = 0;
     }

    if (!this.posts) {
      this.isLoadingPosts = true;
    }
    this.pendingActionService.pauseReplay();

    this.MasterService.getAllPosts(this.userId).subscribe({
      next: (posts: GetAllPostsDTO[]) => {
        this.posts = posts;
        this.isLoadingPosts = false;
        this.categoryFilterService.updateCounts(this.posts);
        console.log('Posts fetched:', this.posts);
        this.pendingActionService.resumeReplay();
      },
      error: (err) => {
        this.isLoadingPosts = false;
        console.error('Error fetching posts:', err);
        this.pendingActionService.resumeReplay();
      }
    });
  }

  timeAgo(date: Date | string): string {
    const inputDate = new Date(date);
    const now = new Date();
    const seconds = Math.floor((+now - +inputDate) / 1000);
    if (seconds < 10) return 'Just now';
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      // Show full date with year
      return inputDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1 || Math.floor(seconds / 86400) > 6) {
      // Show short date without year (for < 1 year but older than 6 days)
      return inputDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      });
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1)
      return `${interval} minute${interval > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }


  getPostReactionCount(postId: number) {
    this.MasterService.getPostReactionsCount(postId).subscribe(
      (response : GetPostReactionsCount) => {
        console.log('Post reactions count:', response);
        // this.postReactionsCount = response;
        return response;
      },
      (error) => {
        console.error('Error fetching post reactions count:', error);
        this.snackBarService.showError('Error fetching post reactions count');
      }
    );
  }

  reactionButton: boolean = false;
  // Function to handle post reaction
  addPostReaction(isLike: boolean | null, post: GetAllPostsDTO) {
    if (!this.AuthService.isLoggedIn()) {
      if (isLike !== null) {
        this.pendingActionService.setPendingAction({ type: 'LIKE_POST', postId: post.postId, isLike });
      }
      return;
    }
    if (isLike === null) {
      this.snackBarService.showError('Please select a reaction');
      return;
    }
    
    const userId = this.AuthService.userIdExists();

    // 1. Backup original states for potential rollback
    const originalReaction = post.isReactedByMe;
    const originalLikes = post.likeCount;
    const originalDislikes = post.dislikeCount;

    // 2. Optimistic State Updates
    if (isLike) {
      if (post.isReactedByMe === true) {
        // Undo like
        post.isReactedByMe = null;
        post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
      } else {
        if (post.isReactedByMe === false) {
          // Switch from dislike to like
          post.dislikeCount = Math.max(0, (post.dislikeCount || 0) - 1);
        }
        post.isReactedByMe = true;
        post.likeCount = (post.likeCount || 0) + 1;
      }
    } else {
      if (post.isReactedByMe === false) {
        // Undo dislike
        post.isReactedByMe = null;
        post.dislikeCount = Math.max(0, (post.dislikeCount || 0) - 1);
      } else {
        if (post.isReactedByMe === true) {
          // Switch from like to dislike
          post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
        }
        post.isReactedByMe = false;
        post.dislikeCount = (post.dislikeCount || 0) + 1;
      }
    }

    const postReaction: PostReactionsDTO = {
      postId: post.postId,
      userId: userId,
      isLike: isLike,
    };

    // 3. Silent API Dispatch
    this.MasterService.addPostReaction(postReaction).subscribe({
      next: () => {
        // Dispatch interaction notification to post author if newly reacted
        if (post.isReactedByMe !== null) {
          const currentUserName = this.AuthService.getUserName();
          this.notificationService.notifyPostReaction(post.userId, currentUserName, post.title, isLike, post.postId);
        }
      },
      error: () => {
        // Rollback states on sync failure
        post.isReactedByMe = originalReaction;
        post.likeCount = originalLikes;
        post.dislikeCount = originalDislikes;
        this.snackBarService.showError('Sync failed. Please try again.');
      }
    });
  }

  hidePost(post: GetAllPostsDTO) {
    if (!this.AuthService.isLoggedIn()) {
      this.pendingActionService.setPendingAction({ type: 'HIDE_POST', postId: post.postId });
      return;
    }
    this.MasterService.hidePost(this.userId, post.postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.postId !== post.postId);
        this.snackBarService.showSuccess('Post hidden');
      },
      error: () => {
        this.snackBarService.showError('Failed to hide post');
      }
    });
  }

  toggleSavePost(post: GetAllPostsDTO) {
    if (!this.AuthService.isLoggedIn()) {
      this.pendingActionService.setPendingAction({ type: 'SAVE_POST', postId: post.postId });
      return;
    }
    if (post.isSavedByMe) {
      this.MasterService.unsavePost(this.userId, post.postId).subscribe({
        next: () => {
          post.isSavedByMe = false;
          this.snackBarService.showSuccess('Post unsaved');
        },
        error: () => this.snackBarService.showError('Failed to unsave post')
      });
    } else {
      this.MasterService.savePost(this.userId, post.postId).subscribe({
        next: () => {
          post.isSavedByMe = true;
          this.snackBarService.showSuccess('Post saved');
        },
        error: () => this.snackBarService.showError('Failed to save post')
      });
    }
  }

  shareLink: string = '';
  openShareModal(postId: number) {
    this.shareLink = window.location.origin + '/post/' + postId;
  }

  copyShareLink(inputElement: HTMLInputElement) {
    inputElement.select();
    document.execCommand('copy');
    this.snackBarService.showSuccess('Link copied to clipboard!');
  }

   selectedPostImage: string | null = null;
  openFullImageModal(image: string | null = null) {
    this.selectedPostImage = image;
  }

  closeFullImageModal() {
    // debugger;
    this.selectedPostImage = null;
  }


  deletePostImage() {
    // if (this.updateDraftButton) {
    //   this.masterService
    //     .deletePostImage(this.draftedPost.userId, this.draftedPost.postId)
    //     .subscribe(
    //       (next) => {
    //         this.postForm.patchValue({
    //           image: null,
    //         });
    //         this.snackBar.showSuccess(
    //           'Drafted post image deleted successfully'
    //         );
    //       },
    //       (error) => {
    //         this.snackBar.showError('Error deleting drafted post image');
    //       }
    //     );
    // }
    // this.previewUrl = null;
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  addPollOption() {
    if (this.pollOptions.length < 10) {
      this.pollOptions.push('');
    } else {
      this.snackBarService.showError('Maximum 10 options allowed.');
    }
  }

  removePollOption(index: number) {
    if (this.pollOptions.length > 2) {
      this.pollOptions.splice(index, 1);
    }
  }

  submitPoll() {
    if (!this.AuthService.isLoggedIn()) {
      this.pendingActionService.setPendingAction({ type: 'NAVIGATE', targetUrl: '/home' });
      return;
    }
    if (!this.pollQuestion.trim()) {
      this.snackBarService.showError('Please enter a poll question.');
      return;
    }
    const validOptions = this.pollOptions.filter(o => o.trim() !== '');
    if (validOptions.length < 2) {
      this.snackBarService.showError('Please provide at least 2 options.');
      return;
    }

    this.isSubmittingPoll = true;
    const payload: CreatePollDTO = {
      title: this.pollQuestion,
      categoryId: this.selectedPollCategory,
      options: validOptions,
      userId: this.userId,
      expiresAt: this.pollExpiresAt ? new Date(this.pollExpiresAt) : null,
      allowUserOptions: this.pollAllowUserOptions,
      isMultipleChoice: this.pollIsMultipleChoice,
      allowVoteEdit: this.pollAllowVoteEdit,
      showResultsBeforeVoting: this.pollShowResultsBeforeVoting
    };

    this.MasterService.createPoll(payload).subscribe({
      next: (res) => {
        this.snackBarService.showSuccess('Poll created successfully!');
        this.isSubmittingPoll = false;
        
        // Reset form
        this.pollQuestion = '';
        this.pollOptions = ['', ''];
        this.pollExpiresAt = '';
        this.pollAllowUserOptions = false;
        this.pollIsMultipleChoice = false;
        this.pollAllowVoteEdit = false;
        this.pollShowResultsBeforeVoting = false;
        
        // Close modal
        document.getElementById('closePollModalBtn')?.click();
        
        // Refresh feed
        this.getAllPosts();
      },
      error: (err) => {
        this.snackBarService.showError('Failed to create poll');
        this.isSubmittingPoll = false;
      }
    });
  }

  toggleFollow(post: GetAllPostsDTO) {
    if (!this.AuthService.isLoggedIn()) {
      this.pendingActionService.setPendingAction({ type: 'FOLLOW_USER', targetUserId: post.userId });
      return;
    }
    
    if (post.isFollowingAuthor) {
      // Unfollow
      this.MasterService.unfollowUser(post.userId).subscribe({
        next: () => {
          post.isFollowingAuthor = false;
          // Broadcast update so other components update
          const bc = new BroadcastChannel('fitmind_community_notifications');
          bc.postMessage({ type: 'FOLLOW_UPDATE', targetUserId: post.userId, isFollowing: false });
          bc.close();
        },
        error: () => this.snackBarService.showError('Failed to unfollow user')
      });
    } else {
      // Follow
      this.MasterService.followUser(post.userId).subscribe({
        next: () => {
          post.isFollowingAuthor = true;
          // Broadcast update
          const bc = new BroadcastChannel('fitmind_community_notifications');
          bc.postMessage({ type: 'FOLLOW_UPDATE', targetUserId: post.userId, isFollowing: true });
          bc.close();
        },
        error: () => this.snackBarService.showError('Failed to follow user')
      });
    }
  }
}

