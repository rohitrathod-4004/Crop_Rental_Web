const express = require('express');
const {
  createEquipment,
  getOwnerEquipment,
  getEquipmentById,
  updateEquipment,
  toggleEquipmentStatus,
  deleteEquipment,
  listEquipment,
  getEquipmentTypes
} = require('../controllers/equipmentController');
const { protect, restrictTo, verifyOwnerApproved } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Public routes
router.get('/', asyncHandler(listEquipment));
router.get('/types', asyncHandler(getEquipmentTypes));
router.get('/:id', asyncHandler(getEquipmentById));

// Owner routes (require verification)
router.post(
  '/',
  protect,
  restrictTo('OWNER'),
  verifyOwnerApproved,
  asyncHandler(createEquipment)
);

router.get(
  '/owner/my-equipment',
  protect,
  restrictTo('OWNER'),
  asyncHandler(getOwnerEquipment)
);

router.put(
  '/:id',
  protect,
  restrictTo('OWNER'),
  verifyOwnerApproved,
  asyncHandler(updateEquipment)
);

router.patch(
  '/:id/toggle-status',
  protect,
  restrictTo('OWNER'),
  verifyOwnerApproved,
  asyncHandler(toggleEquipmentStatus)
);

router.delete(
  '/:id',
  protect,
  restrictTo('OWNER'),
  verifyOwnerApproved,
  asyncHandler(deleteEquipment)
);

module.exports = router;
