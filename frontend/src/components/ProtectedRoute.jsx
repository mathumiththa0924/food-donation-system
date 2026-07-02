import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role, allowedRoles }) {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check single role or multiple allowed roles
  const rolesToCheck = allowedRoles || (role ? [role] : []);
  
  if (rolesToCheck.length > 0 && !rolesToCheck.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}