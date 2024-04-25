const express = require('express');
const router = express.Router();
const { protectedRoute } = require('../middlewares');

const { getAllRooms, getRoom, getHotelRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/room_controller');
const { uploadRoomPhotos, deleteAllRoomPhotos } = require('../storage');


// router.get('/rooms', getAllRooms);
router.get('/room/:roomId', getRoom);
router.get('/hotel/:hotelId/rooms', getHotelRooms);
router.post('/hotel/:hotelId/room', protectedRoute(['hotelOwner']), createRoom);
router.patch('/hotel/:hotelId/room/:roomId', protectedRoute(['hotelOwner']), updateRoom);
router.delete('/hotel/:hotelId/room/:roomId', protectedRoute(['hotelOwner']), deleteRoom);
router.put("/room/:roomId/photos",
  protectedRoute(["hotelOwner"]),
  uploadRoomPhotos
);
router.delete("/room/:roomId/photos",
  protectedRoute(["hotelOwner"]),
  deleteAllRoomPhotos
);

module.exports = router;