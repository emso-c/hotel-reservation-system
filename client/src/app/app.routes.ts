import { Routes } from '@angular/router';
import { HomeComponent } from './layouts/home/home.component';
import { LoginComponent } from './layouts/login/login.component';
import { AuthGuard, UserRoleResolver } from './auth.guard';
import { RegisterComponent } from './layouts/register/register.component';
import { HotelViewComponent } from './components/hotel-view/hotel-view.component';
import { BookComponent } from './components/book/book.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { BookingsComponent } from './layouts/bookings/bookings.component';
import { ProfileComponent } from './components/profile/profile.component';



export const routes: Routes = [
  { title: 'Istanbook - Login', path: 'login', component: LoginComponent },
  { title: 'Istanbook - Register', path: 'register', component: RegisterComponent },
  { title: 'Istanbook - Home', path: 'home', component: HomeComponent, canActivate: [AuthGuard], resolve: { role: UserRoleResolver }},
  { title: 'Istanbook - Hotel', path: 'hotel/:id', component: HotelViewComponent, canActivate: [AuthGuard], resolve: { role: UserRoleResolver }},
  { title: 'Istanbook - Book Room', path: 'book/:roomId', component: BookComponent, canActivate: [AuthGuard], resolve: { role: UserRoleResolver }},
  { title: 'Istanbook - Bookings', path: 'bookings', component: BookingsComponent, canActivate: [AuthGuard], resolve: { role: UserRoleResolver }},
  { title: 'Istanbook - Profile', path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], resolve: { role: UserRoleResolver }},
  { title: 'Istanbook - ', path: '', redirectTo: 'home', pathMatch: 'full'},
  { title: 'Istanbook - Not Found', path: '**', component: NotFoundComponent}
];
