import mongoose from "mongoose";

// User schema definition
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },  // Full Name of the user
  email: { type: String, required: true, unique: true },  // User's email (must be unique)
  mobile: { type: String, required: true, unique: true },  // Mobile number (must be unique)
  password: { type: String, required: true },  // User's password
  photo: { type: String, default: null },  // Photo URL (stored in Cloudinary or other storage)
  photoPublicId: { type: String, default: null },  // Cloudinary public ID (for future management of the photo)
}, { timestamps: true });  // This will automatically add createdAt and updatedAt timestamps

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

export default User;
