import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BookingWithHotelAndRoom, State } from '../../shared/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-owner-bookings',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './owner-bookings.component.html',
  styleUrl: './owner-bookings.component.css'
})
export class OwnerBookingsComponent {
  constructor(private apiService: ApiService, public authService: AuthService, private datePipe: DatePipe) { }
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
      if (!profile || profile.role !== 'hotelOwner') {
        throw new Error('Unauthorized');
      }
      const bookings = await this.apiService.getOwnerBookings();
      this.bookings = await Promise.all(bookings.map(async (booking: any) => {
        const room = await this.apiService.getRoom(booking.room);
        const hotel = await this.apiService.getHotel(room.hotel);
        return { ...booking, room, hotel };
      }));

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

  async approveBooking(booking: BookingWithHotelAndRoom){
    await this.apiService.updateBookingStatus(booking._id, 'approved');
    booking.status = 'approved';
    alert('Booking approved!')
  }
  async rejectBooking(booking: BookingWithHotelAndRoom){
    await this.apiService.updateBookingStatus(booking._id, 'rejected');
    booking.status = 'rejected';
    alert('Booking rejected!')
  }
}
