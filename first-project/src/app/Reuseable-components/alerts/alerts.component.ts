import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-alerts',
  imports: [],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent {
  @Input() message: string = '';
}
