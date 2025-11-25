import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <h1 className={styles.logo} onClick={() => navigate("/dashboard")}>
          💰 Controle de Gastos
        </h1>
        
        <div className={styles.navLinks}>
          <span className={styles.userGreeting}>Olá, {user?.fullName}!</span>
          
          <button 
            onClick={() => navigate("/dashboard")} 
            className={styles.navButton}
          >
            Dashboard
          </button>
          
          <button 
            onClick={() => navigate("/transactions")} 
            className={styles.navButton}
          >
            Transações
          </button>
          
          <button 
            onClick={handleLogout} 
            className={styles.navButtonLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
