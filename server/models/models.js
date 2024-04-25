const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePhoto: {
      type: String,
      default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['customer', 'hotelOwner'],
        default: 'customer'
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const hotelSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
        max: 5
    },
    photos: {
      type: [String],
      required: false,
      default: [],
    },
    description: {
      type: String,
      required: false,
      default: ''
    },
    // only users can rate the hotel
    ratedBy: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        required: false,
        default: []
    },
    // user.role must be hotelOwner
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

const Hotel = mongoose.model('Hotel', hotelSchema);

const roomSchema = new Schema({
    roomName: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['single', 'double', 'suite'],
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    availableFrom: {
        type: Date,
        required: true
    },
    availableTo: {
        type: Date,
        required: false,
        default: null
    },
    amenities: {
        type: [String],
        required: false,
        default: []
    },
    photos: {
        type: [String],
        required: false,
        default: []
    },
    hotel: {
        type: Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

const bookingSchema = new Schema({
  // user.role must be customer
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    isPaid: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = {
    User,
    Hotel,
    Room,
    Booking
};
