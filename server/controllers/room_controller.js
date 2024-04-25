const fs = require('fs');
const { Room, Hotel } = require('../models/models');
const responses = require('../responses');


async function getAllRooms(req, res) {
  const rooms = await Room.find();
  return responses.json(res, 200, rooms);
}
function createRoom(req, res) {
  if (!req.params.hotelId) {
    return responses.error(res, 400, 'Bad Request', 'Hotel ID is required');
  }
  const fields = ['roomName', 'type', 'capacity', 'price', 'availableFrom'];
  for (const field of fields) {
    if (!req.body[field]) {
      return responses.error(res, 400, 'Bad Request', `${field} is required`);
    }
  }
  if (req.body.capacity < 1 || req.body.capacity > 5) {
    return responses.error(res, 400, 'Bad Request', 'Invalid capacity');
  }
  if (req.body.price < 0) {
    return responses.error(res, 400, 'Bad Request', 'Invalid price');
  }
  if (req.body.availableFrom < new Date()) {
    return responses.error(res, 400, 'Bad Request', 'Invalid available from date');
  }
  if (req.body.availableTo && req.body.availableTo < req.body.availableFrom) {
    return responses.error(res, 400, 'Bad Request', 'Invalid available to date');
  }

  Hotel.findById(req.params.hotelId)
    .then(async (hotel) => {
      if (!hotel) {
        return responses.error(res, 404, 'Not Found', 'Hotel not found');
      }
      if (hotel.owner.toString() !== req.user.sub) {
        return responses.error(res, 403, 'Forbidden', 'You are not allowed to add rooms to this hotel');
      }
      const duplicateRoom = await Room.findOne({ roomName: req.body.roomName, hotel: req.params.hotelId })
      if (duplicateRoom) {
        return responses.error(res, 400, 'Bad Request', 'Room with this name already exists in this hotel');
      }

      const room = new Room({
        roomName: req.body.roomName,
        type: req.body.type,
        capacity: req.body.capacity,
        price: req.body.price,
        availableFrom: req.body.availableFrom,
        availableTo: req.body.availableTo || null,
        amenities: req.body.amenities || [],
        hotel: req.params.hotelId,
      });
      room.save()
        .then((newRoom) => {
          return responses.json(res, 201, { message: 'Room created successfully', data: newRoom});
        })
        .catch((err) => {
          if (err.name === 'ValidationError') {
            return responses.error(res, 400, 'Bad Request', 'Invalid room data');
          }
          if (err.name === 'CastError') {
            return responses.error(res, 400, 'Bad Request', 'Invalid hotel ID');
          }
          if (err.code === 11000) {
            return responses.error(res, 400, 'Bad Request', `Room with name "${req.body.roomName}" already exists in this hotel`);
          }
          return responses.error(res, 500, 'Internal Server Error');
        });
    })
    .catch((err) => {
      responses.error(res, 500, 'Internal Server Error');
    });
}
async function getHotelRooms(req, res) {
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) {
    return responses.error(res, 404, 'Not Found', 'Hotel not found');
  }
  const rooms = await Room.find({ hotel: req.params.hotelId }).select('roomName type capacity price availableFrom availableTo amenities photos');
  if (!rooms) {
    return responses.error(res, 404, 'Not Found', 'No rooms found for this hotel');
  }
  return responses.json(res, 200, rooms);
}
async function updateRoom(req, res) {
  const room = await Room.findById(req.params.roomId);
  if (!room) {
    return responses.error(res, 404, 'Not Found', 'Room not found');
  }
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) {
    return responses.error(res, 404, 'Not Found', 'Hotel not found');
  }
  if (hotel.owner.toString() !== req.user.sub) {
    return responses.error(res, 403, 'Forbidden', 'You are not allowed to edit this room');
  }
  if (req.body.roomName) {
    room.roomName = req.body.roomName;
  }
  if (req.body.type) {
    room.type = req.body.type;
  }
  if (req.body.capacity) {
    room.capacity = req.body.capacity;
  }
  if (req.body.price) {
    room.price = req.body.price;
  }
  if (req.body.availableFrom) {
    room.availableFrom = req.body.availableFrom;
  }
  if (req.body.availableTo) {
    room.availableTo = req.body.availableTo;
  }
  if (req.body.amenities) {
    room.amenities = req.body.amenities;
  }
  room.save()
    .then((newRoom) => {
      return responses.json(res, 200, { message: 'Room updated successfully', data: newRoom });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return responses.error(res, 400, 'Bad Request', 'Invalid room data');
      }
      if (err.name === 'CastError') {
        return responses.error(res, 400, 'Bad Request', 'Invalid hotel ID or room ID');
      }
      if (err.code === 11000) {
        return responses.error(res, 400, 'Bad Request', `Room with name "${req.body.roomName}" already exists in this hotel`);
      }
      responses.error(res, 500, 'Internal Server Error');
    });
}
async function deleteRoom(req, res) {
  const room = await Room.findById(req.params.roomId);
  if (!room) {
    return responses.error(res, 404, 'Not Found', 'Room not found');
  }
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) {
    return responses.error(res, 404, 'Not Found', 'Hotel not found');
  }
  if (hotel.owner.toString() !== req.user.sub) {
    return responses.error(res, 403, 'Forbidden', 'You are not allowed to delete this room');
  }
  Room.findByIdAndDelete(req.params.roomId)
    .then((room) => {
      if (!room) {
        return responses.error(res, 404, 'Not Found', 'Room not found');
      }
      fs.rm(`cdn/static/photos/room/${req.params.roomId}` , { recursive: true, force: true }, (err) => {
        if (err) {
          return responses.error(res, 500, 'Internal Server Error 2');
        }
      });
      return responses.json(res, 200, { message: 'Room deleted successfully' });
    })
    .catch((err) => {
      responses.error(res, 500, 'Internal Server Error');
    });
}

async function getRoom(req, res) {
  const room = await Room.findById(req.params.roomId).select('roomName type capacity price availableFrom availableTo amenities photos hotel');
  if (!room) {
    return responses.error(res, 404, 'Not Found', 'Room not found');
  }
  return responses.json(res, 200, room);
}




module.exports = {
  getAllRooms,
  createRoom,
  getHotelRooms,
  updateRoom,
  deleteRoom,
  getRoom
};