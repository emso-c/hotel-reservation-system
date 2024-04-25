import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Booking, BookingWithHotelAndRoom, State } from '../../shared/models';
import { CommonModule } from '@angular/common';
import { DynamicLottieComponent } from '../dynamic-lottie/dynamic-lottie.component';

@Component({
  selector: 'app-customer-bookings',
  standalone: true,
  imports: [CommonModule, DynamicLottieComponent],
  templateUrl: './customer-bookings.component.html',
  styleUrl: './customer-bookings.component.css'
})
export class CustomerBookingsComponent {
  constructor(private apiService: ApiService, public authService: AuthService) { }
  bookings: BookingWithHotelAndRoom[] = [];
  state: State = {
    loading: false,
    error: false,
    initialSearch: true
  }

  async ngOnInit() {
    try {
      this.state.loading = true;
      const profile = this.authService.getProfile();
      if (!profile || profile.role !== 'customer') {
        window.location.href = '/not-authorized';
        throw new Error('Unauthorized');
      }
      const bookings = await this.apiService.getCustomerBookings();
      this.bookings = await Promise.all(bookings.map(async (booking: any) => {
        const room = await this.apiService.getRoom(booking.room);
        const hotel = await this.apiService.getHotel(room.hotel);
        return { ...booking, room, hotel };
      }));

      // sort by check-in date
      this.bookings.sort((a, b) => {
        return new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
      });
    } catch (error: any) {
      alert(error.message);
      this.state.error = true;
    } finally {
      this.state.loading = false;
    }
  }

  async payBooking(booking: BookingWithHotelAndRoom){
    await this.apiService.payBooking(booking._id);
    booking.isPaid = true;
    alert('Payment successful!')
  }
  async cancelBooking(booking: BookingWithHotelAndRoom){
    await this.apiService.cancelBooking(booking._id);
    booking.status = 'cancelled';
    alert('Booking cancelled!')
  }
  async deleteBooking(booking: BookingWithHotelAndRoom){
    await this.apiService.deleteBooking(booking._id);
    alert('Booking deleted!')
    this.bookings = this.bookings.filter(b => b._id !== booking._id);
  }

  isRatedByUser(booking: BookingWithHotelAndRoom){
    const username = this.authService.getProfile().username;
    return booking.hotel.ratedBy.some((item: any) => item.username === username);
  }
  async rateHotel(booking: BookingWithHotelAndRoom){
    const rating = prompt('Enter rating (1-5) for the hotel');
    if (!rating || isNaN(+rating) || +rating < 1 || +rating > 5) {
      alert('Invalid rating!');
      return;
    }
    await this.apiService.rateHotel(booking.hotel._id, +rating);
    alert('Rating submitted!')
  }
}
