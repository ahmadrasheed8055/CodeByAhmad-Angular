import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '../constants/constant';

@Injectable({
  providedIn: 'root'
})
export class ProductSService {

  constructor( private http: HttpClient) {  }
 
  getAllCategories() {
    return this.http.get(Constants.API_ENDPOINT + Constants.METHODS.GET_ALL_CATEGORIES);
  }
  getAllProducts() {
    return this.http.get(Constants.API_ENDPOINT + Constants.METHODS.GET_ALL_PRODUCTS);
  }

  createProduct(productObj: any){
    debugger;
    return this.http.post(Constants.API_ENDPOINT + Constants.METHODS.CREATE_PRODUCT, productObj);
  }

  editProduct(productObj: any){
    return this.http.put(Constants.API_ENDPOINT + Constants.METHODS.EDIT_PRODUCT, productObj);
  }

  deleteProduct(productId: any){
    return this.http.delete(Constants.API_ENDPOINT + Constants.METHODS.DELETE_PRODUCT + productId);
  }
   
}
