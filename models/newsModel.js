// models/newsModel.js
import pool from "../config/db.js";

// Create news with multiple images
export const createNews = async ({ title, content, category_id = null, author = null, image_ids = [] }) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Insert news (no image_id in main news table)
    const [newsResult] = await connection.query(
      `INSERT INTO news (title, content, category_id, author, image_id) 
       VALUES (?, ?, ?, ?, NULL)`,
      [title, content, category_id, author]
    );
    
    const newsId = newsResult.insertId;
    let featuredImageId = null;
    
    // 2. Link images to news (if any)
    if (image_ids && image_ids.length > 0) {
      for (let i = 0; i < image_ids.length; i++) {
        const imageId = image_ids[i];
        
        // Verify image exists
        const [imageCheck] = await connection.query(
          `SELECT id FROM Image WHERE id = ?`,
          [imageId]
        );
        
        if (imageCheck.length > 0) {
          const isFeatured = i === 0; // First image is featured
          
          await connection.query(
            `INSERT INTO news_images (news_id, image_id, is_featured, sort_order) 
             VALUES (?, ?, ?, ?)`,
            [newsId, imageId, isFeatured, i]
          );
          
          if (isFeatured) {
            featuredImageId = imageId;
          }
        }
      }
      
      // 3. Update news with featured image_id
      if (featuredImageId) {
        await connection.query(
          `UPDATE news SET image_id = ? WHERE id = ?`,
          [featuredImageId, newsId]
        );
      }
    }
    
    await connection.commit();
    
    return {
      insertId: newsId,
      imageCount: image_ids.length,
      featuredImageId
    };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Create a single image record
export const createImage = async (filename) => {
  const [result] = await pool.query(
    `INSERT INTO Image (image) VALUES (?)`,
    [filename]
  );
  return result.insertId;
};

// Get all images
export const getAllImages = async () => {
  const [rows] = await pool.query(`SELECT * FROM Image ORDER BY created_at DESC`);
  return rows;
};

// Get image by ID
export const getImageById = async (id) => {
  const [rows] = await pool.query(`SELECT * FROM Image WHERE id = ?`, [id]);
  return rows.length ? rows[0] : null;
};

// Delete image
export const deleteImage = async (id) => {
  const [result] = await pool.query(`DELETE FROM Image WHERE id = ?`, [id]);
  return result;
};

// Get all news with images and category
export const getAllNews = async () => {
  const [rows] = await pool.query(`
    SELECT 
      n.*, 
      c.name AS category_name,
      i.image AS featured_image,
      (
        SELECT COUNT(*) 
        FROM news_images ni 
        WHERE ni.news_id = n.id
      ) AS image_count,
      GROUP_CONCAT(ni2.image_id) AS all_image_ids
    FROM news n
    LEFT JOIN categories c ON n.category_id = c.id
    LEFT JOIN Image i ON n.image_id = i.id
    LEFT JOIN news_images ni2 ON n.id = ni2.news_id
    GROUP BY n.id
    ORDER BY n.created_at DESC
  `);
  
  // Get all images for each news item
  for (let row of rows) {
    if (row.all_image_ids) {
      const imageIds = row.all_image_ids.split(',');
      const [images] = await pool.query(`
        SELECT i.*, ni.is_featured, ni.sort_order
        FROM news_images ni
        JOIN Image i ON ni.image_id = i.id
        WHERE ni.news_id = ?
        ORDER BY ni.sort_order ASC
      `, [row.id]);
      row.images = images;
    } else {
      row.images = [];
    }
  }
  
  return rows;
};

// Get news by ID with all images
export const getNewsById = async (id) => {
  // Get news basic info
  const [newsRows] = await pool.query(`
    SELECT n.*, c.name AS category_name
    FROM news n
    LEFT JOIN categories c ON n.category_id = c.id
    WHERE n.id = ? LIMIT 1
  `, [id]);
  
  if (newsRows.length === 0) return null;
  
  const news = newsRows[0];
  
  // Get all images for this news
  const [images] = await pool.query(`
    SELECT i.*, ni.is_featured, ni.sort_order
    FROM news_images ni
    JOIN Image i ON ni.image_id = i.id
    WHERE ni.news_id = ?
    ORDER BY ni.sort_order ASC
  `, [id]);
  
  news.images = images;
  
  // Get featured image
  if (news.image_id) {
    const [featuredImage] = await pool.query(
      `SELECT * FROM Image WHERE id = ?`,
      [news.image_id]
    );
    news.featured_image = featuredImage[0]?.image || null;
  }
  
  return news;
};

