import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.css'
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  isOpen: boolean = false;
  isTyping: boolean = false;
  userMessage: string = '';
  hasUnread: boolean = true;

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
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.hasUnread = false;
    }
  }

  closeChat() {
    this.isOpen = false;
  }

  sendQuickPrompt(promptText: string) {
    this.userMessage = promptText;
    this.sendMessage();
  }

  sendMessage() {
    const text = this.userMessage.trim();
    if (!text) return;

    // Add user message
    this.messages.push({
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    });

    this.userMessage = '';
    this.isTyping = true;

    // Simulate AI response after short delay
    setTimeout(() => {
      this.isTyping = false;
      this.messages.push({
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: this.getDummyResponse(text),
        timestamp: new Date()
      });
    }, 1200);
  }

  private getDummyResponse(input: string): string {
    const lower = input.toLowerCase();

    if (lower.includes('workout') || lower.includes('exercise')) {
      return "For effective workouts, consistency is key! Make sure to combine strength training with proper recovery and hydration. Check out our Fitness category for member routines! 🏋️‍♂️";
    }
    if (lower.includes('diet') || lower.includes('nutrition') || lower.includes('food')) {
      return "Balanced nutrition fuels your body! Focus on whole foods, lean proteins, complex carbs, and plenty of water to maximize your gains. 🥗";
    }
    if (lower.includes('poll')) {
      return "To create a poll, click on 'Add Post', toggle the 'Create Poll' tab, add your question and options, and customize settings like 'Show Results Before Voting'! 📊";
    }
    if (lower.includes('guideline') || lower.includes('rule')) {
      return "Our community thrives on respect and support! Keep discussions constructive, encourage fellow fitness enthusiasts, and avoid spam or offensive language. 💙";
    }

    return "Thanks for reaching out! I'm currently operating in preview mode. Tomorrow we'll be connecting full AI smarts to answer all your health & fitness queries in real time! ⚡";
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
