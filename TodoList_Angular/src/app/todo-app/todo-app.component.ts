import { ITask } from './../model/tasks';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MasterService } from '../shared/master.service';
import { IApiResponse,  Task } from '../model/tasks';
import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-todo-app',
  standalone: true,
  imports: [FormsModule, CommonModule, DatePipe, MatProgressSpinnerModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './todo-app.component.html',
  styleUrl: './todo-app.component.css'
})
export class TodoAppComponent implements OnInit {

  service = inject(MasterService);
  todoObj: Task = new Task();
  todos: ITask[] = [];


  loader: boolean;
  addTaskForm: boolean;
  welcome: boolean;

  dateFromObj : String;
  formattedDate: String;

  ngOnInit(): void {
    this.getAllTasks();
  }

  constructor() {
    this.loader = true;
    this.welcome = true;
    this.addTaskForm = false;
    this.dateFromObj = '';
    this.formattedDate = '';
  }



  getAllTasks() {
    this.service.getAllTodos().subscribe((data: IApiResponse) => {
      this.todos = data.data;
      this.loader = false;
    });
  }



  addTaskButton() {
    this.addTaskForm = true;
    this.welcome = false;
  }

  addTask() {
    debugger;
    this.service.addTask(this.todoObj).subscribe((data: IApiResponse) => {
      this.getAllTasks();
      // this.addTaskForm = false;
      // this.welcome = true;
      // this.loader = true;
      this.todoObj = new Task();
    });
  }


  onEditTask(task: Task) {
    debugger;
    this.todoObj = task;

    setTimeout(() => {
      const date = new Date(this.todoObj.dueDate);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      const fullDate = date.getFullYear() + '-' + month + '-' + day;

      (<HTMLInputElement>document.getElementById('dueDate')).value = fullDate;
      console.log(fullDate);
    }, 1);


    this.addTaskButton();
  }

  editTask(){
    debugger;
    this.service.editTask(this.todoObj).subscribe((data:any) =>{

      this.getAllTasks();
      this.addTaskForm = false;
      this.welcome = true;
      this.loader = true;
      this.todoObj = new Task();
    });
  }

  deleteTodoTask(taskId: number) {
    debugger;
    this.service.deleteTask(taskId).subscribe((data: any) => {
      this.todoObj = new Task();
      this.getAllTasks();
    });
  }

}

