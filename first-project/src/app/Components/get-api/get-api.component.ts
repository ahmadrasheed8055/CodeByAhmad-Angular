import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { AlertsComponent } from '../../Reuseable-components/alerts/alerts.component';

@Component({
  selector: 'app-get-api',
  imports: [AlertsComponent],
  templateUrl: './get-api.component.html',
  styleUrl: './get-api.component.css'
})

export class GetApiComponent {
  constructor(private http:HttpClient){

  }

  allData: any[] = [];

  getAllData(){
    this.http.get('https://jsonplaceholder.typicode.com/todos/').subscribe((result:any)=>{
      this.allData = result;
      // console.log(this.allData);
    });
  }


}
