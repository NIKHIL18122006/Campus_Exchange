import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadImages } from '../middleware/upload.middleware.js';
import { validate, createListingSchema, validateQuery, browseListingsSchema  } from '../middleware/validation.middleware.js';
import { createListing, browseListings, getListing } from '../controllers/listing.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/', validateQuery(browseListingsSchema), browseListings);
router.get('/:id', getListing);
router.post('/', requireAuth, uploadImages, validate(createListingSchema), createListing);

export default router;