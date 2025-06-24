const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  chartType: {
    type: String,
    required: true,
  },
  dimension: {
    type: String,
    enum: ['2D', '3D'],
    required: true,
  },
  xAxis: {
    type: String,
    required: true,
  },
  yAxis: {
    type: String, // optional for Pie chart
  },
  zAxis: {
    type: String, // used for 3D charts
  },
  chartPDF: {
    type: Buffer, // stores PDF file as binary
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Analysis', analysisSchema);
