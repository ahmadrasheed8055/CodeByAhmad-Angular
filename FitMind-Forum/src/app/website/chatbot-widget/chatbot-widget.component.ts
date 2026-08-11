import { Component, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../Shared/chatbot.service';
import { MarkdownPipe } from '../../Shared/markdown.pipe';
import { AuthService } from '../../Shared/auth.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.css'
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  isOpen: boolean = false;
  isExpanded: boolean = true;
  isTyping: boolean = false;
  userMessage: string = '';
  hasUnread: boolean = true;
  showInfoNotice: boolean = false;
  private shouldScrollToBottom: boolean = false;
  
  selectedFile: { base64: string, mimeType: string, previewUrl: string, fileName: string } | null = null;

  private authService = inject(AuthService);
  private chatbotService = inject(ChatbotService);

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get guestPromptCount(): number {
    if (this.isLoggedIn) return 0;
    const count = sessionStorage.getItem('fitmind_guest_prompts');
    return count ? parseInt(count, 10) : 0;
  }

  get guestPromptsRemaining(): number {
    return Math.max(0, 2 - this.guestPromptCount);
  }

  get isLocked(): boolean {
    return !this.isLoggedIn && this.guestPromptCount >= 2;
  }

  toggleInfoNotice() {
    this.showInfoNotice = !this.showInfoNotice;
  }

  messages: ChatMessage[] = [
    {
      id: '1',
      sender: 'bot',
      text: "👋 Hi there! I'm your FitMind AI Assistant. How can I help you with your fitness goals or community questions today?",
      timestamp: new Date()
    }
  ];

  quickPrompts: string[] = [
    '🏋️ Workout Advice',
    '🥗 Diet & Nutrition',
    '❓ How to create a Poll?',
    '💡 Community Guidelines'
  ];

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.hasUnread = false;
      this.shouldScrollToBottom = true;
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.shouldScrollToBottom = true;
  }

  closeChat() {
    this.isOpen = false;
  }

  onFileSelected(event: Event) {
    if (!this.isLoggedIn) return; // Disable file selection for guests

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const dataUrl = reader.result as string;
        const parts = dataUrl.split(';base64,');
        const mimeType = parts[0].replace('data:', '');
        const base64 = parts[1];

        this.selectedFile = {
          base64: base64,
          mimeType: mimeType,
          previewUrl: mimeType.startsWith('image/') ? dataUrl : '',
          fileName: file.name
        };
      };

      reader.readAsDataURL(file);
      // Reset input value so same file can be selected again
      input.value = '';
    }
  }

  removeSelectedFile() {
    this.selectedFile = null;
  }

  sendQuickPrompt(promptText: string) {
    if (this.isLocked) return;
    this.userMessage = promptText;
    this.sendMessage();
  }

  sendMessage() {
    if (this.isLocked) return;
    const text = this.userMessage.trim();
    if (!text && !this.selectedFile) return;

    // Increment guest prompt counter if user is not logged in
    if (!this.isLoggedIn) {
      const nextCount = this.guestPromptCount + 1;
      sessionStorage.setItem('fitmind_guest_prompts', nextCount.toString());
    }

    const fileBase64 = this.isLoggedIn ? this.selectedFile?.base64 : undefined;
    const fileMimeType = this.isLoggedIn ? this.selectedFile?.mimeType : undefined;
    const filePreview = this.isLoggedIn ? this.selectedFile?.previewUrl : undefined;
    const fileName = this.isLoggedIn ? this.selectedFile?.fileName : undefined;

    // Add user message
    this.messages.push({
      id: Date.now().toString(),
      sender: 'user',
      text: text || (fileName ? `[Attached: ${fileName}]` : ''),
      timestamp: new Date(),
      imagePreview: filePreview
    });

    this.userMessage = '';
    this.selectedFile = null;
    this.isTyping = true;
    this.shouldScrollToBottom = true;
    
    // Copy history excluding the latest message we just added
    const history = [...this.messages];
    history.pop();

    this.chatbotService.askChatbot(text, history, fileBase64, fileMimeType).subscribe({
      next: (res) => {
        this.isTyping = false;
        this.messages.push({
          id: Date.now().toString(),
          sender: 'bot',
          text: res.response,
          timestamp: new Date()
        });
        this.shouldScrollToBottom = true;
      },
      error: (err) => {
        this.isTyping = false;
        this.messages.push({
          id: Date.now().toString(),
          sender: 'bot',
          text: 'Oops! I am having trouble connecting to the server. Please try again later.',
          timestamp: new Date()
        });
        this.shouldScrollToBottom = true;
      }
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
