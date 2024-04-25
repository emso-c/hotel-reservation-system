const { Booking, Room, Hotel } = require('../models/models');
const responses = require('../responses');

async function getAllBookings(req, res) {
  const bookings = await Booking.find().select('user room checkInDate checkOutDate totalPrice status isPaid');
  return responses.json(res, 200, bookings);
}
async function getCustomerBookings(req, res) {
  const bookings = await Booking.find({ user: req.user.sub }).select('room checkInDate checkOutDate totalPrice status isPaid');
  return responses.json(res, 200, bookings);
}
async function getOwnerBookings(req, res) {
  const hotelsOfOwner = await Hotel.find({ owner: req.user.sub }).select('_id');
  if (!hotelsOfOwner) {
    return responses.json(res, 200, []);
  }
  const hotelIds = hotelsOfOwner.map((hotel) => hotel._id);
  const roomsOfOwner = await Room.find({ hotel: { $in: hotelIds } }).select('_id');
  if (!roomsOfOwner) {
    return responses.json(res, 200, []);
  }
  const roomIds = roomsOfOwner.map((room) => room._id);
  const bookings = await Booking.find({ room: { $in: roomIds } }).select('user room checkInDate checkOutDate totalPrice status isPaid');
  return responses.json(res, 200, bookings);
}

