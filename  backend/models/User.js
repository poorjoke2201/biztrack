const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { // Changed from firstName/lastName
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6, // Optional: Enforce minimum length
    select: false, // Typically hide password by default when querying
  },
  role: {
    type: String,
    enum: ['staff', 'admin'], // Define possible roles
    default: 'staff',
  },
  // --- Optional: Add phoneNumber if needed ---
  // phoneNumber: {
  //   type: String,
  //   // Add validation if required
  // },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Add pre-save hook for password hashing if not done in the route handler
// (The route handler version is already implemented based on previous code)

module.exports = mongoose.model('User', userSchema);