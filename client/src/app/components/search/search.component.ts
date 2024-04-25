import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HotelWithLowestPrice, Hotel } from '../../shared/models';
import { maxPriceValidator } from '../../shared/validators';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { HotelsComponent } from '../hotels/hotels.component';
import { FormErrorComponent } from '../form-error/form-error.component';
import { DynamicLottieComponent } from '../dynamic-lottie/dynamic-lottie.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilter, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HotelsComponent,
    FormErrorComponent,
    DynamicLottieComponent,
    FontAwesomeModule,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  faFilter = faFilter;
  faMagnifyingGlass = faMagnifyingGlass;
  searchForm = new FormGroup({
    location: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-Z\s]*$/)
    ]),
    checkIn: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)
    ]),
    capacity: new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(10),
      Validators.pattern(/^\d+$/)
    ]),
    checkOut: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)
    ]),
    
    type: new FormControl('', [
      Validators.pattern(/^[a-zA-Z\s]*$/)
    ]),
    minPrice: new FormControl('', [
      Validators.min(1),
    ]),
    maxPrice: new FormControl('', [
      Validators.min(1),
      maxPriceValidator
    ])
  });

  showAdvancedFilters = false;
  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // states
  state = {
    loading: false,
    error: false,
    initialSearch: true
  }

  // TODO maybe get some initial hotels to display?
  hotels: HotelWithLowestPrice[] = [];

  constructor(private apiService: ApiService) { }

  loadSearchFormParamsFromQuery() {
    const queryParams = new URLSearchParams(window.location.search);
    this.searchForm.patchValue({
      location: queryParams.get('location') || '',
      checkIn: queryParams.get('fromDate') || '',
      capacity: queryParams.get('capacity') || '',
      checkOut: queryParams.get('toDate') || '',
      type: queryParams.get('type') || '',
      minPrice: queryParams.get('minPrice') || '',
      maxPrice: queryParams.get('maxPrice') || ''
    });
  }

  ngOnInit() {
    this.loadSearchFormParamsFromQuery();
    this.search();
  }

  search() {
    if (!this.searchForm.valid) {
      return;
    }

    this.state.initialSearch = false;
    this.state.loading = true;
    this.state.error = false;
    
    const queryParams = new URLSearchParams();
    queryParams.set('location', this.searchForm.value.location!);
    queryParams.set('fromDate', this.searchForm.value.checkIn!);
    queryParams.set('capacity', this.searchForm.value.capacity!);
    this.searchForm.value.type ? queryParams.set('type', this.searchForm.value.type) : null;
    this.searchForm.value.checkOut ? queryParams.set('toDate', this.searchForm.value.checkOut) : null;
    this.searchForm.value.minPrice ? queryParams.set('minPrice', this.searchForm.value.minPrice) : null;
    this.searchForm.value.maxPrice ? queryParams.set('maxPrice', this.searchForm.value.maxPrice) : null;

    // apply query params to url
    window.history.pushState({}, '', `?${queryParams.toString()}`);

    this.apiService.filterHotels(queryParams.toString()).then((hotels) => {
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
      this.state.error = true;
    }
    ).finally(() => {
      this.state.loading = false;
    });
  }
  
  logout() {
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  }
}