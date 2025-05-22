import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IProduct } from './shared/Models/Product';
import { IPagnation } from './shared/Models/Pagnation';
import { LoadingService } from './core/Services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    // Reset loading state on app initialization
    this.loadingService.resetLoadingState();
  }
  title = 'client';
}
