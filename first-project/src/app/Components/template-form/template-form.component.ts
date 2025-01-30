import { CommonModule, JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-template-form',
  standalone: true,
  imports: [FormsModule, JsonPipe, CommonModule],
  templateUrl: './template-form.component.html',
  styleUrl: './template-form.component.css'
})
export class TemplateFormComponent {
  user: any = {
    firstName: '',
    lastName: '',
    city: '',
    zip: '',
    check: false
  }
  userData: any = {};
  onSubmit() {
    debugger;
    this.userData = this.user;
  }
}
