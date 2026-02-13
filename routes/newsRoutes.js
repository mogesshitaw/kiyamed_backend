// routes/newsRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  createNews,
  getNews,
  getNewsByIdController,
  updateNews,
  deleteNews,
  updateImageOrder,
  removeImage,
  getImages,
  uploadImage,
  deleteImage
} from "../controllers/newsController.js";
import { authenticateToken, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure Multer for multiple files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // Max 10 files
  }
});

// Public routes
router.get("/", getNews);
router.get("/:id", getNewsByIdController);
router.get("/images/all", getImages);

// Protected admin routes
router.post("/", 
  authenticateToken, 
  authorizeAdmin, 
  upload.array("images", 10), 
  createNews
);

router.put("/:id", 
  authenticateToken, 
  authorizeAdmin, 
  upload.array("images", 10), 
  updateNews
);

router.patch("/:id/images/order", 
  authenticateToken, 
  authorizeAdmin, 
  updateImageOrder
);

router.delete("/:newsId/images/:imageId", 
  authenticateToken, 
  authorizeAdmin, 
  removeImage
);

router.delete("/:id", 
  authenticateToken, 
  authorizeAdmin, 
  deleteNews
);

// Image management routes
router.post("/images/upload", 
  authenticateToken, 
  authorizeAdmin, 
  upload.single("image"), 
  uploadImage
);

router.delete("/images/:id", 
  authenticateToken, 
  authorizeAdmin, 
  deleteImage
);

export default router;