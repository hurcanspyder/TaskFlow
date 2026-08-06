import React, { useState, useEffect } from "react";
import { Plus, Bug as BugIcon, Trash2, Edit3, User, AlertTriangle } from "lucide-react";
import api from "../api/axios";
import TaskModal from "../components/TaskModal";

const BugTracker = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBug, setEditingBug] = useState(null);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    setLoading(true);
    try {
      const res = await api.get("bugs/");
      setBugs(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load bugs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this defect report?")) return;
    try {
      await api.delete(`bugs/${id}/`);
      setBugs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete bug", err);
    }
  };

  return (
    <div className="table-page-wrapper">
      <div className="table-header-group">
        <div>
          <h2>Defect & Bug Tracker</h2>
          <p>Track technical debt, regression bugs, and critical hotfixes</p>
        </div>
        <button
          className="btn-danger"
          onClick={() => {
            setEditingBug(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>Report Defect</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Fetching defects list...</p>
        </div>
      ) : (
        <div className="bug-cards-grid">
          {bugs.map((bug) => (
            <div key={bug.id} className="bug-card">
              <div className="bug-card-top">
                <span className="bug-id">
                  <BugIcon size={16} className="text-red" /> #{bug.id}
                </span>
                <span className={`badge-priority ${bug.priority}`}>{bug.priority} priority</span>
              </div>
              <h3 className="bug-title">{bug.title}</h3>
              <p className="bug-desc">{bug.description || "No description provided."}</p>
              <div className="bug-footer">
                <div className="assignee-tag">
                  <User size={14} />
                  <span>{bug.assignee ? bug.assignee.username : "Unassigned"}</span>
                </div>
                <div className="card-actions">
                  <button
                    className="card-btn"
                    onClick={() => {
                      setEditingBug(bug);
                      setIsModalOpen(true);
                    }}
                    title="Edit Defect"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="card-btn delete"
                    onClick={() => handleDelete(bug.id)}
                    title="Delete Defect"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {bugs.length === 0 && (
            <div className="empty-state-box">
              <AlertTriangle size={32} className="text-warning" />
              <h3>No Active Defects Reported</h3>
              <p>Great job! All tracked issues have been resolved or non-exist.</p>
            </div>
          )}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchBugs}
        initialData={editingBug}
        isBug={true}
      />
    </div>
  );
};

export default BugTracker;
