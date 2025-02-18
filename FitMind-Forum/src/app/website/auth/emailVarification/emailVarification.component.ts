import { Component, OnInit, NgModule, inject, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MasterService } from "./../../../Shared/master.service";
// import { BrowserModule } from "@angular/platform-browser";

@Component({
  selector: "app-emailVarification",
  standalone: true,
  imports: [FormsModule, CommonModule],

  templateUrl: "./emailVarification.component.html",
  styleUrls: ["./emailVarification.component.css"],
})
export class EmailVarificationComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
  loginModal: string = "#loginModal";

  email: string = "";

  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  emailSentingFormButton: string = "Send Email";
  countDown: number = 0;
  emailPattern: string = "^[a-zA-Z0-9._%+-]+@gmail\.com$";

  service = inject(MasterService);

  // test() {
  //   debugger;
  //   alert("clicked");
  // }

  sendEmail() {
    // debugger;
    this.loading = true;
    this.emailSentingFormButton = "Sending...";
    this.errorMessage = null;
    this.successMessage = null;

    const regex = new RegExp(this.emailPattern);

    // Trim email input
    if (!this.email || this.email.trim() === "" || regex.test(this.email.trim()) == false) {
      this.errorMessage = "Please enter a valid email address.";
      this.loading = false;
      this.emailSentingFormButton = "Send email";

      return;
    }

    this.service.sendRegistrationEmail(this.email.trim()).subscribe(
      (responce) => {
        // this.loading = false;
        //count down functionality
        this.countDownTimer();
        this.successMessage = "Email sent successfully.";
      },
      (error) => {
        this.errorMessage =
          "An error occurred while sending email. Please try again later.";
        this.loading = false;
        this.emailSentingFormButton = "Send email";
      }
    );
  }

  countDownTimer() {
    this.countDown = 10;
    let interval = setInterval(() => {
      this.countDown--;

      if (this.countDown > 0) {
        this.emailSentingFormButton = "Resend email in " + this.countDown + "s";
      } else {
        clearInterval(interval); // Stop the countdown
        this.emailSentingFormButton = "Resend email";
        this.loading = false;
      }
    }, 1000);
    // this.loading = false;
  }

  onInputClear(value: string) {
    if (!this.email) {
      this.errorMessage = null;
      this.successMessage = null;
      this.emailSentingFormButton = "Send Email";
      this.countDown = 0;
    }
  }

 
}
