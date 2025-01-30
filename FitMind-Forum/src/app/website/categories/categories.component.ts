import { MasterService } from '../../Shared/master.service';

import { ICategories } from './../../Model/categories';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { NgModule } from '@angular/core';

@Component({
  selector: 'app-categories',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  constructor() {

   }

  ngOnInit() {
    this.getAllCategories();
  }

  service = inject(MasterService);
  categories: ICategories[] = [];
  errorMessage: string = '';

  getAllCategories() {
    this.service.getAllCategories().subscribe(
      (data: any) => {
        this.categories = data;

      },(error)=>{
        console.error('Error: ', error);

        this.errorMessage = error;
      }
    );
  }

}
