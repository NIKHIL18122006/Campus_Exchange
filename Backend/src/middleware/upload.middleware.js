import multer from 'multer';

export const uploadImages = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 4}, // Limit file size to 5MB and number of files to 4
    fileFilter: (req, file, cb) => {
        if(!file.mimetype.startsWith('image/')) {
            return cb(new Error('INVALID_FILE_TYPE'));
        }
        cb(null, true);
    }
}).array('images', 4);