const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  columns: [String],
  data: [mongoose.Schema.Types.Mixed],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now },

  // ✅ Add these fields for dashboard calculations
  chartCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);
