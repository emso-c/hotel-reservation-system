import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../../shared/models';
import { ImagePickerComponent } from '../image-picker/image-picker.component'
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ImagePickerComponent,
    NgIf
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private route: ActivatedRoute, private authService: AuthService) { }
  profile: Profile|null = null;
  ngOnInit() {
    this.profile = this.authService.getProfile();
  }

  get isLoggedIn(){
    return this.authService.isLoggedIn();
  }
  get profilePhoto(): string {
    var photo = this.profile?.profilePhoto;
    if (photo === "default.jpg"){
      return 'http://localhost:5000/cdn/static/photos/profile/default.jpg';
    }
    return 'http://localhost:5000/cdn/static/photos/profile/' + this.profile?.profilePhoto;
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}
