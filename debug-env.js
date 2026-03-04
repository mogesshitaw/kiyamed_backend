import dotenv from 'dotenv';
dotenv.config();

console.log('Current environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.PORT);
console.log('DB_PASSWORD set:', process.env.DB_PASS);