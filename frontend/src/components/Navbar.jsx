import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Kanban, ListTodo, Bug, LogOut, ShieldCheck, User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="brand-logo">
            <ShieldCheck size={26} className="logo-icon" />
          </div>
          <span className="brand-title">TaskFlow</span>
          <span className="brand-badge">Agile v1.0</span>
        </div>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <Kanban size={18} />
            <span>Kanban Board</span>
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <ListTodo size={18} />
            <span>Task List</span>
          </NavLink>
          <NavLink to="/bugs" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <Bug size={18} />
            <span>Defects & Bugs</span>
          </NavLink>
        </div>

        <div className="nav-user">
          <div className="user-profile">
            <div className="avatar">
              <User size={16} />
            </div>
            <span className="user-name">{user?.username || "Admin"}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout" title="Sign out">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
