import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IdentityService } from '../identity.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '../../core/core.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  formGroup: FormGroup;
  emailModel: string = '';
  retrunUrl = '/';
  isSubmitting = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private _service: IdentityService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private coreService: CoreService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.FormValidation();
    const myModal = document.getElementById('exampleModal');
    const myInput = document.getElementById('myInput');

    if (myModal && myInput) {
      myModal.addEventListener('shown.bs.modal', () => {
        myInput.focus();
      });
    }
    
    this.activatedRoute.queryParams.subscribe(param => {
      this.retrunUrl = param["returnUrl"] || '/';
    });

    // Check if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.retrunUrl);
    }
  }

  FormValidation() {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get _email() {
    return this.formGroup.get('email');
  }

  get _password() {
    return this.formGroup.get('password');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  Submit() {
    if (!this.formGroup.valid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.toastr.error('Please fill all required fields correctly', 'VALIDATION ERROR');
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    console.log('Login attempt with:', this.formGroup.value);

    this._service.Login(this.formGroup.value).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        
        // Verify token was stored
        setTimeout(() => {
          if (!this.authService.getToken()) {
            console.error('Token not stored after login');
            this.toastr.error('Authentication error', 'ERROR');
            this.isSubmitting = false;
            return;
          }

          this.toastr.success('Login successful', 'SUCCESS');
          this.coreService.getUserName().subscribe({
            next: () => {
              this.router.navigateByUrl(this.retrunUrl);
            },
            error: (error) => {
              console.error('Error getting username:', error);
              // Still proceed with navigation even if username fetch fails
              this.router.navigateByUrl(this.retrunUrl);
            }
          });
        }, 100); // Small delay to ensure token is stored
      },
      error: (error) => {
        console.error('Login error:', error);
        let errorMessage = 'Login failed';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Invalid email or password';
        } else if (error.status === 404) {
          errorMessage = 'Service not available';
        }
        
        this.toastr.error(errorMessage, 'ERROR');
        this.isSubmitting = false;
      }
    });
  }

  SendEmailForgetpassword() {
    if (!this.emailModel) {
      this.toastr.error('Please enter your email', 'ERROR');
      return;
    }

    this._service.forgetPassword(this.emailModel).subscribe({
      next: (response) => {
        console.log('Password reset email sent:', response);
        this.toastr.success('Password reset email sent', 'SUCCESS');
      },
      error: (error) => {
        console.error('Password reset error:', error);
        this.toastr.error(error.error?.message || 'Failed to send reset email', 'ERROR');
      }
    });
  }
}
