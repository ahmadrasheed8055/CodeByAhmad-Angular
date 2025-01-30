import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmployeeServiceService {

  constructor(private http: HttpClient) { }

  E_login( obj: any){
    return this.http.post('https://projectapi.gerasim.in/api/Complaint/login', obj);
  }
}
