import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reactive-form',
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './reactive-form.component.html',
  styleUrl: './reactive-form.component.css'
})
export class ReactiveFormComponent {

  // first step is used to create form group of component
  students: FormGroup = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    city: new FormControl(),
    zip: new FormControl(),
    check: new FormControl()
  });

  studentData: any = {};

  submit(){
    this.studentData = this.students.value;
  }

}