// Update news with multiple images
export const updateNews = async (id, { 
  title, 
  content, 
  category_id, 
  author, 
  image_ids = [],
  removed_image_ids = [] 
}) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Update news basic info
    const [result] = await connection.query(
      `UPDATE news 
       SET title = ?, content = ?, category_id = ?, author = ?
       WHERE id = ?`,
      [title, content, category_id, author, id]
    );
    
    // 2. Remove specified images
    if (removed_image_ids && removed_image_ids.length > 0) {
      await connection.query(
        `DELETE FROM news_images 
         WHERE news_id = ? AND image_id IN (?)`,
        [id, removed_image_ids]
      );
    }
    
    // 3. Add new images
    if (image_ids && image_ids.length > 0) {
      // Get current max sort_order
      const [currentOrder] = await connection.query(
        `SELECT MAX(sort_order) as max_order FROM news_images WHERE news_id = ?`,
        [id]
      );
      
      let startOrder = currentOrder[0]?.max_order || 0;
      if (startOrder === null) startOrder = 0;
      
      for (let i = 0; i < image_ids.length; i++) {
        const imageId = image_ids[i];
        
        // Check if image already linked
        const [existing] = await connection.query(
          `SELECT id FROM news_images WHERE news_id = ? AND image_id = ?`,
          [id, imageId]
        );
        
        if (existing.length === 0) {
          // Link new image
          const isFeatured = (startOrder + i) === 0; // First image is featured
          
          await connection.query(
            `INSERT INTO news_images (news_id, image_id, is_featured, sort_order) 
             VALUES (?, ?, ?, ?)`,
            [id, imageId, isFeatured, startOrder + i]
          );
          
          // Update news.image_id if this is the featured image
          if (isFeatured) {
            await connection.query(
              `UPDATE news SET image_id = ? WHERE id = ?`,
              [imageId, id]
            );
          }
        }
      }
    }
    
    // 4. Ensure we have a featured image
    const [featuredCheck] = await connection.query(
      `SELECT image_id FROM news_images WHERE news_id = ? AND is_featured = TRUE LIMIT 1`,
      [id]
    );
    
    if (featuredCheck.length === 0) {
      // Set first image as featured
      const [firstImage] = await connection.query(
        `SELECT image_id FROM news_images WHERE news_id = ? ORDER BY sort_order ASC LIMIT 1`,
        [id]
      );
      
      if (firstImage.length > 0) {
        await connection.query(
          `UPDATE news SET image_id = ? WHERE id = ?`,
          [firstImage[0].image_id, id]
        );
        
        await connection.query(
          `UPDATE news_images SET is_featured = TRUE WHERE news_id = ? AND image_id = ?`,
          [id, firstImage[0].image_id]
        );
      } else {
        // No images left, set image_id to NULL
        await connection.query(
          `UPDATE news SET image_id = NULL WHERE id = ?`,
          [id]
        );
      }
    }
    
    await connection.commit();
    return result;
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Update image order and featured status
export const updateNewsImagesOrder = async (newsId, imagesOrder) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Reset all featured flags
    await connection.query(
      `UPDATE news_images SET is_featured = FALSE WHERE news_id = ?`,
      [newsId]
    );
    
    // Update order and set featured
    for (const item of imagesOrder) {
      await connection.query(
        `UPDATE news_images 
         SET sort_order = ?, is_featured = ?
         WHERE news_id = ? AND image_id = ?`,
        [item.sort_order, item.is_featured, newsId, item.image_id]
      );
      
      if (item.is_featured) {
        await connection.query(
          `UPDATE news SET image_id = ? WHERE id = ?`,
          [item.image_id, newsId]
        );
      }
    }
    
    await connection.commit();
    return { success: true };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Delete news
export const deleteNews = async (id) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get all image IDs associated with this news
    const [imageRows] = await connection.query(
      `SELECT ni.image_id, i.image 
       FROM news_images ni 
       JOIN Image i ON ni.image_id = i.id
       WHERE ni.news_id = ?`,
      [id]
    );
    
    // Delete news_images records (cascade should handle this, but being explicit)
    await connection.query(`DELETE FROM news_images WHERE news_id = ?`, [id]);
    
    // Delete the news
    const [result] = await connection.query(`DELETE FROM news WHERE id = ?`, [id]);
    
    // Delete Image records if no other news uses them
    for (const img of imageRows) {
      const [usageCount] = await connection.query(
        `SELECT COUNT(*) as count FROM news_images WHERE image_id = ?`,
        [img.image_id]
      );
      
      if (usageCount[0].count === 0) {
        await connection.query(`DELETE FROM Image WHERE id = ?`, [img.image_id]);
      }
    }
    
    await connection.commit();
    return result;
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Remove single image from news
export const removeImageFromNews = async (newsId, imageId) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Remove from news_images
    await connection.query(
      `DELETE FROM news_images WHERE news_id = ? AND image_id = ?`,
      [newsId, imageId]
    );
    
    // Check if this was the featured image
    const [featuredCheck] = await connection.query(
      `SELECT image_id FROM news WHERE id = ? AND image_id = ?`,
      [newsId, imageId]
    );
    
    if (featuredCheck.length > 0) {
      // Find a new featured image
      const [newFeatured] = await connection.query(
        `SELECT image_id FROM news_images WHERE news_id = ? ORDER BY sort_order ASC LIMIT 1`,
        [newsId]
      );
      
      if (newFeatured.length > 0) {
        await connection.query(
          `UPDATE news SET image_id = ? WHERE id = ?`,
          [newFeatured[0].image_id, newsId]
        );
        
        await connection.query(
          `UPDATE news_images SET is_featured = TRUE WHERE news_id = ? AND image_id = ?`,
          [newsId, newFeatured[0].image_id]
        );
      } else {
        // No images left
        await connection.query(
          `UPDATE news SET image_id = NULL WHERE id = ?`,
          [newsId]
        );
      }
    }
    
    // Check if image is still used by any news
    const [usageCount] = await connection.query(
      `SELECT COUNT(*) as count FROM news_images WHERE image_id = ?`,
      [imageId]
    );
    
    // If not used anywhere, delete from Image table
    if (usageCount[0].count === 0) {
      await connection.query(`DELETE FROM Image WHERE id = ?`, [imageId]);
    }
    
    await connection.commit();
    return { success: true };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};