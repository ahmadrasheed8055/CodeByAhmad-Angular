import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../Shared/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {
  authService = inject(AuthService);

  constructor() { }

  ngOnInit() {
  }

}
