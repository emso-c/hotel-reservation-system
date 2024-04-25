import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DynamicLottieComponent } from '../../components/dynamic-lottie/dynamic-lottie.component';
import { FormErrorComponent } from '../../components/form-error/form-error.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    DynamicLottieComponent,
    FormErrorComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['../../shared/styles/auth.css']
})
export class LoginComponent {
  state = {
    loading: false,
    error: false,
    done: false
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      window.location.href = '/';
    }
  }
  
  loginForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
    ]),
    password: new FormControl('', [
      Validators.required,
    ]),
  });

  async login() {
    if (this.loginForm.invalid) {
      return;
    }
    this.state.loading = true;
    const token: string = await this.apiService.getAccessToken(this.loginForm.value.username!, this.loginForm.value.password!)
    if (token === undefined || !token || !token.length) {
      // set error in password control
      this.loginForm.controls.password.setErrors({ invalid: true });
      this.state.loading = false;
      return;
    }
    this.authService.storeToken(token);
    const profile = await this.apiService.getProfile();
    this.authService.storeProfile(profile);
    this.state.done = true;
    // get next route from query params
    const next = new URLSearchParams(window.location.search || '').get('next') || '/';
    window.location.href = next;
  }

  constructor(private apiService: ApiService, private authService: AuthService) {}
}
