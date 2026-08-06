import React, { useState, useEffect } from "react";
import { X, Plus, Save, AlertCircle } from "lucide-react";
import api from "../api/axios";

const TaskModal = ({ isOpen, onClose, onSaved, initialData = null, isBug = false }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("todo");
  const [assigneeId, setAssigneeId] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setPriority(initialData.priority || "medium");
        setStatus(initialData.status || "todo");
        setAssigneeId(initialData.assignee?.id || "");
      } else {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setStatus("todo");
        setAssigneeId("");
      }
    }
  }, [isOpen, initialData]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("users/");
      setUsers(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      title,
      description,
      priority,
      status,
      assignee_id: assigneeId ? parseInt(assigneeId) : null,
    };

    const endpoint = isBug ? "bugs/" : "tasks/";

    try {
      if (initialData?.id) {
        await api.patch(`${endpoint}${initialData.id}/`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{initialData ? `Edit ${isBug ? "Bug" : "Task"}` : `Create New ${isBug ? "Defect / Bug" : "Agile Task"}`}</h3>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Implement OAuth2 login"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Add detailed acceptance criteria or reproduction steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Priority</label>
              <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="form-group half">
              <label>Status Column</label>
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Assignee</label>
            <select className="form-control" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.email || "No email"})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {initialData ? <Save size={16} /> : <Plus size={16} />}
              <span>{loading ? "Saving..." : initialData ? "Save Changes" : "Create Item"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
