import { Injectable } from '@angular/core';
import { Profile } from '../shared/models';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() { }
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('profile');
  }

  isLoggedIn() {
    return !!localStorage.getItem('accessToken');
  }

  storeProfile(profile: Profile) {
    localStorage.setItem('profile', JSON.stringify(profile));
  }

  storeToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  getProfile(): Profile {
    const profile = localStorage.getItem('profile');
    if (!profile) {
      return {
        email: '',
        username: 'guest',
        role: 'customer',
        _id: '',
        profilePhoto: ''
      };
    }
    return JSON.parse(profile);
  }

  getRole(): string|null {
    if (!this.isLoggedIn() || typeof this.getProfile() !== 'object') {
      return null;
    }
    const profile = this.getProfile() as Profile;
    return profile.role;
  }
}
