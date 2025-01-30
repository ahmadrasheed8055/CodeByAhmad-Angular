import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DepartmentServiceService } from '../../services/department.service.service';
import { AlertsComponent } from '../../Reuseable-components/alerts/alerts.component';

@Component({
  selector: 'app-post-api',
  imports: [FormsModule,AlertsComponent],
  standalone: true,
  templateUrl: './post-api.component.html',
  styleUrl: './post-api.component.css'
})
export class PostApiComponent {

  constructor(private departmentService: DepartmentServiceService) {

  }

  http = inject(HttpClient);

  departmentObject: any = {
    "departmentId": 0,
    "departmentName": "",
    "departmentLogo": ""
  };


  deleteData(id: number) {
    this.http.delete('https://projectapi.gerasim.in/api/Complaint/DeletedepartmentBydepartmentId?departmentId=' + id).subscribe((result: any) => {
      if (result.result) {
        alert('Data Deleted successfully');
        this.getAllData();
      } else {
        alert(result.message);
      }
    })
  }





  updateData(dObject: any) {
    this.departmentObject = dObject;
  }

  onUpdate() {
    this.http.post('https://projectapi.gerasim.in/api/Complaint/UpdateDepartment', this.departmentObject).subscribe((result: any) => {
      if (result.result) {
        alert('Data updated successfully');
        this.getAllData();
      } else {
        alert(result.message);
      }
    })
  }


  saveData() {
    debugger;
    this.departmentService.save(this.departmentObject).subscribe((result: any) => {
      if (result.result) {
        alert('Data saved successfully');
      } else {
        alert(result.message);
      }
    })
  }

  allData: any[] = [];
  loader: boolean = true;

  getAllData() {

    this.departmentService.allData().subscribe((result: any) => {
      this.allData = result.data;
      this.loader = false;
    });
    
  }

  ngOnInit() {
    this.getAllData();
  }





}
