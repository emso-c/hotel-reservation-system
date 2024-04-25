import { Injectable } from '@angular/core';
import { Room } from '../shared/models';
import { serverUrl } from '../shared/global';
import { AuthService } from './auth.service'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private authService: AuthService) { }
  private apiUrl: string = `${serverUrl}/api`;
  private authUrl: string = `${serverUrl}/auth`;


  async getHotel(hotelId: string) {
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}`);
    const data = await response.json();
    return data;
  }

  async getRooms(hotelId: string) {
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}/rooms`);
    const data = await response.json();
    var rooms: Room[] = data.map((room: Room) => {
      return {
          _id: room._id,
          roomName: room.roomName,
          type: room.type,
          capacity: room.capacity,
          price: room.price,
          availableFrom: room.availableFrom,
          availableTo: room.availableTo,
          amenities: room.amenities,
          photos: room.photos,
        };
    });
    return rooms;
  }

  async listHotels() {
    const response = await fetch(`${this.apiUrl}/hotels`);
    const data = await response.json();
    return data;
  }

  async listMyHotels() {
    const profile = this.authService.getProfile();
    if (!this.authService.isLoggedIn() || 
      !profile || profile.role !== 'hotelOwner'
      ) {
        return [];
      }
    const response = await fetch(`${this.apiUrl}/hotels/my`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    const data = await response.json();
    return data;
  }

  async getLowestPrice(hotelId: string){
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}/rooms`);
    const data = await response.json();
    var rooms: Room[] = data.map((room: Room) => {
      return {
          _id: room._id,
          roomName: room.roomName,
          type: room.type,
          capacity: room.capacity,
          price: room.price,
          availableFrom: room.availableFrom,
          availableTo: room.availableTo,
          amenities: room.amenities,
          photos: room.photos,
          hotel: hotelId
        };
    });
    rooms.sort((a, b) => a.price - b.price);
    return rooms[0].price;
  }

  async filterHotels(queryParams: string) {
      const response = await fetch(`${this.apiUrl}/hotel/search?${queryParams}`);
      const data = await response.json();
      return data;
  }

  async getAccessToken(username: string, password: string) {
    try {
      const response = await fetch(`${this.authUrl}/getAccessToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.token;
    } catch (error) {
      return null;
    }
  }

  async createUser(username: string, password: string, passConfirm:string, email: string, role: string) {
    const response = await fetch(`${this.apiUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        "username": username,
        "password": password,
        "passwordConfirm": passConfirm,
        "email": email,
        "role": role
      })
    });
    if (!response.ok) {
      throw new Error('Invalid username or password');
    }
    const data = await response.json();
    return data.token;
  }

  async getProfile(): Promise<any> {
      const response = await fetch(`${this.apiUrl}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      });
      if (!response.ok) {
        throw new Error('Invalid username or password');
      }
      const data = await response.json();
      return data;
  }

  async updateUser(params: any) {
    const response = await fetch(`${this.apiUrl}/user/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      throw new Error('Invalid user data');
    }
    const data = await response.json();
    return data;
  }

  async deleteUser(password: string) {
    const response = await fetch(`${this.apiUrl}/user/profile`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ password })
    });
    if (!response.ok) {
      throw new Error('Invalid user data');
    }
    const data = await response.json();
    return data;
  }

  async createHotel(name: string, location: string, description: string|null) {
    const response = await fetch(`${this.apiUrl}/hotel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ name, location, description })
    });
    if (!response.ok) {
      throw new Error('Invalid hotel data');
    }
    const data = await response.json();
    return data;
  }

  async createRoom(hotelId: string, params: any) {
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}/room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      throw new Error('Invalid room data');
    }
    const data = await response.json();
    return data;
  }

  async putRoomPhotos(roomId: string, photos: FormData) {
    const response = await fetch(`${this.apiUrl}/room/${roomId}/photos`, {
      method: 'PUT',
      headers: {
        // 'Content-Type': 'undefined',
        // 'Accept': '*/*',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: photos
    });
    if (!response.ok) {
      throw new Error('Invalid room data');
    }
    const data = await response.json();
    return data;
  }

  async deleteRoom(hotelId: string, roomId: string) {
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}/room/${roomId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    if (!response.ok) {
      throw new Error('Invalid hotel data');
    }
    const data = await response.json();
    return data;
  }

  async updateRoom(hotelId: string, roomId: string, params: any) {
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}/room/${roomId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      throw new Error('Invalid room data');
    }
    const data = await response.json();
    return data;
  }

  async updateHotel(hotelId: string, params: any) {
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(params)
    });
    if (!response.ok) {
      throw new Error('Invalid hotel data');
    }
    const data = await response.json();
    return data;
  }

  async putHotelPhotos(hotelId: string, photos: FormData) {
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}/photos`, {
      method: 'PUT',
      headers: {
        // 'Content-Type': 'undefined',
        // 'Accept': '*/*',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: photos
    });
    if (!response.ok) {
      throw new Error('Invalid hotel data');
    }
    const data = await response.json();
    return data;
  }

  async putProfilePhoto(photo: FormData) {
    const response = await fetch(`${this.apiUrl}/user/profile/photo`, {
      method: 'PUT',
      headers: {
        // 'Content-Type': 'undefined',
        // 'Accept': '*/*',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: photo
    });
    if (!response.ok) {
      throw new Error('Invalid hotel data');
    }
    const data = await response.json();
    return data;
  }

  async deleteHotelPhotos(hotelId: string) {
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}/photos`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    if (!response.ok) {
      throw new Error('Invalid hotel data');
    }
    const data = await response.json();
    return data;
  }

  async deleteRoomPhotos(roomId: string) {
    const response = await fetch(`${this.apiUrl}/room/${roomId}/photos`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    if (!response.ok) {
      throw new Error('Invalid room data');
    }
    const data = await response.json();
    return data;
  }

  async deleteHotel(hotelId: string) {
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    if (!response.ok) {
      throw new Error('Invalid hotel data');
    }
    const data = await response.json();
    return data;
  }

  async getRoom(roomId: string) {
    const response = await fetch(`${this.apiUrl}/room/${roomId}`);
    const data = await response.json();
    return data;
  }

  async getCustomerBookings() {
    const response = await fetch(`${this.apiUrl}/bookings/customer`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error('Invalid hotel data');
    }
    return data;
  }

  async getOwnerBookings() {
    const response = await fetch(`${this.apiUrl}/bookings/owner`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error('Invalid hotel data');
    }
    return data;
  }

  async bookRoom(roomId: string, checkInDate: string, checkOutDate: string) {
    const response = await fetch(`${this.apiUrl}/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ roomId, checkInDate, checkOutDate })
    });
    if (!response.ok) {
      throw new Error('Invalid booking data');
    }
    const data = await response.json();
    return data;
  }

  async payBooking(bookingId: string) {
    const response = await fetch(`${this.apiUrl}/booking/${bookingId}/pay`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    if (!response.ok) {
      throw new Error('Invalid booking data');
    }
    const data = await response.json();
    return data;
  }

  async cancelBooking(bookingId: string) {
    const response = await fetch(`${this.apiUrl}/booking/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    if (!response.ok) {
      throw new Error('Invalid booking data');
    }
    const data = await response.json();
    return data;
  }

  async deleteBooking(bookingId: string) {
    const response = await fetch(`${this.apiUrl}/booking/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    if (!response.ok) {
      throw new Error('Invalid booking data');
    }
    const data = await response.json();
    return data;
  }

  async rateHotel(hotelId: string, rating: number) {
    const response = await fetch(`${this.apiUrl}/hotel/${hotelId}/rate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ rating })
    });
    if (!response.ok) {
      throw new Error('Invalid rating data');
    }
    const data = await response.json();
    return data;
  }

  async updateBookingStatus(bookingId: string, status: string) {
    // if (!['approved', 'rejected'].includes(status)) {
      // throw new Error('Invalid status');
    // }
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);
    const url = `${this.apiUrl}/booking/${bookingId}?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      throw new Error('Invalid booking data');
    }
    const data = await response.json();
    return data;
  }
}