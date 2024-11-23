import dotenv from 'dotenv';
import {app} from './app.js';

import {connectDB} from '../src/config/db.js'; // Dynamically imported but needs to be awaited if it's async

dotenv.config({
  path: './.env'
})



// Request Logger Middleware (logs incoming requests)
const requestLogger = (req, res, next) => {
  console.log('--- Incoming Request ---');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('------------------------');
  
  // Call the next middleware/handler
  next();
};

// Use the request logger middleware to log all incoming requests
app.use(requestLogger);


connectDB();






