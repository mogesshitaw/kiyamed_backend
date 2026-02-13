// controllers/newsController.js
import path from "path";
import fs from "fs";
import pool from "../config/db.js";

import {
  createNews as createNewsModel,
  createImage,
  getAllNews,
  getNewsById,
  updateNews as updateNewsModel,
  deleteNews as deleteNewsModel,
  updateNewsImagesOrder,
  removeImageFromNews,
  getAllImages,
  getImageById,
  deleteImage as deleteImageModel
} from "../models/newsModel.js";

const UPLOAD_DIR = "uploads";

// Helper function to delete file
const removeFileIfExists = (filename) => {
  if (!filename) return;
  const p = path.join(process.cwd(), UPLOAD_DIR, filename);
  if (fs.existsSync(p)) {
    try { 
      fs.unlinkSync(p); 
    } catch (err) { 
      console.warn("Failed to delete file", p, err); 
    }
  }
};

// Create news with multiple images
export const createNews = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { title, content, category_id, author } = req.body;
    const files = req.files || [];
    
    if (!title || !content) {
      // Cleanup uploaded files if validation fails
      files.forEach(file => removeFileIfExists(file.filename));
      return res.status(400).json({ message: "Title and content are required" });
    }
    
    // 1. Save images to Image table
    const imageIds = [];
    for (const file of files) {
      const imageId = await createImage(file.filename);
      imageIds.push(imageId);
    }
    
    // 2. Create news with image references
    const result = await createNewsModel({ 
      title, 
      content, 
      category_id: category_id || null, 
      author: author || null,
      image_ids: imageIds 
    });
    
    await connection.commit();
    
    res.status(201).json({ 
      message: "News created successfully", 
      id: result.insertId,
      imageCount: result.imageCount 
    });
    
  } catch (err) {
    await connection.rollback();
    
    // Cleanup uploaded files on error
    if (req.files) {
      req.files.forEach(file => removeFileIfExists(file.filename));
    }
    
    console.error(err);
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

// Get all news
export const getNews = async (req, res) => {
  try {
    const rows = await getAllNews();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get news by ID
export const getNewsByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const row = await getNewsById(id);
    if (!row) return res.status(404).json({ message: "News not found" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update news with multiple images
export const updateNews = async (req, res) => {
  try {
    const id = req.params.id;
    const { 
      title, 
      content, 
      category_id, 
      author, 
      new_image_ids = [], 
      removed_image_ids = [] 
    } = req.body;
    const files = req.files || [];
    
    const existing = await getNewsById(id);
    if (!existing) {
      // Cleanup uploaded files if news not found
      files.forEach(file => removeFileIfExists(file.filename));
      return res.status(404).json({ message: "News not found" });
    }
    
    // Process new image uploads
    const uploadedImageIds = [];
    for (const file of files) {
      const imageId = await createImage(file.filename);
      uploadedImageIds.push(imageId);
    }
    
    // Combine new image IDs
    const allNewImageIds = [...uploadedImageIds, ...(new_image_ids || [])];
    
    const payload = {
      title: title ?? existing.title,
      content: content ?? existing.content,
      category_id: category_id ?? existing.category_id,
      author: author ?? existing.author,
      image_ids: allNewImageIds,
      removed_image_ids: removed_image_ids || []
    };
    
    const result = await updateNewsModel(id, payload);
    
    res.json({ 
      message: "News updated successfully",
      addedImages: uploadedImageIds.length,
      removedImages: removed_image_ids?.length || 0
    });
    
  } catch (err) {
    // Cleanup uploaded files on error
    if (req.files) {
      req.files.forEach(file => removeFileIfExists(file.filename));
    }
    
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update image order
export const updateImageOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body; // Array of {image_id, sort_order, is_featured}
    
    if (!Array.isArray(images)) {
      return res.status(400).json({ message: "Images array is required" });
    }
    
    const result = await updateNewsImagesOrder(id, images);
    res.json({ message: "Image order updated successfully" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Remove single image from news
export const removeImage = async (req, res) => {
  try {
    const { newsId, imageId } = req.params;
    
    const existingNews = await getNewsById(newsId);
    if (!existingNews) {
      return res.status(404).json({ message: "News not found" });
    }
    
    const imageInNews = existingNews.images.find(img => img.id == imageId);
    if (!imageInNews) {
      return res.status(404).json({ message: "Image not found in this news" });
    }
    
    const result = await removeImageFromNews(newsId, imageId);
    
    // Delete the physical file if image is no longer used
    removeFileIfExists(imageInNews.image);
    
    res.json({ message: "Image removed from news successfully" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete news
export const deleteNews = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await getNewsById(id);
    
    if (!existing) {
      return res.status(404).json({ message: "News not found" });
    }
    
    // Delete images from storage
    if (existing.images && existing.images.length > 0) {
      for (const image of existing.images) {
        removeFileIfExists(image.image);
      }
    }
    
    const result = await deleteNewsModel(id);
    
    res.json({ message: "News deleted successfully" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all images (for management)
export const getImages = async (req, res) => {
  try {
    const images = await getAllImages();
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Upload image (standalone)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    
    const imageId = await createImage(req.file.filename);
    
    res.status(201).json({ 
      message: "Image uploaded successfully", 
      id: imageId,
      filename: req.file.filename 
    });
    
  } catch (err) {
    // Cleanup on error
    if (req.file) {
      removeFileIfExists(req.file.filename);
    }
    
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete image (standalone)
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await getImageById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    // Check if image is used by any news
    const [usage] = await pool.query(
      `SELECT COUNT(*) as count FROM news_images WHERE image_id = ?`,
      [id]
    );
    
    if (usage[0].count > 0) {
      return res.status(400).json({ 
        message: "Cannot delete image that is still in use by news articles" 
      });
    }
    
    // Delete from database
    await deleteImageModel(id);
    
    // Delete file
    removeFileIfExists(image.image);
    
    res.json({ message: "Image deleted successfully" });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};