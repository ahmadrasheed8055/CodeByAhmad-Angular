import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-structural-directive',
  imports: [CommonModule, FormsModule],
  templateUrl: './structural-directive.component.html',
  styleUrl: './structural-directive.component.css'
})
export class StructuralDirectiveComponent {




  IsDiv1: boolean = true;
  IsDiv2: boolean = true;
  IsDiv3: boolean = true;
  IsDiv4: boolean = true;

  selected:string = "";

  num1: number = 0;
  num2: number = 0;

  students: any[] = [
    {id:1, name : 'ahmad1', color:'red', totalMarks: 50},
    {id:4, name : 'ahmad2', color:'green', totalMarks: 90},
    {id:2, name : 'ahmad3', color:'purple', totalMarks: 77},
    {id:3, name : 'ahmad4', color:'orange', totalMarks: 69},
    
  ];

  div1Color: string =  '';

  
  red(){
    this.div1Color = 'bg-danger';
  }

  blue(){
    this.div1Color = 'bg-primary';
  }


  showDiv1() {
    this.IsDiv1 = true;
  }
  
  hideDiv1() {
    this.IsDiv1 = false;
  }

  toggleDiv2() {

    this.IsDiv2 =!this.IsDiv2;

    // if (this.IsDiv2 == true) {
    //   this.IsDiv2 = false;
    // } else {
    //   this.IsDiv2 = true;
    // }
  }

 

}
