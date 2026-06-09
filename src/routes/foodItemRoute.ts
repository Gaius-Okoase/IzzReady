import multer from 'multer';
import { Router } from 'express';
import { isOwner } from '../middleware/auth.js';
import {
  createFoodItemsValidator,
  updateFoodItemDetailValidator,
  updateFoodItemStatusValidator,
} from '../middleware/foodItemValidator.js';
import {
  createFoodItemsController,
  getFoodMenuController,
  updateFoodItemController,
  deleteFoodItemController,
  createCustomFoodItemController,
} from '../controllers/foodItemControllers.js';
import { AppError } from '../utils/AppError.js';
import { uploadToCloudinary } from '../middleware/upload.js';

const router = Router({ mergeParams: true });

/* Config multer to buffer file images */
// Specify allowed types
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  //Filter out non-image files
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype))
      return cb(new AppError(400, 'Only image files are allowed'));

    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5, //5 MB
    //parts: 2
  },
});

// ROUTES
router.post('/create', isOwner, createFoodItemsValidator, createFoodItemsController);
router.get('/', getFoodMenuController);
router.post(
  '/custom',
  isOwner,
  upload.single('image'),
  uploadToCloudinary,
  createCustomFoodItemController
);
router.patch(
  '/:itemId/details',
  isOwner,
  upload.single('image'),
  uploadToCloudinary,
  updateFoodItemDetailValidator,
  updateFoodItemController
);
router.patch('/:itemId/status', isOwner, updateFoodItemStatusValidator, updateFoodItemController);
router.delete('/:itemId', isOwner, deleteFoodItemController);

export default router;
