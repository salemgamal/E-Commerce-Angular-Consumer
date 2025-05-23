import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  email: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Any initialization logic can go here
  }

  onSubscribe(): void {
    if (this.email && this.validateEmail(this.email)) {
      // Here you would typically call a service to handle newsletter subscription
      console.log('Newsletter subscription for:', this.email);
      this.email = '';
      // Add success notification logic here
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  navigateToShop(category?: string): void {
    if (category) {
      this.router.navigate(['/shop'], { queryParams: { category } });
    } else {
      this.router.navigate(['/shop']);
    }
  }
} 