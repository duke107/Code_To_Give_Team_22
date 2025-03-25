import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";
import AdminNavbar from "./AdminNavbar";

const AdminRoute = () => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div>
      {/* Outlet will render the appropriate child route */}
      <AdminNavbar/>
      <Outlet />
    </div>
  );
};

export default AdminRoute;
