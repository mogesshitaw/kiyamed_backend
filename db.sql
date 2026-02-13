CREATE DATABASE IF NOT EXISTS kiyamid_news;
USE kiyamid_news;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(50) UNIQUE,
  username VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin', 'user') DEFAULT 'admin'
);
insert into users(email,username,password,role) values('admin@gmial.com','admin','$2b$10$UlCvZVBkvwbPAArbx5CYdOnVNmVO0SZ2GFMwvCdDe51qLjvJMsUD6','admin');
-- username admin
-- passwrd 123456
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  content LONGTEXT,
  image_id  int ,
  category_id INT,
  author VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (image_id) REFERENCES image(id)
);
CREATE TABLE Image(
id INT AUTO_INCREMENT PRIMARY KEY,
image  VARCHAR(255)
) ;
CREATE TABLE IF NOT EXISTS feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      message TEXT,
      allow_contact BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
     CREATE TABLE IF NOT EXISTS applications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fullName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            program VARCHAR(100) NOT NULL,
            education TEXT NOT NULL,
            experience TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

-- Important Dates Table
CREATE TABLE IF NOT EXISTS important_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intake_name VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data for important dates
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
('Spring 2026', 'Classes Begin', '2026-01-13', 'First day of classes for Spring 2026');