function createBooking(req, res) {
  const fields = ['roomId', 'checkInDate', 'checkOutDate'];
  for (const field of fields) {
    if (!req.body[field]) {
      return responses.error(res, 400, 'Bad Request', `${field} is required`);
    }
  }
  if (req.body.checkInDate < new Date()) {
    return responses.error(res, 400, 'Bad Request', 'Invalid check-in date');
  }
  if (new Date(req.body.checkOutDate) < new Date(req.body.checkInDate)) {
    return responses.error(res, 400, 'Bad Request', 'Invalid check-out date');
  }
  Room.findById(req.body.roomId)
    .then(async (room) => {
      if (!room) {
        return responses.error(res, 404, 'Not Found', 'Room not found');
      }
      const hotel = await Hotel.findById(room.hotel);
      if (!hotel) {
        return responses.error(res, 404, 'Not Found', 'Hotel not found');
      }
      // check if room is available throughout the booking period
      if (req.body.checkInDate < room.availableFrom || (room.availableTo && req.body.checkOutDate > room.availableTo)) {
        return responses.error(res, 400, 'Bad Request', 'Room is not available throughout the booking period');
      }

      checkin = new Date(req.body.checkInDate)
      checkout = new Date(req.body.checkOutDate)

      // check if user has another booking during the same period
      const bookings = await Booking.find({ user: req.user.sub });
      if (bookings.some((booking) => {
        return ((checkin >= booking.checkInDate && checkin < booking.checkOutDate) ||
          (checkout > booking.checkInDate && checkout <= booking.checkOutDate) ||
          (checkin <= booking.checkInDate && checkout >= booking.checkOutDate)) &&
          (booking.status == 'approved' && !booking.isPaid) &&
          (booking.status == 'pending' && booking.isPaid)
      })) {
        return responses.error(res, 400, 'Bad Request', 'You already have a booking during this period');
      }

      totalPrice = room.price * ((checkout - checkin) / (1000 * 60 * 60 * 24))
      const booking = new Booking({
        user: req.user.sub,
        room: req.body.roomId,
        checkInDate: checkin,
        checkOutDate: checkout,
        totalPrice: totalPrice,
      });

      // update room availability
      room.availableFrom = checkout;
      room.availableTo = null;
      room.save()
      
      booking.save()
        .then(() => {
          return responses.json(res, 201, { message: 'Booking created successfully', data: booking });
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            console.log(err)
            return responses.error(res, 400, 'Bad Request', 'Invalid booking data');
          }
          if (err.name === 'CastError') {
            return responses.error(res, 400, 'Bad Request', 'Invalid room ID');
          }
          return responses.error(res, 500, 'Internal Server Error');
        });
    })
    .catch((err) => {
      responses.error(res, 500, 'Internal Server Error');
    });
}
async function cancelBooking(req, res) {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    return responses.error(res, 404, 'Not Found', 'Booking not found');
  }
  if (booking.user.toString() !== req.user.sub) {
    return responses.error(res, 403, 'Forbidden', 'You are not allowed to cancel this booking');
  }
  if (booking.status === 'approved') {
    return responses.error(res, 400, 'Bad Request', 'Cannot cancel an approved booking');
  }
  if (booking.status === 'cancelled') {
    return responses.error(res, 400, 'Bad Request', 'Booking is already cancelled');
  }
  if (booking.status === 'rejected') {
    return responses.error(res, 400, 'Bad Request', 'Cannot cancel a rejected booking');
  }
  else if (booking.isPaid) {
    // users should be able to cancel paid bookings (maybe with a fee)
    return responses.error(res, 400, 'Bad Request', 'Cannot cancel a paid booking');
  }
  // instead of deleting the booking, set status to cancelled
  booking.status = 'cancelled';

  // update room availability
  const room = await Room.findById(booking.room); 
  room.availableFrom = new Date();
  room.availableTo = null

  room.save()
  booking.save()
    .then(() => {

      return responses.json(res, 200, { message: 'Booking cancelled successfully' });
    })
    .catch((err) => {
      responses.error(res, 500, 'Internal Server Error');
    });
}
async function updateBookingStatus(req, res) {
  // get status from query params like: /booking/123?status=approved
  const status = req.query.status;
  if (!status || !['approved', 'rejected'].includes(status)) {
    return responses.error(res, 400, 'Bad Request', 'Invalid status');
  }
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    return responses.error(res, 404, 'Not Found', 'Booking not found');
  }
  const room = await Room.findById(booking.room);
  if (!room) {
    return responses.error(res, 404, 'Not Found', 'Room not found');
  }
  const hotel = await Hotel.findById(room.hotel);
  if (!hotel) {
    return responses.error(res, 404, 'Not Found', 'Hotel not found');
  }
  if (hotel.owner.toString() !== req.user.sub) {
    return responses.error(res, 403, 'Forbidden', 'You are not allowed to reject this booking');
  }
  if (booking.status === 'rejected' && status === 'rejected') {
    return responses.error(res, 400, 'Bad Request', 'Booking is already rejected');
  }
  if (booking.status === 'approved' && status === 'approved') {
    return responses.error(res, 400, 'Bad Request', 'Booking is already approved');
  }

  try{
    booking.status = status;
    await booking.save()

    if (status === 'approved') {
      room.availableFrom = booking.checkOutDate;
      room.availableTo = null;
      await room.save();
    }
    if (status === 'rejected') {
      room.availableFrom = new Date();
      room.availableTo = null;
      await room.save();
    }
    return responses.json(res, 200, { message: 'Booking status updated successfully', data: booking });
  }
  catch(err){
    responses.error(res, 500, 'Internal Server Error');
  }
}
async function payBooking(req, res) {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    return responses.error(res, 404, 'Not Found', 'Booking not found');
  }
  if (booking.user.toString() !== req.user.sub) {
    return responses.error(res, 403, 'Forbidden', 'You are not allowed to pay for this booking');
  }
  // if (booking.status === 'approved') {
  //   return responses.error(res, 400, 'Bad Request', 'Booking is already approved');
  if (booking.status === 'cancelled') {
    return responses.error(res, 400, 'Bad Request', 'Cannot pay for a cancelled booking');
  } else if (booking.status === 'rejected') {
    return responses.error(res, 400, 'Bad Request', 'Cannot pay for a rejected booking');
  }
  if (booking.isPaid) {
    return responses.error(res, 400, 'Bad Request', 'Booking is already paid');
  }
  booking.isPaid = true;
  booking.save()
    .then(() => {
      return responses.json(res, 200, { message: 'Booking paid successfully' });
    })
    .catch((err) => {
      responses.error(res, 500, 'Internal Server Error');
    });
}
async function deleteBooking(req, res) {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) {
    return responses.error(res, 404, 'Not Found', 'Booking not found');
  }
  if (booking.user.toString() !== req.user.sub) {
    return responses.error(res, 403, 'Forbidden', 'You are not allowed to delete this booking');
  }
  // if (booking.status !== 'cancelled' && booking.status !== 'rejected') {
  //   return responses.error(res, 400, 'Bad Request', 'Can only delete cancelled or rejected bookings');
  // }
  Booking.findByIdAndDelete(req.params.bookingId)
    .then((booking) => {
      if (!booking) {
        return responses.error(res, 404, 'Not Found', 'Booking not found');
      }
      return responses.json(res, 200, { message: 'Booking deleted successfully' });
    })
    .catch((err) => {
      responses.error(res, 500, 'Internal Server Error');
    });
}

// TODO implement this
// function updateAvailabilityAccordingToBooking(checkin, checkout, room) {
//   if (checkin < room.availableFrom) {
//     room.availableFrom = checkin;
//   }
//   if (room.availableTo && checkout > room.availableTo) {
//     room.availableTo = checkout;
//   }
//   room.save();
// }


module.exports = {
  getAllBookings,
  getCustomerBookings,
  getOwnerBookings,
  createBooking,
  cancelBooking,
  updateBookingStatus,
  payBooking,
  deleteBooking,
};