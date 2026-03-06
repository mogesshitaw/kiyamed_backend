import pool from "./config/db.js";

async function createTables() {
  try {

    // Add this at the beginning of the try block to drop existing tables
await pool.query(`SET FOREIGN_KEY_CHECKS = 0`);
await pool.query(`DROP TABLE IF EXISTS news_images`);
await pool.query(`DROP TABLE IF EXISTS news`);
await pool.query(`DROP TABLE IF EXISTS Image`);
await pool.query(`DROP TABLE IF EXISTS categories`);
await pool.query(`DROP TABLE IF EXISTS users`);
await pool.query(`DROP TABLE IF EXISTS feedback`);
await pool.query(`DROP TABLE IF EXISTS applications`);
await pool.query(`DROP TABLE IF EXISTS important_dates`);
await pool.query(`SET FOREIGN_KEY_CHECKS = 1`);
console.log("✅ Dropped existing tables");


    console.log("🚀 Starting database initialization...");
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(50) UNIQUE,
        username VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role ENUM('admin', 'user') DEFAULT 'admin'
      )
    `);
    console.log("✅ Users table created");
    
    // Insert default admin user
    await pool.query(`
      INSERT INTO users (email, username, password, role) 
      VALUES ('admin@gmail.com', 'admin', '$2b$10$UlCvZVBkvwbPAArbx5CYdOnVNmVO0SZ2GFMwvCdDe51qLjvJMsUD6', 'admin')
      ON DUPLICATE KEY UPDATE id = id
    `);
    console.log("✅ Default admin user created/verified (username: admin, password: 123456)");

    // Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      )
    `);
    console.log("✅ Categories table created");

    // Image table (renamed to Image with capital I as per your spec)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Image (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Image table created");

    // News table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        content LONGTEXT,
        image_id INT,
        category_id INT,
        author VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (image_id) REFERENCES Image(id) ON DELETE SET NULL
      )
    `);
    console.log("✅ News table created");

    // News_Images table for multiple images
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        news_id INT NOT NULL,
        image_id INT NOT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
        FOREIGN KEY (image_id) REFERENCES Image(id) ON DELETE CASCADE,
        UNIQUE KEY unique_news_image (news_id, image_id)
      )
    `);
    console.log("✅ News_images table created");

    // Feedback table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        message TEXT,
        allow_contact BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Feedback table created");

    // Applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        program VARCHAR(100) NOT NULL,
        education TEXT NOT NULL,
        experience TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Applications table created");

    // Important Dates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS important_dates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intake_name VARCHAR(100) NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Important_dates table created");

    // Insert sample data for important dates
    await pool.query(`
      INSERT INTO important_dates (intake_name, event_name, event_date, description) VALUES
      ('Fall 2025', 'Application Opens', '2025-01-15', 'Online application portal opens for Fall 2025 intake'),
      ('Fall 2025', 'Application Deadline', '2025-03-31', 'Last date to submit applications for Fall 2025'),
      ('Fall 2025', 'Entrance Exam', '2025-04-15', 'Written entrance examination'),
      ('Fall 2025', 'Interviews', '2025-05-01', 'Personal interviews for shortlisted candidates'),
      ('Fall 2025', 'Classes Begin', '2025-08-26', 'First day of classes for Fall 2025'),
      ('Spring 2026', 'Application Opens', '2025-08-01', 'Online application portal opens for Spring 2026 intake'),
      ('Spring 2026', 'Application Deadline', '2025-10-15', 'Last date to submit applications for Spring 2026'),
      ('Spring 2026', 'Entrance Exam', '2025-11-01', 'Written entrance examination'),
      ('Spring 2026', 'Interviews', '2025-11-15', 'Personal interviews for shortlisted candidates'),
      ('Spring 2026', 'Classes Begin', '2026-01-13', 'First day of classes for Spring 2026')
      ON DUPLICATE KEY UPDATE id = id
    `);
    console.log("✅ Sample important dates inserted/verified");

    console.log("\n🎉 All tables created successfully!");
    console.log("\n📊 Database Schema Summary:");
    console.log("- Users table (with admin user: admin/123456)");
    console.log("- Categories table");
    console.log("- Image table");
    console.log("- News table");
    console.log("- News_images table (for multiple images per news)");
    console.log("- Feedback table");
    console.log("- Applications table");
    console.log("- Important_dates table (with sample data)");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  }
}

createTables();