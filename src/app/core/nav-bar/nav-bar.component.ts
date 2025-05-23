import { Component, OnInit, OnDestroy } from '@angular/core';
import { CoreService } from '../core.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

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
    private toastr: ToastrService,
    private location: Location
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
        
        // Navigate to home page and force a full page refresh
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          window.location.reload();
        });
      },
      error: (error) => {
        console.error('Error during logout:', error);
        this.toastr.error('Error during logout', 'ERROR');
        // Still clear the username and refresh even if there's an error
        this.userName = '';
        this.visibale = false; // Close dropdown
        window.location.reload();
      }
    });
  }

  ToggleDropDown() {
    this.visibale = !this.visibale;
  }
}
