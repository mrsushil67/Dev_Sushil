import express from 'express';

import User from '../models/user.js';  // Assuming your User model is set up
import cloudinary from '../config/cloudinary.js';
import {ApiResponse} from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

// POST: Register a new user
const registerUser = async (req, res) => {
  const { fullName, email, mobile, password } = req.body;

  // Validate the incoming data
  if (!fullName || !email || !mobile || !password) {
    throw new ApiError(400, "All fields are required");
  }

  try {
   

    // If a file (photo) is uploaded, handle Cloudinary upload
    let photoUrl = null;
    if (req.files && req.files.photo) {
      const photo = req.files.photo;
      
      console.log(photo[0].path)
      // Upload the photo to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(photo[0].path, {
        folder: 'user_photos', // Optional: specify a folder in Cloudinary
        public_id: `${email}`,  // Optionally specify a public ID
      });

      // Get the URL of the uploaded photo
      photoUrl = cloudinaryResponse.secure_url;

      console.log('Photo uploaded successfully:', photoUrl);
    }

    // Check if the email or mobile number already exists in the database
    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });

    if (existingUser) {
      throw new ApiError(409, "User with email or mobile already exists");
    }

    // Create a new user instance with the provided data (no password hashing)
    const newUser = new User({
      fullName,
      email,
      mobile,
      password,  // Store the password as plain text
      photo: photoUrl, // Save the photo URL to the user
    });

    // Save the new user to the database
    await newUser.save();

    // Return success response
    return res.status(201).json(
      new ApiResponse(200, { fullName: newUser.fullName, email: newUser.email, mobile: newUser.mobile, photo: photoUrl }, "User registered successfully")
    );

  } catch (error) {
    // console.error(error);

    // Return error response
    return res.status(500).json(
      new ApiResponse(500, null, `Error registering user: ${error.message}`)
    );
  }
};




// POST: Login a user
const loginUser = async (req, res,next) => {
  const { email, password } = req.body;

  if (!email || !password) {
   
    throw new ApiError(400, "Email and password are required.");
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(401,'User does not exist.')
    }

    // Compare the plain text password directly (no hashing)
    if (user.password !== password) {
    
      throw new ApiError(401,'Invalid user credentials.')
    }



   
    return res.status(201).json( new ApiResponse(200,{ email: user.email, fullName: user.fullName, photo: user.photo },'Login successful'))
  } catch (err) {
    // console.error('Error during login attempt:', err);
    // return res.status(500).json(
    //   new ApiResponse(500, null, `Error Login user`)
    // );
    next(err)
  }
};


// Controller to update user profile with text and file upload
const updateProfile = async (req, res) => {
    
  const { fullName, email, mobile,password} = req.body;  // Extract text fields from body
  

  try {
    const userId = '673ddbb366183c22033a9f4d';  // Replace with dynamic user ID if needed
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
   
    console.log(req.body);
    
   

    // Update the user's profile fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.mobile = mobile || user.mobile;
    user.password = password || user.password;
    

    // Save the updated user document
    const updatedUser = await user.save();
    

    // Log the updated user data to the console (response logging)
    console.log("Updated User Profile:", {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        
      });

    // Send the success response
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
       
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Could not update profile." });
  }
};

// Fetch user profile by userId
const getUserProfile = async (req, res) => {
  const { userId } = req.params;  // Extract userId from URL params

  try {
    // Find the user by userId, excluding the password field
    const user = await User.findById(userId).select('-password');

    // If user is not found, return an error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the user object to the terminal for debugging purposes
    console.log('Fetched User Profile:', user);

    // Send the user profile data in the response
    res.json({
      success: true,  // Indicates the request was successful
      message: 'User profile fetched successfully',  // Success message
      user: {
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        photo: user.photo,  // Include the photo URL from the database
      }
    });

  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to handle image upload and Cloudinary integration
const uploadImage = async (req, res) => {
  console.log("Received upload request with file:", req.file); // Debugging log

  try {
    // Ensure file is received
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Log the file details for debugging
    console.log('File details:', req.file);

    // Upload image to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_images', // Optional: Specify folder in Cloudinary
      public_id: `${Date.now()}`, // Optional: Use a custom public ID (e.g., using the timestamp)
    });

    // Hardcoded user ID for testing
    const userId = '673ddbb366183c22033a9f4d'; // Replace this with the actual user ID for testing

    // Update the user's profile image in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { photo: cloudinaryResponse.secure_url }, // Update the user's profile image URL
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the updated user data back in the response
    return res.status(200).json({
      message: 'Image uploaded and user updated successfully',
      imageUrl: cloudinaryResponse.secure_url,
      user: updatedUser, // Send back updated user data
    });

  } catch (error) {
    console.error('Error uploading image:', error); // Log errors
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};

// Apply the multer middleware for file upload, and then handle profile update
// app.post('/profile', multerUpload, updateProfile);

export  {registerUser,loginUser,updateProfile,getUserProfile,uploadImage}