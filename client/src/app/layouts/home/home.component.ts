import { Component } from '@angular/core';
import { SearchComponent } from '../../components/search/search.component';
import { ActivatedRoute } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SearchComponent,
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
    NgIf
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  component: string = '';
  constructor(private route: ActivatedRoute, private authService: AuthService) {
    if (!this.authService.isLoggedIn()) {
      window.location.href = '/login';
    }
    const role = this.route.snapshot.data['role'];
    switch (role) {
      case 'hotelOwner': this.component = 'dashboard'; break;
      case 'customer': this.component = 'search'; break;
    }
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}