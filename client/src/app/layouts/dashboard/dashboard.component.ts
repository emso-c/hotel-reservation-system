import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Hotel, HotelWithLowestPrice, State } from '../../shared/models';
import { NgFor, NgIf } from '@angular/common';
import { HotelsComponent } from '../../components/hotels/hotels.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, HotelsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private apiService: ApiService) { console.log('DashboardComponent') }

  hotels: HotelWithLowestPrice[] = [];
  hotelsState: State = {
    loading: false,
    error: false,
    initialSearch: true
  };

  async ngOnInit() {
    this.hotelsState.loading = true;
    this.apiService.listMyHotels().then((hotels) => {
      this.hotels = hotels.map((hotel: Hotel) => {
        return {
          _id: hotel._id,
          name: hotel.name,
          location: hotel.location,
          rating: hotel.rating,
          photos: hotel.photos,
          description: hotel.description,
          ratedBy: hotel.ratedBy,
          lowestPrice: 0
        };
      });
      this.hotels.forEach(async (hotel) => {
        hotel.lowestPrice = await this.apiService.getLowestPrice(hotel._id);
      });
    }).catch((error) => {
      this.hotelsState.error = true;
    }).finally(() => {
      this.hotelsState.loading = false;
    });
  }
}
