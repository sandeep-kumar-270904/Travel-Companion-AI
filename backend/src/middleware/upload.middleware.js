import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const validateImageType = async (req, res, next) => {
  if (!req.file) {
    return next(); // Let the controller handle if file is required or not
  }

  try {
    const type = await fileTypeFromBuffer(req.file.buffer);
    
    if (!type || !type.mime.startsWith('image/')) {
      res.status(400);
      return next(new Error('Uploaded file must be a valid image'));
    }
    
    // Add verified mime type to the request file object
    req.file.verifiedMimeType = type.mime;
    next();
  } catch (error) {
    res.status(500);
    next(new Error('File verification failed'));
  }
};
