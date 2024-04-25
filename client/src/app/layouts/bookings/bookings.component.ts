import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerBookingsComponent } from '../../components/customer-bookings/customer-bookings.component';
import { OwnerBookingsComponent } from '../../components/owner-bookings/owner-bookings.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [NgIf, CustomerBookingsComponent, OwnerBookingsComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent {
  role: string;
  constructor(private route: ActivatedRoute) {
    this.role = this.route.snapshot.data['role'];
  }
}
