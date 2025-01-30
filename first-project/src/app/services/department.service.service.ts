import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DepartmentServiceService {

  constructor(private http: HttpClient) { }


  allData(){
    return this.http.get('https://projectapi.gerasim.in/api/Complaint/GetParentDepartment');
  }

  save(obj: any){
   return this.http.post('https://projectapi.gerasim.in/api/Complaint/AddNewDepartment', obj);
  }

  

}
