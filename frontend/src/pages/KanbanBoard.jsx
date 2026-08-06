import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Search, Filter, Trash2, Edit3, User, CheckCircle2, Clock, ListTodo } from "lucide-react";
import api from "../api/axios";
import TaskModal from "../components/TaskModal";

const COLUMNS = [
  { id: "todo", label: "To Do", icon: ListTodo, color: "#6366f1" },
  { id: "in_progress", label: "In Progress", icon: Clock, color: "#f59e0b" },
  { id: "done", label: "Done", icon: CheckCircle2, color: "#10b981" },
];

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
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

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.patch(`tasks/${taskId}/`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status on server", err);
      // Revert if error
      fetchTasks();
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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "high":
        return "badge-priority high";
      case "medium":
        return "badge-priority medium";
      case "low":
        return "badge-priority low";
      default:
        return "badge-priority";
    }
  };

  return (
    <div className="board-container">
      {/* Board Controls */}
      <div className="board-header">
        <div className="board-title-group">
          <h2>Agile Sprint Board</h2>
          <span className="task-count-pill">{filteredTasks.length} active tasks</span>
        </div>

        <div className="board-actions">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-dropdown">
            <Filter size={16} className="filter-icon" />
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Columns */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading sprint board...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-columns">
            {COLUMNS.map((col) => {
              const IconComp = col.icon;
              const colTasks = filteredTasks.filter((t) => t.status === col.id);

              return (
                <div key={col.id} className="kanban-column">
                  <div className="column-header" style={{ borderTopColor: col.color }}>
                    <div className="column-title">
                      <IconComp size={18} style={{ color: col.color }} />
                      <span>{col.label}</span>
                    </div>
                    <span className="column-count">{colTasks.length}</span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`column-body ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                      >
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`task-card ${snapshot.isDragging ? "is-dragging" : ""}`}
                              >
                                <div className="card-top">
                                  <span className={getPriorityBadgeClass(task.priority)}>
                                    {task.priority}
                                  </span>
                                  <div className="card-actions">
                                    <button
                                      onClick={() => {
                                        setEditingTask(task);
                                        setIsModalOpen(true);
                                      }}
                                      className="card-btn"
                                      title="Edit Task"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(task.id)}
                                      className="card-btn delete"
                                      title="Delete Task"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                <h4 className="card-title">{task.title}</h4>
                                {task.description && (
                                  <p className="card-description">{task.description}</p>
                                )}

                                <div className="card-footer">
                                  <div className="assignee-tag">
                                    <User size={14} />
                                    <span>{task.assignee ? task.assignee.username : "Unassigned"}</span>
                                  </div>
                                  <span className="card-date">
                                    {new Date(task.created_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colTasks.length === 0 && (
                          <div className="empty-column-placeholder">
                            <span>Drop items here</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchTasks}
        initialData={editingTask}
      />
    </div>
  );
};

export default KanbanBoard;
