import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IdentityService } from '../identity.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  fromGroup: FormGroup;
  isSubmitting = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private _service: IdentityService,
    private toast: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formValidation();
  }

  formValidation() {
    this.fromGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]]
    });
  }

  get _email() { return this.fromGroup.get('email'); }
  get _password() { return this.fromGroup.get('password'); }
  get _firstName() { return this.fromGroup.get('firstName'); }
  get _lastName() { return this.fromGroup.get('lastName'); }
  get _address() { return this.fromGroup.get('address'); }
  get _city() { return this.fromGroup.get('city'); }
  get _country() { return this.fromGroup.get('country'); }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  Submit() {
    if (this.fromGroup.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      console.log('Form data:', this.fromGroup.value);

      this._service.register(this.fromGroup.value).subscribe({
        next: (response: any) => {
          console.log('Registration successful:', response);
          this.toast.success('Registration successful', 'SUCCESS');
          this.router.navigateByUrl('/Account/Login');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Registration error:', error);
          let errorMessage = 'Registration failed';
          
          if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
          } else {
            // Server-side error
            if (error.status === 0) {
              errorMessage = 'Cannot connect to the server. Please check if the API is running.';
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.status === 400) {
              errorMessage = 'Invalid registration data. Please check your input.';
            } else if (error.status === 500) {
              errorMessage = 'Server error occurred. Please try again later.';
            }
          }
          
          this.toast.error(errorMessage, 'ERROR');
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else if (!this.fromGroup.valid) {
      Object.keys(this.fromGroup.controls).forEach(key => {
        const control = this.fromGroup.get(key);
        if (control?.errors) {
          console.log(`${key} validation errors:`, control.errors);
        }
      });
      this.toast.error('Please fill all required fields correctly', 'VALIDATION ERROR');
    }
  }
}
