import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testAivenConnection() {
  console.log('=== Testing Aiven Cloud Connection ===');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.PORT);
  console.log('User:', process.env.DB_USER);
  console.log('Database:', process.env.DB_NAME);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: parseInt(process.env.PORT) || 18944,
      connectTimeout: 30000,
      ssl: {
        rejectUnauthorized: false // Important for Aiven
      }
    });
    
    console.log('✅ Connected to Aiven MySQL!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', rows);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('\n🔧 Possible issues:');
      console.log('1. Your IP address needs to be whitelisted in Aiven console');
      console.log('2. Corporate firewall blocking port 18944');
      console.log('3. Aiven service might be paused or stopped');
      console.log('\n📝 Next steps:');
      console.log('1. Log in to Aiven console');
      console.log('2. Go to your MySQL service');
      console.log('3. Check "Allowed IP addresses" or "Connection Pool" settings');
      console.log('4. Add your current IP address to the whitelist');
    }
  }
}

testAivenConnection();