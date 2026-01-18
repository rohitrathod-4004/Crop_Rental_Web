const express = require('express');
const { uploadImage, uploadMiddleware } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Protect all upload routes
router.use(protect);

router.post('/', uploadMiddleware, asyncHandler(uploadImage));

module.exports = router;
