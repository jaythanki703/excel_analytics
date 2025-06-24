import React, { useState, useEffect, useRef } from 'react';
import './analyze.css';
import Plot from 'react-plotly.js';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import Plotly from 'plotly.js-dist-min';

const AnalyzePage = ({ setUserData }) => {
  const [uploadedFile, setUploadedFile] = useState('');
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [dimension, setDimension] = useState('2D');
  const [chartType, setChartType] = useState('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [zAxis, setZAxis] = useState('');
  const [errors, setErrors] = useState({});
  const [chartGenerated, setChartGenerated] = useState(false);
  const chartRef = useRef();

  useEffect(() => {
    const fetchLatestExcel = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/excel/latest', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) {
          setUploadedFile(json.fileName);
          setColumns(json.columns);
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch latest Excel file', err);
      }
    };
    fetchLatestExcel();
  }, []);

  const validateInputs = () => {
    const newErrors = {};
    if (!uploadedFile) newErrors.uploadedFile = 'Uploaded file is required';
    if (!chartType) newErrors.chartType = 'Chart type is required';
    if (!xAxis) newErrors.xAxis = 'X Axis is required';
    if (dimension === '2D' && chartType !== 'Pie Chart' && !yAxis)
      newErrors.yAxis = 'Y Axis is required';
    if (dimension === '3D' && chartType !== 'Pie Chart') {
      if (!yAxis) newErrors.yAxis = 'Y Axis is required';
      if (!zAxis) newErrors.zAxis = 'Z Axis is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sortByXAxis = (arr) => {
    if (!xAxis) return arr;
    return [...arr].sort((a, b) => {
      const aVal = a[xAxis];
      const bVal = b[xAxis];
      if (!isNaN(aVal) && !isNaN(bVal)) return parseFloat(aVal) - parseFloat(bVal);
      return String(aVal).localeCompare(String(bVal));
    });
  };

  const renderChart = () => {
    const sorted = sortByXAxis(data);
    const xData = sorted.map((row) => row[xAxis]);
    const yData = sorted.map((row) => row[yAxis]);
    const zData = sorted.map((row) => row[zAxis]);

    if (dimension === '2D') {
      if (chartType === 'Pie Chart') {
        const pieData = sorted.reduce((acc, row) => {
          const name = row[xAxis];
          const found = acc.find((item) => item.name === name);
          if (found) found.value++;
          else acc.push({ name, value: 1 });
          return acc;
        }, []);
        return (
          <Plot
            data={[{
              type: 'pie',
              labels: pieData.map((d) => d.name),
              values: pieData.map((d) => d.value),
              hole: 0.3,
            }]}
            layout={{ title: '2D Pie Chart', height: 500, width: 800 }}
          />
        );
      }

      const trace = {
        x: xData,
        y: yData,
        type: chartType === 'Bar Chart' ? 'bar' : 'scatter',
        mode: chartType === 'Line Chart' ? 'lines+markers' : 'markers',
        marker: { color: '#00274d' },
      };

      return (
        <Plot
          data={[trace]}
          layout={{
            title: `2D ${chartType}`,
            xaxis: { title: xAxis },
            yaxis: { title: yAxis },
            height: 500,
            width: 800,
          }}
        />
      );
    }

    if (dimension === '3D') {
      if (chartType === 'Pie Chart') {
        const pieData = sorted.reduce((acc, row) => {
          const name = row[xAxis];
          const found = acc.find((item) => item.name === name);
          if (found) found.value++;
          else acc.push({ name, value: 1 });
          return acc;
        }, []);
        return (
          <Plot
            data={[{
              type: 'pie',
              labels: pieData.map((d) => d.name),
              values: pieData.map((d) => d.value),
              hole: 0.4,
            }]}
            layout={{ title: '3D Pie Chart (styled)', height: 500, width: 800 }}
          />
        );
      }

      if (chartType === 'Bar Chart') {
        const traces = xData.map((x, i) => ({
          type: 'scatter3d',
          mode: 'lines',
          x: [x, x],
          y: [yData[i], yData[i]],
          z: [0, zData[i]],
          line: { width: 10, color: '#00274d' },
        }));
        return (
          <Plot
            data={traces}
            layout={{
              title: '3D Bar Chart',
              scene: {
                xaxis: { title: xAxis },
                yaxis: { title: yAxis },
                zaxis: { title: zAxis },
              },
              height: 600,
              width: 900,
            }}
          />
        );
      }

      const trace = {
        type: 'scatter3d',
        mode: chartType === 'Line Chart' ? 'lines+markers' : 'markers',
        x: xData,
        y: yData,
        z: zData,
        marker: { size: 4, color: '#00274d' },
      };

      return (
        <Plot
          data={[trace]}
          layout={{
            title: `3D ${chartType}`,
            scene: {
              xaxis: { title: xAxis },
              yaxis: { title: yAxis },
              zaxis: { title: zAxis },
            },
            height: 600,
            width: 900,
          }}
        />
      );
    }

    return null;
  };

  const handleGenerateChart = async () => {
    if (!validateInputs()) return;
    setChartGenerated(true);

    if (typeof setUserData === 'function') {
      setUserData((prev) => ({
        ...prev,
        chartsCreated: (prev?.chartsCreated || 0) + 1,
      }));
    }

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/increment-charts', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Error incrementing charts count', err);
    }
  };

  
  const handleSaveAnalysis = async () => {
  if (!validateInputs()) return;

  try {
    const chartDiv = chartRef.current?.querySelector('.js-plotly-plot');
    if (!chartDiv) {
      toast.error('Chart not found. Please generate the chart first.');
      return;
    }

    const imageData = await Plotly.toImage(chartDiv, {
      format: 'png',
      width: 900,
      height: 600,
    });

    const pdf = new jsPDF({ orientation: 'landscape' });
    pdf.addImage(imageData, 'PNG', 10, 10, 280, 150);
    const pdfBlob = pdf.output('blob');

    const formData = new FormData();
    formData.append('fileName', uploadedFile);
    formData.append('chartType', chartType);
    formData.append('xAxis', xAxis);
    formData.append('yAxis', yAxis);
    formData.append('zAxis', zAxis);
    formData.append('dimension', dimension);
    //formData.append('chartPDF', pdfBlob);
    const file = new File([pdfBlob], 'chart.pdf', { type: 'application/pdf' });
    formData.append('chartPDF', file);


    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/analysis/save', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // ✅ Do NOT manually set Content-Type for FormData
      },
      body: formData,
    });

    const json = await res.json();
    toast.dismiss();

    if (res.ok && json.success !== false) {
      toast.success(json.msg || 'Analysis saved successfully.');
    } else {
      toast.error(json.msg || 'Failed to save analysis.');
    }
  } catch (error) {
    console.error('Error during saveAnalysis:', error);
    toast.dismiss();
    toast.error('Server error while saving analysis.');
  }
};


  const handleDownload = async (type) => {
    if (!validateInputs()) return;
    try {
      const chartDiv = chartRef.current.querySelector('.js-plotly-plot');
      const imageData = await Plotly.toImage(chartDiv, { format: 'png', width: 900, height: 600 });

      if (type === 'pdf') {
        const pdf = new jsPDF({ orientation: 'landscape' });
        pdf.addImage(imageData, 'PNG', 10, 10, 280, 150);
        pdf.save('chart.pdf');
      } else {
        const a = document.createElement('a');
        a.href = imageData;
        a.download = 'chart.png';
        a.click();
      }

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/increment-downloads', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok && typeof setUserData === 'function') {
        setUserData((prev) => ({
          ...prev,
          downloadedFiles: (prev?.downloadedFiles || 0) + 1,
        }));
      }
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleClear = () => {
    setDimension('2D');
    setChartType('');
    setXAxis('');
    setYAxis('');
    setZAxis('');
    setErrors({});
    setChartGenerated(false);
  };

  return (
    <div className="analyze-container" style={{ overflowX: 'auto' }}>
      <div className="left-panel">
        <div className="form-group">
          <label>Uploaded File:</label>
          <input type="text" value={uploadedFile} disabled />
          {errors.uploadedFile && <div className="error">{errors.uploadedFile}</div>}
        </div>

        <div className="form-group">
          <label>Dimension:</label>
          <label><input type="radio" value="2D" checked={dimension === '2D'} onChange={() => setDimension('2D')} /> 2D</label>
          <label><input type="radio" value="3D" checked={dimension === '3D'} onChange={() => setDimension('3D')} /> 3D</label>
        </div>

        <div className="form-group">
          <label>Chart Type:</label>
          <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option value="">Select</option>
            <option>Bar Chart</option>
            <option>Line Chart</option>
            <option>Pie Chart</option>
            <option>Scatter Chart</option>
          </select>
          {errors.chartType && <div className="error">{errors.chartType}</div>}
        </div>

        <div className="form-group">
          <label>X Axis:</label>
          <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
            <option value="">Select</option>
            {columns.map((col) => <option key={col}>{col}</option>)}
          </select>
          {errors.xAxis && <div className="error">{errors.xAxis}</div>}
        </div>

        {chartType !== 'Pie Chart' && (
          <div className="form-group">
            <label>Y Axis:</label>
            <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
              <option value="">Select</option>
              {columns.map((col) => <option key={col}>{col}</option>)}
            </select>
            {errors.yAxis && <div className="error">{errors.yAxis}</div>}
          </div>
        )}

        {dimension === '3D' && chartType !== 'Pie Chart' && (
          <div className="form-group">
            <label>Z Axis:</label>
            <select value={zAxis} onChange={(e) => setZAxis(e.target.value)}>
              <option value="">Select</option>
              {columns.map((col) => <option key={col}>{col}</option>)}
            </select>
            {errors.zAxis && <div className="error">{errors.zAxis}</div>}
          </div>
        )}

        <div className="center-buttons">
          <button className="generate-btn" onClick={handleGenerateChart}>Generate Chart</button>
          <button className="clear-btn" onClick={handleClear}>Clear</button>
        </div>
      </div>

      <div className="right-panel">
        <div className="chart-box" ref={chartRef}>
          {!chartGenerated ? (
            <div className="chart-placeholder">Charts will be generated here after selection.</div>
          ) : (
            renderChart()
          )}
        </div>

        {chartGenerated && (
          <div className="action-buttons">
            <button onClick={handleSaveAnalysis}>Save Analysis</button>
            <button onClick={() => handleDownload('pdf')}>Download as PDF</button>
            <button onClick={() => handleDownload('png')}>Download as PNG</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;
