import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { AddEmployeeComponent } from './Components/add-employee/add-employee.component';
import { DataBindingComponent } from './Components/data-binding/data-binding.component';

import { StructuralDirectiveComponent } from './Components/directives/structural-directive/structural-directive.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AlertsComponent } from './Reuseable-components/alerts/alerts.component';


@Component({
  selector: 'app-root',
  standalone: true,

  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'first-project';
}
