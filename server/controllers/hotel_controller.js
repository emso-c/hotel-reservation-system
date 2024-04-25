const fs = require('fs');
const { Hotel, Room } = require('../models/models');
const responses = require('../responses');



async function getHotels (req, res) {
  const hotels = await Hotel.find().select('name location rating description photos').populate('ratedBy', '-_id username')
  return responses.json(res, 200, hotels);
}
function createHotel(req, res) {
  if (!req.body.name || !req.body.location) {
    return responses.error(res, 400, 'Bad Request', 'Hotel name and location are required');
  }
  const hotel = new Hotel({
    name: req.body.name,
    location: req.body.location,
    description: req.body.description || '',
    owner: req.user.sub
  });
  hotel.save()
    .then((newHotel) => {
      return responses.json(res, 201, { message: 'Hotel created successfully', data: newHotel });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return responses.error(res, 400, 'Bad Request', 'Invalid hotel data');
      }
      if (err.name === 'CastError') {
        return responses.error(res, 400, 'Bad Request', 'Invalid user ID');
      }
      if (err.code === 11000) {
        return responses.error(res, 400, 'Bad Request', `Hotel with name "${req.body.name}" already exists`);
      }
      responses.error(res, 500, 'Internal Server Error');
    });
}
async function updateHotel (req, res) {
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) {
    return responses.error(res, 404, 'Not Found', 'Hotel not found');
  }
  if (hotel.owner.toString() !== req.user.sub) {
    return responses.error(res, 403, 'Forbidden', 'You are not allowed to edit this hotel');
  }
  if (req.body.name) {
    hotel.name = req.body.name;
  }
  if (req.body.location) {
    hotel.location = req.body.location;
  }
  if (req.body.description) {
    hotel.description = req.body.description;
  }
  hotel.save()
    .then((updatedHotel) => {
      return responses.json(res, 200, { message: 'Hotel updated successfully', data: updatedHotel });
    })
    .catch((err) => {
      responses.error(res, 500, 'Internal Server Error');
    });
}
function deleteHotel(req, res) {
  const rooms = Room.find({ hotel: req.params.hotelId });
  if (rooms.length > 0) {
    return responses.error(res, 400, 'Bad Request', 'Hotel has rooms. Delete rooms first');
  }
  Hotel.findByIdAndDelete(req.params.hotelId)
    .then((hotel) => {
      if (!hotel) {
        return responses.error(res, 404, 'Not Found', 'Hotel not found');
      }
      if (hotel.owner.toString() !== req.user.sub) {
        return responses.error(res, 403, 'Forbidden', 'You are not allowed to delete this hotel');
      }
      fs.rm(`cdn/static/photos/hotel/${req.params.hotelId}` , { recursive: true, force: true }, (err) => {
        if (err) {
          return responses.error(res, 500, 'Internal Server Error 2');
        }
      });
      return responses.json(res, 200, { message: 'Hotel deleted successfully' });
    })
    .catch((err) => {
      responses.error(res, 500, 'Internal Server Error');
    });
}
// customer only
function updateRating(req, res) {
  Hotel.findById(req.params.hotelId)
    .then((hotel) => {
      if (!hotel) {
        return responses.error(res, 404, 'Not Found', 'Hotel not found');
      }
      if (!req.body.rating || req.body.rating < 0 || req.body.rating > 5) {
        return responses.error(res, 400, 'Bad Request', 'Invalid rating');
      }
      // check if user is the owner of the hotel
      if (hotel.owner.toString() === req.user.sub) {
        return responses.error(res, 403, 'Forbidden', 'You are not allowed to rate your own hotel');
      }
      // check if user is a customer
      if (req.user.role !== 'customer') {
        return responses.error(res, 403, 'Forbidden', 'You are not allowed to rate hotels');
      }
      // check if user already rated the hotel
      if (hotel.ratedBy.includes(req.user.sub)) {
        return responses.error(res, 400, 'Bad Request', 'You have already rated this hotel');
      }
      // check if user has booked a room in the hotel
      // TODO FIX
      // const approvedBookings = Booking.find({ user: req.user.sub, status: 'approved', isPaid: true});
      // if (approvedBookings.length > 0) {
      //   const roomIds = approvedBookings.map((booking) => booking.room);
      //   if (!roomIds.includes(hotel._id)) {
      //     return responses.error(res, 403, 'Forbidden', 'You have not booked a room in this hotel');
      //   }
      // } else {
      //   return responses.error(res, 403, 'Forbidden', 'You do not have any approved and paid bookings');
      // }

      hotel.ratedBy.push(req.user.sub);
      hotel.rating = (hotel.rating * (hotel.ratedBy.length - 1) + req.body.rating) / hotel.ratedBy.length;
      hotel.save()
        .then(() => {
          return responses.json(res, 200, { message: 'Rating updated successfully' });
        })
        .catch((err) => {
          responses.error(res, 500, 'Internal Server Error');
        });
    })
    .catch((err) => {
      responses.error(res, 500, 'Internal Server Error');
    });
}
async function getHotelsWithQuery(req, res) {
  // example query: /hotel/search?location=lagos&capacity=2&fromDate=2021-12-01&toDate=2021-12-10&minPrice=100&maxPrice=500
  // required query params: location, fromDate, capacity
  // optional query params: toDate, minPrice, maxPrice, type

  if (!req.query.location || !req.query.fromDate || !req.query.capacity) {
    return responses.error(res, 400, 'Bad Request', 'Location, fromDate, and capacity are required');
  }
  if (req.query.capacity < 1 || req.query.capacity > 5) {
    return responses.error(res, 400, 'Bad Request', 'Invalid capacity');
  }
  if (req.query.minPrice && req.query.minPrice < 0) {
    return responses.error(res, 400, 'Bad Request', 'Invalid minPrice');
  }
  if (req.query.maxPrice && req.query.maxPrice < 0) {
    return responses.error(res, 400, 'Bad Request', 'Invalid maxPrice');
  }
  if (req.query.minPrice && req.query.maxPrice && req.query.minPrice > req.query.maxPrice) {
    return responses.error(res, 400, 'Bad Request', 'minPrice cannot be greater than maxPrice');
  }
  if (req.query.type && !['single', 'double', 'suite'].includes(req.query.type)) {
    return responses.error(res, 400, 'Bad Request', 'Invalid room type');
  }
  if (req.query.fromDate < new Date()) {
    return responses.error(res, 400, 'Bad Request', 'Invalid fromDate');
  }
  if (req.query.toDate && req.query.toDate < req.query.fromDate) {
    return responses.error(res, 400, 'Bad Request', 'Invalid toDate');
  }
  const roomQuery = {
    capacity: req.query.capacity,
    availableFrom: { $lte: new Date(req.query.fromDate) },
  };
  if (req.query.toDate) {
    roomQuery.$or = [
      { availableTo: { $gte: new Date(req.query.toDate) } },
      { availableTo: null }
    ];
  }
  if (req.query.minPrice) {
    roomQuery.price = { $gte: req.query.minPrice };
  }
  if (req.query.maxPrice) {
    roomQuery.price = { $lte: req.query.maxPrice };
  }
  if (req.query.minPrice && req.query.maxPrice) {
    roomQuery.price = { $gte: req.query.minPrice, $lte: req.query.maxPrice };
  }
  if (req.query.type) {
    roomQuery.type = req.query.type;
  }
  const rooms = await Room.find(roomQuery).select().populate('hotel', '-__v -owner -createdAt -updatedAt');
  if (!rooms || rooms.length === 0) {
    return responses.json(res, 200, []);
  }

  const hotels = rooms.filter((room) => {
    return room.hotel && room.hotel.location.toLowerCase().includes(req.query.location.toLowerCase());
  }).map((room) => room.hotel)
  .filter((hotel, index, self) =>
    index === self.findIndex((h) => (
      h._id === hotel._id
    ))
  );

  return responses.json(res, 200, hotels);
}

async function getMyHotels(req, res) {
  const hotels = await Hotel.find({ owner: req.user.sub }).select('name location rating description photos ratedBy');
  return responses.json(res, 200, hotels);
}

async function getHotel(req, res) {
  const hotel = await Hotel.findById(req.params.hotelId).select('name location rating description photos ratedBy').populate('ratedBy', '-_id username')
  if (!hotel) {
    return responses.error(res, 404, 'Not Found', 'Hotel not found');
  }
  return responses.json(res, 200, hotel);
}


module.exports = {
  getHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  updateRating,
  getHotelsWithQuery,
  getMyHotels,
  getHotel
};
