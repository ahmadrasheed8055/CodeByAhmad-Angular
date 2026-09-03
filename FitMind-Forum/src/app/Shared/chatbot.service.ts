import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  imagePreview?: string;
  isError?: boolean;
  detectedIntent?: string;
  intentDisplayName?: string;
  confidenceScore?: number;
  isSafetyAlert?: boolean;
  safetyWarning?: string;
}

export interface ChatHistory {
  role: string;
  content: string;
}

export interface ChatRequestDTO {
  message: string;
  history: ChatHistory[];
  imageBase64?: string;
  imageMimeType?: string;
  categoryId?: number;
  categoryName?: string;
}

export interface ChatResponseDTO {
  response: string;
  detectedIntent?: string;
  intentDisplayName?: string;
  confidenceScore?: number;
  isSafetyAlert?: boolean;
  safetyWarning?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5177/api/Chatbot/ask';

  private toggleChatSubject = new Subject<boolean | void>();
  toggleChat$ = this.toggleChatSubject.asObservable();

  openChat() {
    this.toggleChatSubject.next(true);
  }

  toggleChat() {
    this.toggleChatSubject.next();
  }

  askChatbot(
    message: string, 
    history: ChatMessage[], 
    imageBase64?: string, 
    imageMimeType?: string, 
    categoryId?: number, 
    categoryName?: string
  ): Observable<ChatResponseDTO> {
    // Exclude welcome greeting (id === '1'), error messages, and empty messages
    const validHistory = history
      .filter(h => h.id !== '1' && !h.isError && h.text && h.text.trim() !== '')
      .slice(-6); // Keep last 6 valid messages (max 3 turns) to prevent token bloat & 503 timeouts

    // Strictly enforce alternating user -> model conversational sequence required by Gemini API
    const formattedHistory: ChatHistory[] = [];
    let expectedRole: 'user' | 'model' = 'user';

    for (const msg of validHistory) {
      const role = msg.sender === 'bot' ? 'model' : 'user';
      if (role === expectedRole) {
        formattedHistory.push({ role, content: msg.text.trim() });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }

    // History must end with 'model' so the new prompt appended on backend is 'user'
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
      formattedHistory.pop();
    }

    const request: ChatRequestDTO = {
      message: message.trim(),
      history: formattedHistory,
      imageBase64: imageBase64,
      imageMimeType: imageMimeType,
      categoryId: categoryId,
      categoryName: categoryName
    };

    return this.http.post<ChatResponseDTO>(this.apiUrl, request);
  }
}
