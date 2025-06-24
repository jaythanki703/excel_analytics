const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  columns: [String],                          // optional: you can extract this from the file
  data: [mongoose.Schema.Types.Mixed],        // optional preview data (if you still use it)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);
