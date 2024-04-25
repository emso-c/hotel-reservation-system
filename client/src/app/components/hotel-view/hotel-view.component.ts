import { Component } from '@angular/core';
import { Hotel, Profile, Room, State } from '../../shared/models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { isValid, getFormClass } from '../../shared/utils';
import { DynamicLottieComponent } from '../dynamic-lottie/dynamic-lottie.component';

@Component({
  selector: 'app-hotel-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicLottieComponent],
  providers: [DatePipe],
  templateUrl: './hotel-view.component.html',
  styleUrl: './hotel-view.component.css',
})
export class HotelViewComponent {
  isValid = isValid;
  getFormClass = getFormClass;
  constructor(private apiService: ApiService, private authService: AuthService) { }
  profile: Profile = {
    _id: '',
    email: '',
    username: '',
    role: '',
    profilePhoto: '',
  };
  hotel: Hotel = {
    _id: '',
    name: '',
    location: '',
    rating: 0,
    photos: [],
    description: '',
    ratedBy: []
  };
  rooms: Room[] = [];
  state: State = {
    loading: false,
    error: false,
    initialSearch: true
  };

  async ngOnInit() {
    this.profile = this.authService.getProfile();
    const hotelId = window.location.pathname.split('/').pop();
    if (!hotelId) {
      this.state.error = true;
      return;
    }
    this.state.loading = true;
    try{
      this.hotel = await this.apiService.getHotel(hotelId)
      this.rooms = await this.apiService.getRooms(hotelId)
      this.setEditHotelFormValues(this.hotel);
    } catch (error) {
      this.state.error = true;
    } finally {
      this.state.loading = false;
    }
  }

  async bookRoom(room: Room) {
    var queryParams = new URLSearchParams(window.location.search);
    window.location.href = `/book/${room._id}?${queryParams.toString()}`;
  }

  async deleteRoom(room: Room) {
    // prompt user for confirmation
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    this.state.loading = true;
    try {
      await this.apiService.deleteRoom(this.hotel._id, room._id);
      this.rooms = this.rooms.filter(r => r._id !== room._id);
      // alert('Room deleted successfully!');
    } catch (error) {
      this.state.error = true;
    } finally {
      this.state.loading = false;
    }
  }

  editHotelForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required,]),
    location: new FormControl('', [Validators.required,]),
    description: new FormControl('', [Validators.required,]),
    hotelPhotos: new FormControl('', [Validators.required]),
  });

  addRoomForm: FormGroup = new FormGroup({
    roomName: new FormControl('', [Validators.required,]),
    type: new FormControl('', [Validators.required,Validators.pattern(/^(single|double|suite)$/i),]),
    capacity: new FormControl(1, [Validators.required,Validators.min(1),Validators.max(5),]),
    price: new FormControl(1, [Validators.required, Validators.min(1)]),
    availableFrom: new FormControl('', [Validators.required,]),
    availableTo: new FormControl('', []),
    amenities: new FormControl('', []),
    photos: new FormControl('', [Validators.required]),
  });
  defaultType = 'single';
  
  editRoomForm: FormGroup = new FormGroup({
    roomName: new FormControl('', [Validators.required,]),
    type: new FormControl('', [Validators.required,Validators.pattern(/^(single|double|suite)$/i),]),
    capacity: new FormControl(1, [Validators.required,Validators.min(1),Validators.max(5),]),
    price: new FormControl(1, [Validators.required, Validators.min(1)]),
    availableFrom: new FormControl('', [Validators.required,]),
    availableTo: new FormControl('', []),
    amenities: new FormControl('', []),
    editPhotos: new FormControl('', []),
  });
  selectedRoom: Room = {
    _id: '',
    roomName: '',
    type: '',
    capacity: 0,
    price: 0,
    availableFrom: new Date(),
    availableTo: new Date(),
    amenities: [],
    photos: [],
    hotel: '',
  };

  setEditHotelFormValues(hotel: Hotel) {
    this.editHotelForm.setValue({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      hotelPhotos: []
    });
  }
  setEditRoomFormValues(room: Room) {
    this.editRoomForm.setValue({
      roomName: room.roomName,
      type: room.type,
      capacity: room.capacity,
      price: room.price,
      availableFrom: new Date(room.availableFrom), // FIX
      availableTo: room.availableTo ?? null, // FIX
      amenities: room.amenities,
      editPhotos: []
    });
  }
  
  addRoom(){
    if (!this.addRoomForm.valid) {
      alert('Please fill in all required fields: ' + Object.keys(this.addRoomForm.controls).filter(key => this.addRoomForm.controls[key].errors).join(', ') );
      return;
    }
    this.state.loading = true;
    try{
      this.apiService.createRoom(this.hotel._id, {
        roomName: this.addRoomForm.value.roomName,
        type: this.addRoomForm.value.type,
        capacity: this.addRoomForm.value.capacity,
        price: this.addRoomForm.value.price,
        availableFrom: this.addRoomForm.value.availableFrom,
        availableTo: this.addRoomForm.value.availableTo,
        amenities: this.addRoomForm.value.amenities,
      })
        .then(async (data) => {
          var dataToPush = {
            ...data.data,
            photos: data.data.photos || []
          };
          const photos: FileList | null = (document.getElementById('photos') as HTMLInputElement).files;
          if (photos){
            const formData = new FormData();
            for (let i = 0; i < photos.length; i++) {
              formData.append('photos', photos[i], photos[i].name);
            }
            const res = await this.apiService.putRoomPhotos(data.data._id, formData);
            dataToPush.photos = res.photos;
          }
          this.rooms.push(dataToPush);
          this.addRoomForm.reset();
          (document.getElementById('addRoomCloseModal') as HTMLElement).click();
        })
    } catch (error) {
      console.error(error);
      this.state.error = true;
      alert('Error adding room');
    } finally {
      this.state.loading = false;
    }
  }

  editRoom(){
    if (!this.editRoomForm.valid) {
      alert('Please fill in all required fields: ' + Object.keys(this.editRoomForm.controls).filter(key => this.editRoomForm.controls[key].errors).join(', ') );
      return;
    }
    this.state.loading = true;
    try{
      this.apiService.updateRoom(this.hotel._id, this.selectedRoom._id, {
        roomName: this.editRoomForm.value.roomName,
        type: this.editRoomForm.value.type,
        capacity: this.editRoomForm.value.capacity,
        price: this.editRoomForm.value.price,
        availableFrom: this.editRoomForm.value.availableFrom,
        availableTo: this.editRoomForm.value.availableTo,
        amenities: this.editRoomForm.value.amenities,
      })
        .then(async (data) => {
          var dataToPush = {
            ...data.data,
            photos: data.data.photos || []
          };
          const photos: FileList | null = (document.getElementById('editPhotos') as HTMLInputElement).files;
          if (photos){
            const formData = new FormData();
            for (let i = 0; i < photos.length; i++) {
              formData.append('photos', photos[i], photos[i].name);
            }
            const res = await this.apiService.putRoomPhotos(data.data._id, formData);
            dataToPush.photos.push(...res.photos);
          }
          this.rooms = this.rooms.map(r => r._id === data.data._id ? dataToPush : r);
          this.editRoomForm.reset();
          (document.getElementById('editRoomCloseModal') as HTMLElement).click();
        })
    } catch (error) {
      console.error(error);
      this.state.error = true;
      alert('Error editing room');
    } finally {
      this.state.loading = false;
    }
  }

  editHotel(){
    if (!this.editHotelForm.valid) {
      alert('Please fill in all required fields: ' + Object.keys(this.editHotelForm.controls).filter(key => this.editHotelForm.controls[key].errors).join(', ') );
      return;
    }
    this.state.loading = true;
    try{
      this.apiService.updateHotel(this.hotel._id, {
        name: this.editHotelForm.value.name,
        location: this.editHotelForm.value.location,
        description: this.editHotelForm.value.description,
      })
        .then(async (data) => {
          var dataToPush = {
            ...data.data,
            photos: data.data.photos || []
          };
          const photos: FileList | null = (document.getElementById('hotelPhotos') as HTMLInputElement).files;
          if (photos){
            const formData = new FormData();
            for (let i = 0; i < photos.length; i++) {
              formData.append('photos', photos[i], photos[i].name);
            }
            const res = await this.apiService.putHotelPhotos(data.data._id, formData);
            dataToPush.photos.push(...res.photos);
          }
          this.hotel = dataToPush;
          this.setEditHotelFormValues(dataToPush);
          (document.getElementById('editHotelCloseModal') as HTMLElement).click();
        })
    } catch (error) {
      console.error(error);
      this.state.error = true;
      alert('Error editing hotel');
    } finally {
      this.state.loading = false;
    }
  }

  deleteHotelPhotos(){
    if (!confirm('Are you sure you want to delete all photos?')) return;
    this.state.loading = true;
    try{
      this.apiService.deleteHotelPhotos(this.hotel._id)
        .then(() => {
          this.hotel.photos = [];
        })
    } catch (error) {
      console.error(error);
      this.state.error = true;
      alert('Error deleting hotel photos');
    } finally {
      this.state.loading = false;
    }
  }

  deleteRoomPhotos(room: Room){
    if (!confirm('Are you sure you want to delete all photos of this room?')) return;
    this.state.loading = true;
    try{
      this.apiService.deleteRoomPhotos(room._id)
        .then(() => {
          room.photos = [];
        })
    } catch (error) {
      console.error(error);
      this.state.error = true;
      alert('Error deleting room photos');
    } finally {
      this.state.loading = false;
    }
  }

  deleteHotel(){
    // check if rooms are empty
    if (this.rooms.length > 0) {
      alert('Cannot delete hotel with rooms');
      return;
    }
    // prompt user for confirmation
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    this.state.loading = true;
    try {
      this.apiService.deleteHotel(this.hotel._id)
        .then(() => {
          window.location.href = '/';
        })
    } catch (error) {
      console.error(error);
      this.state.error = true;
      alert('Error deleting hotel');
    } finally {
      this.state.loading = false;
    }
  }

  splitAmenities(amenities: string[]): string[] {
    return amenities[0].split(',').map(a => a.trim());
  }

  getWholeStars(num: number) {
    return Math.min(5, Math.max(0, Math.round(num)));
  }
  getEmptyStars(num: number) {
    // if decimal is smaller than 0.5, round down, otherwise round up
    num = num % 1 < 0.5 ? Math.floor(num) : Math.ceil(num);
    return Math.min(5, Math.max(0, 5 - num));
  }

  isAvailable(room: Room) {
    const queryParams = new URLSearchParams(window.location.search);
      const checkInString = queryParams.get('fromDate');
      const checkOutString = queryParams.get('toDate');
      if (!checkInString || !checkOutString) {
        return false;
      }
      var checkIn = new Date(checkInString);
      var checkOut = new Date(checkOutString);
      
      // check if dates are valid
      if (checkIn > checkOut) {
        return false;
      }

      // check if same day
      if (checkIn.toDateString() === checkOut.toDateString()) {
        return false;
      }
  
      // Check if room is available for the selected dates
      if (checkIn < room.availableFrom || (room.availableTo && checkOut > room.availableTo)) {
        return false;
      }
      return true;
  }
}
