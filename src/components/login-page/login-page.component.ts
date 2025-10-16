import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/services/auth.service';  

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})

export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup;
  isSignup = false;
  loading = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient, private authService: AuthService, private toastr: ToastrService) {}

   ngOnInit() {
    this.loginForm = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formData = this.loginForm.value;
    this.loading = true;

    if (this.isSignup) {
      this.authService.register({
        username: formData.name,
        email: formData.email,
        password: formData.password
      }).subscribe({
        next: (res: any) => {
          this.toggleForm(); // switch to login form
          this.loginForm.get('name')?.reset();
          this.loading = false;
          this.toastr.success('Signup successful! Please log in.');
          this.loginForm.reset();  //clear the form fields
          this.isSignup = false;
        },
        error: (err) => {
          this.loading = false;
          let msg = 'Login failed';
          try {
            // Parse if it's a JSON string
            const parsed = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
            msg = parsed.message || msg;
          } catch (e) {
            msg = err.error || msg;
          }
          this.toastr.error(msg);
        }
      });
    } else {
      this.authService.login(formData.email, formData.password).subscribe({
        next: (res: any) => {
          let data = typeof res === 'string' ? JSON.parse(res) : res;
          localStorage.setItem('token', data.token || 'sample-token');
          localStorage.setItem('role', data.role || 'Test');
          localStorage.setItem('username', data.username || '');
          this.router.navigate(['/dashboard']);
          this.loginForm.reset();
          this.loading = false;
          this.toastr.success('Login successful!');
        },
        error: (err) => {
          this.loading = false;
          let msg = 'Login failed';
          try {
            // Parse if it's a JSON string
            const parsed = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
            msg = parsed.message || msg;
          } catch (e) {
            msg = err.error || msg;
          }
          this.toastr.error(msg);
        }
      });
    }
  }

  toggleForm() {
    this.isSignup = !this.isSignup;

    if (this.isSignup) {
      this.loginForm.get('name')?.setValidators([Validators.required]);
    } else {
      this.loginForm.get('name')?.clearValidators();
    }
    this.loginForm.get('name')?.updateValueAndValidity();

     // Clear messages
    this.successMessage = '';
    this.errorMessage = '';

      // Reset the form and validation state**
    this.loginForm.reset();
    this.loginForm.markAsUntouched();
    this.loginForm.markAsPristine();
  }

  get name() { 
    return this.loginForm.get('name');
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

}

