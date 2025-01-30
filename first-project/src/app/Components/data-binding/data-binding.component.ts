import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-binding',
  imports: [FormsModule],
  templateUrl: './data-binding.component.html',
  styleUrl: './data-binding.component.css'
})
export class DataBindingComponent {
  Name: string = "Ahmad";
  RollNumber: number = 66;
  Pakistani: boolean = false;

  showName() {
    alert(this.Name);
  }

  showRollNumber() {
    alert(this.RollNumber);
  }

  showPakistani() {
    if (this.Pakistani == true) {

      alert("Pakistani is enabled");

    } else {

      alert("Pakistani is disabled");

    }
  }
}
