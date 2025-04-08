import { Injectable } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Injectable({
  providedIn: 'root'
})
export class NgxLoaderService {
  constructor(private ngxService: NgxUiLoaderService) {}

  startLoading() {
    this.ngxService.start();  // Start the loader
    setTimeout(() => this.ngxService.stop(), 1000);  // Stop after 2 seconds
  }
 
}
