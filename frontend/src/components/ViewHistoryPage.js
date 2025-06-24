import React, { useState, useEffect } from 'react';
import './viewHistory.css';
import { toast } from 'react-toastify';

const ViewHistoryPage = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/analysis/history', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();
      if (response.ok && Array.isArray(json)) {
        setHistoryData(json);
      }
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const confirmDelete = (id) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/analysis/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();
      if (response.ok) {
        toast.success(json.msg || 'Deleted successfully');
        setHistoryData((prev) => prev.filter((item) => item._id !== deleteId));
      } else {
        toast.error(json.msg || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Server error while deleting');
    } finally {
      setDeleteId(null);
    }
  };

  const handleViewPDF = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/analysis/pdf/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch PDF');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      toast.error('Unable to view PDF');
    }
  };

  const handleDownloadPDF = async (id, fileName = 'chart') => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/analysis/pdf/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(historyData.length / rowsPerPage);
  const currentRows = historyData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="view-history-container">
      <h2 className="view-history-title">📊 Saved Analysis</h2>

      {loading ? (
        <div className="loading-msg">Loading history...</div>
      ) : historyData.length === 0 ? (
        <div className="no-records-msg">No analysis history found.</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                  <th>Chart Type</th>
                  <th>Dimension</th>
                  <th>X Axis</th>
                  <th>Y Axis</th>
                  <th>Z Axis</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((item, index) => (
                  <tr key={item._id}>
                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td>{item.fileName}</td>
                    <td>{item.chartType}</td>
                    <td>{item.dimension}</td>
                    <td>{item.xAxis}</td>
                    <td>{item.yAxis || '-'}</td>
                    <td>{item.zAxis || '-'}</td>
                    <td>
                      {new Date(item.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="action-btns">
                      <button onClick={() => handleViewPDF(item._id)}>📄 View</button>
                      <button onClick={() => handleDownloadPDF(item._id, item.fileName)}>⬇️ Download</button>
                      <button onClick={() => confirmDelete(item._id)}>🗑 Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button onClick={handlePrevious} disabled={currentPage === 1}>
              ◀️ Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>
              Next ▶️
            </button>
          </div>
        </>
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to delete this analysis?</p>
            <div className="modal-actions">
              <button onClick={handleDelete} className="modal-confirm">Yes, Delete</button>
              <button onClick={cancelDelete} className="modal-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewHistoryPage;
