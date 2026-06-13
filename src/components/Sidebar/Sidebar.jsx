import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <h2 className={styles.logo}>Sucesores de Almiscar Batista</h2>
        <p className={styles.subtitle}>Gestión Agro</p>
      </div>
      
      <nav className={styles.nav}>
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
        >
          Panel Central
        </NavLink>
        <NavLink 
          to="/nueva-transaccion" 
          className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
        >
          Transacciones
        </NavLink>
        <NavLink 
          to="/historial" 
          className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
        >
          Historial
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;