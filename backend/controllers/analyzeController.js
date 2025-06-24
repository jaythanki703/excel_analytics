const Analysis = require('../models/analysisModel');
const User = require('../models/userModel');

// ✅ Save a chart analysis
exports.saveAnalysis = async (req, res) => {
  try {
    console.log('✅ [saveAnalysis] API hit');

    const { fileName, chartType, dimension, xAxis, yAxis, zAxis } = req.body;

    console.log('📥 Request Body:', {
      fileName,
      chartType,
      dimension,
      xAxis,
      yAxis,
      zAxis,
    });

    if (!fileName || !chartType || !dimension || !xAxis) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ msg: 'Missing required fields.' });
    }

    if (!req.file || !req.file.buffer) {
      console.log('❌ Chart PDF file is missing');
      return res.status(400).json({ msg: 'Chart PDF file is missing.' });
    }

    console.log('📎 Received PDF file:', req.file.originalname || 'Unknown filename');
    console.log('👤 Authenticated user ID:', req.user?.id);

    const analysis = new Analysis({
      userId: req.user.id,
      fileName,
      chartType,
      dimension,
      xAxis,
      yAxis: yAxis || null,
      zAxis: zAxis || null,
      chartPDF: req.file.buffer,
    });

    await analysis.save();
    console.log('✅ Analysis saved to MongoDB:', analysis._id);

    const user = await User.findById(req.user.id);
    if (user) {
      user.chartsCreated = (user.chartsCreated || 0) + 1;
      await user.save();
      console.log('📈 User chartsCreated incremented:', user.chartsCreated);
    } else {
      console.log('⚠️ User not found for ID:', req.user.id);
    }

    return res.status(201).json({ msg: 'Analysis saved successfully.' });
  } catch (err) {
    console.error('🔥 Error saving analysis:', err);
    return res.status(500).json({ msg: 'Failed to save analysis.' });
  }
};

// ✅ Serve PDF buffer from MongoDB (silent version)
exports.getChartPDF = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis || !analysis.chartPDF) {
      return res.status(204).end(); // No Content, silent
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="chart.pdf"',
    });

    res.send(analysis.chartPDF);
  } catch (err) {
    // ❌ No console, no res message — completely silent
    return res.status(204).end(); // No Content
  }
};


// ✅ Fetch all analyses saved by the logged-in user
exports.getAnalysisHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const formatted = analyses.map((item) => ({
      _id: item._id,
      fileName: item.fileName,
      chartType: item.chartType,
      dimension: item.dimension,
      xAxis: item.xAxis,
      yAxis: item.yAxis,
      zAxis: item.zAxis,
      createdAt: item.createdAt,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('🔥 Error fetching analysis history:', error);
    return res.status(200).json([]); // 🔕 Silently return empty list
  }
};


// ✅ Delete a specific analysis by ID
exports.deleteAnalysis = async (req, res) => {
  try {
    const deleted = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id, // ensure only owner can delete
    });

    if (!deleted) {
      return res.status(404).json({ msg: 'Analysis not found or unauthorized.' });
    }

    console.log('🗑️ Deleted analysis:', deleted._id);
    return res.status(200).json({ msg: 'Analysis deleted successfully.' });
  } catch (error) {
    console.error('🔥 Error deleting analysis:', error);
    res.status(500).json({ msg: 'Failed to delete analysis' });
  }
};
