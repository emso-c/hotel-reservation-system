
export interface Hotel {
    _id: string;
    name: string;
    location: string;
    rating: number;
    photos: string[];
    description: string;
    ratedBy: object[];
}

export interface HotelWithLowestPrice extends Hotel {
    lowestPrice: number;
}

export interface Room {
    _id: string;
    roomName: string;
    type: string;
    capacity: number;
    price: number;
    availableFrom: Date;
    availableTo: Date|null;
    amenities: string[];
    photos: string[];
    hotel: string;
}

export interface Booking {
    _id: string;
    userID: string;
    roomID: string;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
    status: string;
    isPaid: boolean;
}

export interface BookingWithHotelAndRoom extends Booking {
    hotel: Hotel;
    room: Room;
}

export interface State {
  loading: boolean;
  error: boolean;
  initialSearch: boolean;
}

export interface Profile {
  _id: string;
  email: string;
  username: string;
  role: string;
  profilePhoto: string|null;
}