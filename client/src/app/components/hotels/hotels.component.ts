import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HotelWithLowestPrice, State } from '../../shared/models';
import { CommonModule} from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { maxPriceValidator, numberValidator, stringValidator } from '../../shared/validators';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { isValid, getFormClass } from '../../shared/utils';
import { FormErrorComponent } from '../form-error/form-error.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilter, faSort, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { DynamicLottieComponent } from '../dynamic-lottie/dynamic-lottie.component';

@Component({
  selector: 'app-hotels',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormErrorComponent,
    FontAwesomeModule,
    DynamicLottieComponent
  ],
  standalone: true,
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.css'
})
export class HotelsComponent implements OnChanges {
  faFilter = faFilter;
  faSort = faSort;
  faTrash = faTrash;
  faPlus = faPlus;
  isValid = isValid;
  getFormClass = getFormClass;

  getWholeStars(num: number) {
    return Math.min(5, Math.max(0, Math.round(num)));
  }
  getEmptyStars(num: number) {
    // if decimal is smaller than 0.5, round down, otherwise round up
    num = num % 1 < 0.5 ? Math.floor(num) : Math.ceil(num);
    return Math.min(5, Math.max(0, 5 - num));
  }

  constructor(private authService: AuthService, private apiService: ApiService) {}
  @Input() allHotels: HotelWithLowestPrice[] = [];
  @Input() state: State = {
    loading: false,
    error: false,
    initialSearch: true
  }
  profile: any = {};
  ngOnInit() {
    if (this.state.initialSearch) {
      // this.hotels = this.mockHotels;
    }
    this.profile = this.authService.getProfile();
  }

  view(hotel: HotelWithLowestPrice) {
    // Get current query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const url = `/hotel/${hotel._id}?${queryParams.toString()}`;
    window.location.href = url;
  }

  mockHotels: HotelWithLowestPrice[] = [
    {
      _id: '1',
      name: 'Hotel 1',
      location: 'Location 1',
      rating: 4,
      photos: [],
      description: 'Description 1',
      lowestPrice: 100,
      ratedBy: []
    },
    {
      _id: '2',
      name: 'Hotel 2',
      location: 'Location 2',
      rating: 3,
      photos: [],
      description: 'Description 2',
      lowestPrice: 200,
      ratedBy: []
    },
    {
      _id: '3',
      name: 'Hotel 3',
      location: 'Location 3',
      rating: 5,
      photos: [],
      description: 'Description 3',
      lowestPrice: 300,
      ratedBy: []
    },
    {
      _id: '4',
      name: 'Hotel 4',
      location: 'Location 4',
      rating: 2,
      photos: [],
      description: 'Description 4',
      lowestPrice: 400,
      ratedBy: []
    },
  ]
  hotels: HotelWithLowestPrice[] = [];

  filterForm = new FormGroup({
    rating: new FormControl('', [
      Validators.min(1),
      Validators.max(5),
    ]),
    minPrice: new FormControl('', [
      Validators.min(0),
    ]),
    maxPrice: new FormControl('', [
      Validators.min(0),
      maxPriceValidator,
    ]),
  });

  sortForm = new FormGroup({
    sort: new FormControl('', [
      Validators.required,
      Validators.pattern('^(rating|price)$'),
    ]),
    order: new FormControl('', [
      Validators.required,
      Validators.pattern('^(asc|desc)$'),
    ]),
  });

  filter() {
    if (!this.filterForm.valid) {
      return;
    }

    this.state.loading = true;
    this.state.error = false;

    try {
      this.hotels = this.allHotels.filter(hotel => {
        const rating = Number(this.filterForm.value.rating);
        const minPrice = Number(this.filterForm.value.minPrice);
        const maxPrice = Number(this.filterForm.value.maxPrice);
        return (!rating || hotel.rating >= rating) &&
          (!minPrice || hotel.lowestPrice >= minPrice) &&
          (!maxPrice || hotel.lowestPrice <= maxPrice);
      });
    } catch (error) {
      this.state.error = true;
    } finally {
      this.state.loading = false;
    }
  }

  sort() {
    if (!this.sortForm.valid) {
      return;
    }

    this.state.loading = true;
    this.state.error = false;

    const sort = this.sortForm.value.sort;
    const order = this.sortForm.value.order;

    if (!sort || !order) {
      this.state.error = true;
      this.state.loading = false;
      return;
    }

    try {
      this.hotels = this.hotels.sort((a, b) => {
        if (sort === 'rating') {
          return order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
        } else {
          return order === 'asc' ? a.lowestPrice - b.lowestPrice : b.lowestPrice - a.lowestPrice;
        }
      });
    } catch (error) {
      this.state.error = true;
    } finally {
      this.state.loading = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allHotels'] && changes['allHotels'].currentValue) {
      this.reset();
    }
  }

  reset() {
    this.hotels = this.allHotels;
    this.filterForm.reset();
    this.sortForm.reset();
  }

  addHotelForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required,]),
    location: new FormControl('', [Validators.required,]),
    description: new FormControl('', [Validators.required,]),
    photos: new FormControl('', [Validators.required]),
  });

  addHotel(){
    if (!this.addHotelForm.valid) {
      alert('Please fill in all required fields: ' + Object.keys(this.addHotelForm.controls).filter(key => this.addHotelForm.controls[key].errors).join(', ') );
      return;
    }
    this.state.loading = true;
    try{
      this.apiService.createHotel(
        this.addHotelForm.value.name,
        this.addHotelForm.value.location,
        this.addHotelForm.value.description,
      )
        .then(async (data) => {
          var dataToPush = {
            ...data.data,
            photos: []
          };
          const photos: FileList | null = (document.getElementById('photos') as HTMLInputElement).files;
          if (photos){
            const formData = new FormData();
            for (let i = 0; i < photos.length; i++) {
              formData.append('photos', photos[i], photos[i].name);
            }
            const res = await this.apiService.putHotelPhotos(data.data._id, formData);
            dataToPush.photos = res.photos;
          }
          this.hotels.push(dataToPush);
          this.addHotelForm.reset();
          (document.getElementById('addHotelCloseModal') as HTMLElement).click();
        })
    } catch (error) {
      console.error(error);
      this.state.error = true;
      alert('Error adding hotel');
    } finally {
      this.state.loading = false;
    }
  }
}