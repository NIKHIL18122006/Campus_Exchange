import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadImages } from '../middleware/upload.middleware.js';
import { validate, createListingSchema } from '../middleware/validation.middleware.js';
import { createListing } from '../controllers/listing.controller.js';

const router = Router();

router.post('/', requireAuth, uploadImages, validate(createListingSchema), createListing);

export default router;