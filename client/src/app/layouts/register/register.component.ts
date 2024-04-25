import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { passwordMatchValidator } from '../../shared/validators';
import { FormErrorComponent } from '../../components/form-error/form-error.component';
import { DynamicLottieComponent } from '../../components/dynamic-lottie/dynamic-lottie.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    FormErrorComponent,
    DynamicLottieComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css', '../../shared/styles/auth.css']
})
export class RegisterComponent {
  state = {
    loading: false,
    error: false,
    done: false
  }

  registerForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(20),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(20),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/),
    ]),
    passwordConfirm: new FormControl('', [
      Validators.required,
      passwordMatchValidator,
    ]),
    role: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(customer|hotelOwner)$/),
    ]),
  });

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      window.location.href = '/';
    }
  }

  async register() {
    if (this.registerForm.invalid) {
      return;
    }
    this.state.error = false;
    this.state.loading = true;

    this.apiService.createUser(
      this.registerForm.value.username!,
      this.registerForm.value.password!,
      this.registerForm.value.passwordConfirm!,
      this.registerForm.value.email!,
      this.registerForm.value.role!,
    ).then(async () => {
      const token: string = await this.apiService.getAccessToken(this.registerForm.value.username!, this.registerForm.value.password!);
      if (token === undefined || !token || !token.length) {
        this.state.error = true;
        alert('Registration failed, please try again');
        return;
      }
      this.authService.storeToken(token);
      const profile = await this.apiService.getProfile()
      this.authService.storeProfile(profile);
      this.state.done = true;
      // get next route from query params
      const next = new URLSearchParams(window.location.search || '').get('next') || '/';
      window.location.href = next;
    }).catch((error: any) => {
      this.state.error = true;
      alert('Registration failed, please try again');
    }).finally(() => {
      this.state.loading = false;
    });
  }

  constructor(private apiService: ApiService, private authService: AuthService) { }

}
