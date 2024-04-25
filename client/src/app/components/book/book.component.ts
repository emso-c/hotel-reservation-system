import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Booking, Profile, Room, State } from '../../shared/models';
import { DynamicLottieComponent } from '../dynamic-lottie/dynamic-lottie.component';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [CommonModule, DynamicLottieComponent],
  templateUrl: './book.component.html',
  styleUrl: './book.component.css'
})
export class BookComponent {
  constructor (private authService: AuthService, private apiService: ApiService) {}
  profile: Profile = this.authService.getProfile();
  booking: Booking|null = null;
  room: Room|null = null;
  totalPrice: number = 0;
  totalDays: number = 0;
  checkIn: Date = new Date();
  checkOut: Date = new Date();
  payment: boolean = false;
  state: State = {
    loading: false,
    error: false,
    initialSearch: true
  }

  async ngOnInit() {
    try {
    
      const roomId = window.location.pathname.split('/').pop();
      if (!roomId) {
        throw new Error('Room not found');
      }
      this.state.loading = true;
      this.room = await this.apiService.getRoom(roomId)
      if (!this.room) {
        throw new Error('Room not found');
      }
      if (!this.profile || this.profile.role !== 'customer') {
        throw new Error('Unauthorized');
      }

      const queryParams = new URLSearchParams(window.location.search);
      const checkInString = queryParams.get('fromDate');
      const checkOutString = queryParams.get('toDate');
      if (!checkInString || !checkOutString) {
        throw new Error('Invalid parameters');
      }
      this.checkIn = new Date(checkInString);
      this.checkOut = new Date(checkOutString);
      
      // check if dates are valid
      if (this.checkIn > this.checkOut) {
        throw new Error('Invalid dates');
      }

      // check if same day
      if (this.checkIn.toDateString() === this.checkOut.toDateString()) {
        throw new Error('Check in and check out dates cannot be the same');
      }
  
      // Check if room is available for the selected dates
      if (this.checkIn < this.room.availableFrom || (this.room.availableTo && this.checkOut > this.room.availableTo)) {
        throw new Error('Room not available for the selected dates');
      }

      // Check if room is already booked
      const customerBookings = await this.apiService.getCustomerBookings();
      if (customerBookings.find((booking: { roomId: string; }) => booking.roomId === roomId)) {
        throw new Error('Room already booked');
      }

      const hotelId = this.room.hotel;
      for (const booking of customerBookings) {
        // check if another room in the same hotel is already booked
        const room = await this.apiService.getRoom(booking.room);
        if (room.hotel === hotelId && ['approved', 'pending'].includes(booking.status)) {
          throw new Error('Another room in the same hotel is already booked');
        }

        // check if customer has another booking in the selected dates
        if (
            this.checkIn < new Date(booking.checkOutDate) &&
            this.checkOut > new Date(booking.checkInDate) &&
            // ['approved', 'pending'].includes(booking.status)
            (booking.status == 'approved' && !booking.isPaid) &&
            (booking.status == 'pending' && booking.isPaid)
          ) {
          throw new Error('You already have a booking in the selected dates');
        }
      }

      // Calculate total price
      const diffTime = Math.abs(this.checkOut.getTime() - this.checkIn.getTime());
      this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.totalPrice = this.totalDays * this.room.price;
    } catch (e: any) {
      alert(e.message)
      window.history.back();
      return;
    } finally {
      this.state.loading = false;
    }
  }

  async book(){
    if (confirm('Are you sure you want to book this room?') === false) {
      return;
    }
    this.state.loading = true;
    try {
      const booking = await this.apiService.bookRoom(this.room!._id, this.checkIn.toDateString(), this.checkOut.toDateString());
      this.booking = booking.data;
    } catch (e: any) {
      this.state.error = true;
    } finally {
      this.state.loading = false;
    }
  }

  async pay(){
    if (confirm('Are you sure you want to pay for this room?') === false) {
      return;
    }
    this.state.loading = true;
    try {
      await this.apiService.payBooking(this.booking!._id);
      this.payment = true;
    } catch (e: any) {
      this.state.error = true;
    } finally {
      this.state.loading = false;
    }
  }

  viewBookings(){
    window.location.href = `/bookings`;
  }

  splitAmenities(amenities: string[]): string[] {
    return amenities[0].split(',').map(a => a.trim());
  }

  getWholeStars(num: number) {
    return Math.min(5, Math.max(0, Math.round(num)));
  }
}
