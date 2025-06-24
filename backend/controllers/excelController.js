const XLSX = require('xlsx');
const User = require('../models/userModel');
const UploadedFile = require('../models/uploadedFileModel');

// ✅ Handle Excel Upload
exports.handleExcelUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    // ✅ Parse Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!jsonData.length) {
      return res.status(400).json({ msg: 'Excel file is empty or invalid.' });
    }

    const columns = Object.keys(jsonData[0]);

    // ✅ Save to UploadedFile collection
    await UploadedFile.create({
      fileName: req.file.originalname,
      columns,
      data: jsonData.slice(0, 5), // preview only
      userId: req.user.id,
    });

    // ✅ Update user's stats (no fileStorage update)
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { filesUploaded: 1 },
    });

    return res.status(200).json({
      msg: 'File uploaded and saved successfully!',
      preview: jsonData.slice(0, 5),
    });

  } catch (err) {
    console.error('Excel parsing or DB update error:', err);
    res.status(500).json({ msg: 'Failed to process Excel file.' });
  }
};

// ✅ Get Latest Uploaded Excel File
exports.getLatestExcel = async (req, res) => {
  try {
    const file = await UploadedFile.findOne({ userId: req.user.id }).sort({ uploadedAt: -1 });
    if (!file) {
      return res.status(404).json({ msg: 'No uploaded file found.' });
    }

    res.status(200).json({
      fileName: file.fileName,
      columns: file.columns,
      data: file.data,
    });
  } catch (err) {
    console.error('Error fetching uploaded file:', err);
    res.status(500).json({ msg: 'Error fetching uploaded file.' });
  }
};
