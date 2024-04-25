const { User, Hotel, Room } = require('./models/models');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const responses = require('./responses');
const { generateRandomString } = require('./utils');


async function ensureDirectoryExists(directory) {
  const directoryPath = path.resolve(directory);

  try {
    await fs.promises.mkdir(directoryPath, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
    throw err;
  }
}

// example structure
// cdn/
//   static/
//     photos/  
//        profile/
//          {user_id}.jpg
//          ...
//        hotel/
//          [hotel_id]/
//            {random}.jpg
//            ...
//        ...
//        room/
//          [room_id]/
//            {random}.jpg
//            ...
//
const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/jfif', 'image/avif'];
const allowedSize = 1024 * 1024 * 5; // 5MB
const maxFiles = 5;

function multerBuilder(storage, maxFiles) {
  return multer({
    storage: storage,
    limits: { fileSize: allowedSize, files: maxFiles },
    fileFilter: (req, file, cb)  => {
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type: ' + file.mimetype + '. Only ' + allowedTypes.join(', ') + ' are allowed'));
      }
      cb(null, true);
    }
  });
}

function storageBuilder(directory, filenameGenerator) {
  return multer.diskStorage({
    destination: async function (req, file, cb) {
      await ensureDirectoryExists(directory);
      cb(null, directory);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname); // Extract file extension
      const filename = `${filenameGenerator(req)}${ext}`; // Generate filename
      cb(null, filename);
    }
  });
}

const profilePhotoUpload = (req) => {
  const storage = storageBuilder(
    'cdn/static/photos/profile',
    () => req.user.sub
  );
  return multerBuilder(storage, 1);
}

const hotelPhotoUpload = (req) => {
  const storage = storageBuilder(
    `cdn/static/photos/hotel/${req.params.hotelId}`,
    () => generateRandomString(10)
  );
  return multerBuilder(storage, maxFiles);
}

const roomPhotoUpload = (req) => {
  const storage = storageBuilder(
    `cdn/static/photos/room/${req.params.roomId}`,
    () => generateRandomString(10)
  );
  return multerBuilder(storage, maxFiles);
}


async function uploadProfilePhoto(req, res) {
  profilePhotoUpload(req).single('photo')(req, res, async (err) => {
    if (err) {
      return responses.error(res, 400, 'Bad Request');
    }
    const user = await User.findById(req.user.sub);
    user.profilePhoto = req.file.filename;
    await user.save();
    return responses.json(res, 200, { message: 'Photo uploaded successfully', photo: user.profilePhoto });
  });
}
async function deleteProfilePhoto(req, res) {
  const user = await User.findById(req.user.sub);
  if (user.profilePhoto === 'default.jpg') {
    return responses.error(res, 400, 'Bad Request', 'No photo to delete');
  }
  fs.unlink(`cdn/static/photos/profile/${user.profilePhoto}`, async (err) => {
    if (err) {
      return responses.error(res, 500, 'Internal Server Error');
    }
    user.profilePhoto = 'default.jpg';
    await user.save();
    responses.json(res, 200, { message: 'Photo deleted successfully' });
  });
}
async function uploadHotelPhotos(req, res) {
  hotelPhotoUpload(req).array("photos", maxFiles)(req, res, async (err) => {
    if (err) {
      return responses.error(res, 400, 'Bad Request');
    }
    if (!req.files){
      return responses.error(res, 400, 'Bad Request', 'No file uploaded');
    }
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return responses.error(res, 404, 'Not Found', 'Hotel not found');
    }
    if (hotel.owner.toString() !== req.user.sub) {
      return responses.error(res, 403, 'Forbidden', 'You are not allowed to upload photos for this hotel');
    }
    const photos = req.files.map((file) => file.filename);
    hotel.photos.push(...photos);
    await hotel.save();
    return responses.json(res, 200, { message: 'Photos uploaded successfully', photos: photos });
  });
}
async function deleteAllHotelPhotos(req, res) {
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) {
    return responses.error(res, 404, 'Not Found', 'Hotel not found');
  }
  if (hotel.owner.toString() !== req.user.sub) {
    return responses.error(res, 403, 'Forbidden', 'You are not allowed to delete photos for this hotel');
  }
  fs.rm(`cdn/static/photos/hotel/${req.params.hotelId}` , { recursive: true, force: true }, (err) => {
    if (err) {
      return responses.error(res, 500, 'Internal Server Error', 'Error deleting photos');
    }
  });
  hotel.photos = [];
  hotel.save().then(() => {
    return responses.json(res, 200, { message: 'Photos deleted successfully' });
  }).catch((err) => {
    console.log(err)
    responses.error(res, 500, 'Internal Server Error');
  });
}
async function uploadRoomPhotos(req, res) {
  roomPhotoUpload(req).array("photos", maxFiles)(req, res, async (err) => {
    if (!req.files){
      return responses.error(res, 400, 'Bad Request', 'No file uploaded');
    }
    if (err) {
      console.log(err)
      return responses.error(res, 400, 'Bad Request');
    }
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return responses.error(res, 404, 'Not Found', 'Room not found');
    }
    const hotel = await Hotel.findById({ _id: room.hotel });
    if (!hotel) {
      return responses.error(res, 404, 'Not Found', 'Hotel not found');
    }
    if (hotel.owner.toString() !== req.user.sub) {
      return responses.error(res, 403, 'Forbidden', 'You are not allowed to upload photos for this room');
    }
    const photos = req.files.map((file) => file.filename);
    room.photos.push(...photos);
    await room.save();
    return responses.json(res, 200, { message: 'Photos uploaded successfully', photos: photos });
  });
}
async function deleteAllRoomPhotos(req, res) {
  const room = await Room.findById(req.params.roomId);
  if (!room) {
    return responses.error(res, 404, 'Not Found', 'Room not found');
  }
  const hotel = await Hotel.findById(room.hotel);
  if (!hotel) {
    return responses.error(res, 404, 'Not Found', 'Hotel not found');
  }
  if (hotel.owner.toString() !== req.user.sub) {
    return responses.error(res, 403, 'Forbidden', 'You are not allowed to delete photos for this room');
  }
  fs.rm(`cdn/static/photos/room/${req.params.roomId}` , { recursive: true, force: true }, (err) => {
    if (err) {
      return responses.error(res, 500, 'Internal Server Error 2');
    }
  });
  room.photos = [];
  room.save().then(() => {
    return responses.json(res, 200, { message: 'Photos deleted successfully' });
  }).catch((err) => {
    responses.error(res, 500, 'Internal Server Error');
  });
}


module.exports = {
  uploadProfilePhoto,
  deleteProfilePhoto,
  uploadHotelPhotos,
  deleteAllHotelPhotos,
  uploadRoomPhotos,
  deleteAllRoomPhotos
}