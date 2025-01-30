import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductSService } from '../../../services/product-services/product-s.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styles: ``
})
export class ProductsComponent implements OnInit {
  constructor(private snackBar: MatSnackBar) { }

  showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showErrorMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });

  }

  addProductObj: any =
    {
      "productId": 0,
      "productSku": "",
      "productName": "",
      "productPrice": 0,
      "productShortName": "",
      "productDescription": "",
      "createdDate": new Date(),
      "deliveryTimeSpan": "",
      "categoryId": 0,
      "productImageUrl": "",
      "userId": 0
    };

  productService = inject(ProductSService);

  showAddProduct: boolean = true;

  addProductButton() {
    this.showAddProduct = true;
  }

  closeForm() {
    this.showAddProduct = false;
  }

  //accessing data

  ngOnInit()  {
    this.getCategories();
    this.getProducts();
  }

  categories: any[] = [];
  allProducts: any[] = [];

  getCategories() {
    this.productService.getAllCategories().subscribe((result: any) => {
      this.categories = result.data;
    });
  }
  getProducts(){
    this.productService.getAllProducts().subscribe((result: any) => {
      this.allProducts = result.data;
    });
  }



  resetForm() {
    this.addProductObj = {
      "productId": 0,
      "productSku": "",
      "productName": "",
      "productPrice": 0,
      "productShortName": "",
      "productDescription": "",
      "createdDate": new Date(),
      "deliveryTimeSpan": "",
      "categoryId": 0,
      "productImageUrl": "",
     
    };
  }

  saveProduct() {
    this.productService.createProduct(this.addProductObj).subscribe((result: any) => {
      debugger;
      if (result.result) {
        // this.getProducts();
        this.resetForm();        
        this.showSuccessMessage("Product added successfully");
      }else{
        this.showErrorMessage("Error:" + result.message);
      }
    });
  }

  editProduct(obj:any){
    this.showAddProduct = true;
    this.addProductObj = obj;

    this.productService.editProduct(obj).subscribe((result: any) =>{
      if(result.result){
        this.showSuccessMessage("Product updated successfully");
      }else{
        this.showErrorMessage("Error:" + result.message);
      }
    });
  }

  onEdit(){

  }

  deleteProduct(obj:any){
    this.productService.deleteProduct(obj.productId).subscribe((result: any) =>{
      if(result.result){
        this.showSuccessMessage("Product deleted successfully");
      }else{
        this.showErrorMessage("Error:" + result.message);
      }
    });
  }


}
