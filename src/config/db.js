// config/db.js
import mongoose from 'mongoose';
import {app} from '../app.js';





const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI; // Fetch the Mongo URI from the environment variable

    
    await mongoose.connect(dbURI);
    console.log('MongoDB connected');
    
    const port = process.env.PORT || 3000;

    
    // Start the server after the DB connection is established
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${port}`);
    });

  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if the database connection fails
  }
};

export {connectDB}
