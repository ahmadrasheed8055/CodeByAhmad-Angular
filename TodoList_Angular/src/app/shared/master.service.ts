import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IApiResponse, Task } from '../model/tasks';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  constructor( private http: HttpClient) { }

    API_URL = 'https://freeapi.miniprojectideas.com/api/JWT/';
    GET_ALL_TODOS_URL = 'GetAllTaskList';
    ADD_TASK_LIST_URL = 'CreateNewTask';
    EDIT_TASK_LIST_URL = 'UpdateTask';
    DELETE_TASK_LIST_URL = 'DeleteTask?itemId=';

    getAllTodos() : Observable<IApiResponse>{
      return this.http.get<IApiResponse>(this.API_URL + this.GET_ALL_TODOS_URL);
    }

    addTask(task: Task) : Observable<IApiResponse>{
      return this.http.post<IApiResponse>(this.API_URL + this.ADD_TASK_LIST_URL, task);
    }

    editTask(task: Task) : Observable<IApiResponse>{
      return this.http.put<IApiResponse>(this.API_URL + this.EDIT_TASK_LIST_URL, task);
    }

    deleteTask(taskId: number) : Observable<IApiResponse>{
      return this.http.delete<IApiResponse>(this.API_URL + this.DELETE_TASK_LIST_URL  + taskId);
    }
}
