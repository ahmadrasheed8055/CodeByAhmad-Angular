import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css',
})
export class ErrorComponent implements OnInit {
  constructor(private router: ActivatedRoute, private route:Router) {}
  status: number = 0;
  message:string = '' ;

  ngOnInit(): void {
    this.router.queryParams.subscribe((params  ) => {
      this.status = params['status'];
      this.message = params['message'];
    });
  }

  goHome(){
    this.route.navigate(['/home']);
  }

}
