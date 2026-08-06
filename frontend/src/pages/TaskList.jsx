import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Trash2, Edit3, User, CheckCircle2, Clock, ListTodo } from "lucide-react";
import api from "../api/axios";
import TaskModal from "../components/TaskModal";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("tasks/");
      setTasks(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`tasks/${id}/`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "done":
        return <span className="status-pill done"><CheckCircle2 size={12} /> Done</span>;
      case "in_progress":
        return <span className="status-pill progress"><Clock size={12} /> In Progress</span>;
      default:
        return <span className="status-pill todo"><ListTodo size={12} /> To Do</span>;
    }
  };

  return (
    <div className="table-page-wrapper">
      <div className="table-header-group">
        <div>
          <h2>Task Directory</h2>
          <p>Detailed view of all sprint backlog items</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      <div className="table-filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <Filter size={16} className="filter-icon" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Fetching tasks...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => (
                <tr key={t.id}>
                  <td className="font-mono">#{t.id}</td>
                  <td>
                    <div className="task-cell-title">{t.title}</div>
                    {t.description && <div className="task-cell-desc">{t.description}</div>}
                  </td>
                  <td>
                    <span className={`badge-priority ${t.priority}`}>{t.priority}</span>
                  </td>
                  <td>{getStatusBadge(t.status)}</td>
                  <td>
                    <div className="assignee-cell">
                      <User size={14} />
                      <span>{t.assignee ? t.assignee.username : "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="text-muted">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="text-right">
                    <button
                      className="icon-btn edit"
                      onClick={() => {
                        setEditingTask(t);
                        setIsModalOpen(true);
                      }}
                      title="Edit Task"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(t.id)}
                      title="Delete Task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-table-cell">
                    No tasks match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchTasks}
        initialData={editingTask}
      />
    </div>
  );
};

export default TaskList;
