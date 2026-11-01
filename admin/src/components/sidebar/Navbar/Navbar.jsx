import React from "react";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  return (
    <header className="admin-navbar">
      <a className="admin-brand" href="/dashboard" aria-label="Foodyra admin dashboard">
        <span>foodyra<span className="admin-brand-dot">.</span></span>
        <small>ADMIN</small>
      </a>
      <div className="admin-navbar-right">
        <span className="admin-workspace-label"><span /> Management workspace</span>
        <button className="admin-logout" onClick={onLogout} type="button">Sign out</button>
      </div>
    </header>
  );
};

export default Navbar;