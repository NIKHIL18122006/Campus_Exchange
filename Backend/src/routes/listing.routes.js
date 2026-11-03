import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadImages } from '../middleware/upload.middleware.js';
import { validate, createListingSchema, validateQuery, browseListingsSchema, updateStatusSchema  } from '../middleware/validation.middleware.js';
import { createListing, browseListings, getListing, getMyListings, updateListingStatus, deleteListing } from '../controllers/listing.controller.js';
import { expressInterest } from '../controllers/conversation.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', validateQuery(browseListingsSchema), browseListings);
router.get('/:id', getListing);
router.get('/mine', getMyListings);
router.post('/', requireAuth, uploadImages, validate(createListingSchema), createListing);
router.patch('/:id/status', validate(updateStatusSchema), updateListingStatus);
router.delete('/:id', deleteListing);
router.post('/:id/interest', expressInterest);


export default router;