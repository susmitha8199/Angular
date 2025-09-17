import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient, private authService: AuthService) {}

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
          this.successMessage = 'Signup successful! Please log in.';
          this.errorMessage = '';
          this.loginForm.reset();  //clear the form fields
          this.isSignup = false;
        },
        error: (err) => {
          this.errorMessage = err.error || 'Signup failed';
        }
      });
    } else {
      this.authService.login(formData.email, formData.password).subscribe({
        next: (res: any) => {
          this.router.navigate(['/dashboard']);
          this.loginForm.reset();
          this.successMessage = '';
          this.errorMessage = '';
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error || 'Login failed';
          this.loading = false;
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

