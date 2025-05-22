import { Component, OnInit, OnDestroy } from '@angular/core';
import { CoreService } from '../core.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit, OnDestroy {
  userName: string = '';
  visibale: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private _service: CoreService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Subscribe to userName changes
    this.subscription.add(
      this._service.userName$.subscribe(value => {
        this.userName = value;
      })
    );

    // Get initial userName
    this._service.getUserName().subscribe({
      error: (error) => {
        console.error('Error getting user name:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout() { 
    this._service.logout().subscribe({
      next: () => {
        this.userName = '';
        this.visibale = false; // Close dropdown
        this.toastr.success('Logged out successfully', 'SUCCESS');
        this.router.navigateByUrl('/');
      },
      error: (error) => {
        console.error('Error during logout:', error);
        this.toastr.error('Error during logout', 'ERROR');
        // Still clear the username and redirect even if there's an error
        this.userName = '';
        this.visibale = false; // Close dropdown
        this.router.navigateByUrl('/');
      }
    });
  }

  ToggleDropDown() {
    this.visibale = !this.visibale;
  }
}
