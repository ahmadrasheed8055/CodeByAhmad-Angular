import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MasterService } from '../../../Shared/master.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }
 
  services = inject(MasterService);
  message: string = '';
  ngOnInit() {
    this.route.queryParams.subscribe((p)=>{
      this.message = p['message'];
    })
  }

  loginModal:string = '#loginModal';


    
} 
