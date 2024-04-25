import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DynamicLottieComponent } from '../dynamic-lottie/dynamic-lottie.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ImagePickerComponent } from '../image-picker/image-picker.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormErrorComponent } from '../form-error/form-error.component';
import { Profile } from '../../shared/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    DynamicLottieComponent,
    ImagePickerComponent,
    FormErrorComponent,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  constructor(private authService: AuthService, private apiService: ApiService) {}
  profile: Profile = {
    _id: '',
    email: '',
    username: '',
    role: '',
    profilePhoto: ''
  }
  state = {
    loading: false,
    error: false,
  }
  profileForm = new FormGroup({
    email: new FormControl('', [
      Validators.email,
    ]),
    username: new FormControl('', [
      Validators.minLength(4),
      Validators.maxLength(20),
      Validators.pattern(/^[a-zA-Z0-9]*$/),
    ]),
    password: new FormControl('', [
      Validators.minLength(4),
      Validators.maxLength(20),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/),
    ]),
    currPassword: new FormControl('', [
      Validators.required,
    ]),
  });

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      window.location.href = '/login';
    }
    this.profile = this.authService.getProfile();
    this.profileForm.patchValue({
      email: this.profile.email,
      username: this.profile.username,
    });
  }

  
  async updateProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    if (  !this.profileForm.value.email &&
          !this.profileForm.value.username &&
          !this.profileForm.value.password
        ) {
      alert('Please provide at least one field to update');
      return;
    }

    this.state.error = false;
    this.state.loading = true;

    try{
      const data = await this.apiService.updateUser(this.profileForm.value)
      this.authService.storeProfile(data.data);
      this.profile = data.data;
    } catch (error) {
      alert('Failed to update profile');
      console.error(error);
    } finally {
      this.state.loading = false;
    }
  }

  async deleteProfile() {
    if (this.profileForm.controls.currPassword.invalid) {
      alert('Please provide your current password to delete your profile');
      return;
    }
    if (!confirm('Are you sure you want to delete your profile?')) {
      return;
    }
    this.state.error = false;
    this.state.loading = true;

    try{
      await this.apiService.deleteUser(this.profileForm.value.currPassword!)
      this.authService.logout();
      window.location.href = '/login';
    } catch (error) {
      alert('Failed to delete profile');
      console.error(error);
    } finally {
      this.state.loading = false;
    }
  }

  async onImagePicked(photo: File) {
    if (!photo){
      return;
    }
    const formData = new FormData();
    formData.append('photo', photo, photo.name);
    this.state.loading = true;
    try{
      const data = await this.apiService.putProfilePhoto(formData)
      this.profile.profilePhoto = data.photo
      this.authService.storeProfile(this.profile);
      console.log('Photo uploaded')
    } catch (error) {
      alert('Failed to upload photo');
      console.error(error);
    }
    this.state.loading = false;
  }

  get profilePhoto(): string {
    var photo = this.profile!.profilePhoto;
    if (photo === "default.jpg"){
      return 'http://localhost:5000/cdn/static/photos/profile/default.jpg';
    }
    return 'http://localhost:5000/cdn/static/photos/profile/' + this.profile?.profilePhoto;
  }
  
}
