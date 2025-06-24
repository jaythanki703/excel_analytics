const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['User', 'Admin'],
      required: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    filesUploaded: {
      type: Number,
      default: 0,
    },
    chartsCreated: {
      type: Number,
      default: 0,
    },
    downloadedFiles: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
