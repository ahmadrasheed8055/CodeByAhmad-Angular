import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  imagePreview?: string;
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
}

export interface ChatResponseDTO {
  response: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5177/api/Chatbot/ask';

  askChatbot(message: string, history: ChatMessage[], imageBase64?: string, imageMimeType?: string): Observable<ChatResponseDTO> {
    const formattedHistory: ChatHistory[] = history
      .filter(h => h.text.trim() !== '') // Ensure no empty messages
      .map(h => ({
        role: h.sender === 'bot' ? 'model' : 'user',
        content: h.text
      }));

    const request: ChatRequestDTO = {
      message: message,
      history: formattedHistory,
      imageBase64: imageBase64,
      imageMimeType: imageMimeType
    };

    return this.http.post<ChatResponseDTO>(this.apiUrl, request);
  }
}
