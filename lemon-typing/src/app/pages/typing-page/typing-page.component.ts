import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { generate, count } from "random-words";

@Component({
  selector: 'app-typing-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './typing-page.component.html',
  styleUrl: './typing-page.component.css'
})
export class TypingPageComponent {




  randomWords: any = '';

  //timer logic
  timer: number = 0;
  interval: any;


  startTimer(n: number): void {
    this.timer = n;
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  resetTimer(): void {
    clearInterval(this.interval);
    this.timer = 0;
  }

  ngOnInit(): void {


  }

  start: boolean = false;
  // array that stores random paragraphs
  wordsArray: string[] = [];
  //array that connected with input field
  userInputArray: string[] = [];

  startTyping(): void {
    this.button20(20);

    this.randomWords = generate({ exactly: 20 });
    this.wordsArray = this.randomWords;
    // this.wordsArray.forEach((word: string) => {
    //   console.log(word);
    // });

    console.log(this.randomWords);
    this.start = true;

  }
  
  stopTyping(): void {
    this.start = false;
  }

  changeParagraph(n: number) {
    this.startTimer(n);
    this.randomWords = '';
    this.randomWords = generate({ exactly: n });
    this.wordsArray = this.randomWords;
  }


  defaultWords: number = 20;
  button20(n: number) {
    this.defaultWords = n;
    this.startTimer(n);
    this.changeParagraph(n);
  }

  button60(n: number) {
    this.defaultWords = n;
    this.startTimer(n);
    this.changeParagraph(n);

  }

  button120(n: number) {
    this.defaultWords = n;
    this.startTimer(n);

    this.changeParagraph(n);
  }

  mistakes:number = 0;





}
