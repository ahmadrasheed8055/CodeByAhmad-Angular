import { Component, OnInit, NgModule, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MasterService } from "./../../../Shared/master.service";
// import { BrowserModule } from "@angular/platform-browser";

@Component({
  selector: "app-emailVarification",
  standalone: true,
  imports: [FormsModule,CommonModule],

  templateUrl: "./emailVarification.component.html",
  styleUrls: ["./emailVarification.component.css"],
})
export class EmailVarificationComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
  loginModal: string = "#loginModal";

  email: string = '';
  
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;


  service = inject(MasterService);

  test(){
    debugger;
    alert('clicked');
  }

  sendEmail() {
    // debugger;
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null; 
  
    // Trim email input
    if (!this.email || this.email.trim() === '') {
      this.errorMessage = "Please enter a valid email address.";
      this.loading = false;
      return;
    }
  
    this.service.sendRegistrationEmail(this.email.trim()).subscribe(
     responce =>{
      this.successMessage = "Email sent successfully.";
      this.loading = false;
     },error => {
      this.errorMessage = "An error occurred while sending email. Please try again later.";
      this.loading = false;
     }
     
    );
  }

  clearSuccessMessage(){
    this.successMessage = null;
    
  }

}
