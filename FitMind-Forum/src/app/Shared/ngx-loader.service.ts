import { Injectable } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Injectable({
  providedIn: 'root'
})
export class NgxLoaderService {
  constructor(private ngxService: NgxUiLoaderService) {}

  startLoading() {
    this.ngxService.start();  // Start the loader without auto-stop timer
  }

  stopLoading() {
    this.ngxService.stop();  // Stop the loader explicitly once the work is done
  }
 
}
