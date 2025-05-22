import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private requestCount = 0;

  constructor(private spinnerService: NgxSpinnerService) {}

  loading() {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.spinnerService.show(undefined, {
        bdColor: 'rgba(0, 0, 0, 0.8)',
        size: 'large',
        color: '#fff',
        type: 'square-jelly-box',
        fullScreen: true,
      });
    }
  }

  hideLoader() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.spinnerService.hide();
    }
  }

  // Method to force reset the loading state
  resetLoadingState() {
    this.requestCount = 0;
    this.spinnerService.hide();
  }
}
