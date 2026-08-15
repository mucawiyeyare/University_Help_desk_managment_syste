const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only jpeg, jpg, png, pdf, docx allowed.'), false);
  }
};

const avatarFileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid profile image. Please upload a JPG, PNG, WEBP, or GIF image.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.UPLOAD_MAX_SIZE || 5242880) },
  fileFilter: fileFilter,
});

upload.uploadFields = upload.fields([
  { name: 'attachments', maxCount: 5 },
  { name: 'avatar', maxCount: 1 },
]);

// Profile images use a stricter image-only filter than ticket attachments.
upload.avatar = multer({
  storage,
  limits: { fileSize: parseInt(process.env.UPLOAD_MAX_SIZE || 5242880) },
  fileFilter: avatarFileFilter,
}).single('avatar');

module.exports = upload;
