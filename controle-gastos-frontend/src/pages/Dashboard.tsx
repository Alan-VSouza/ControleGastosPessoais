import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user?.fullName}!</p>
      <p>Email: {user?.email}</p>
      <button
        onClick={handleLogout}
        style={{
          padding: "12px 24px",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "20px",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
