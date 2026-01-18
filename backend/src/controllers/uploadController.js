const cloudinary = require('../config/cloudinary');
const { sendSuccess } = require('../utils/responseUtils');
const AppError = require('../utils/AppError');
const multer = require('multer');

// Configure Multer to use memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
  }
});

/**
 * Upload single image to Cloudinary
 * @route POST /api/upload
 * @access Private
 */
const uploadImage = async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  try {
    // upload_stream requires a stream, so we convert buffer to stream
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'agri-rental/equipment',
      resource_type: 'auto'
    });

    sendSuccess(res, 200, 'Image uploaded successfully', {
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return next(new AppError('Image upload failed', 500));
  }
};

module.exports = {
  uploadMiddleware: upload.single('image'), // Expects field name 'image'
  uploadImage
};
