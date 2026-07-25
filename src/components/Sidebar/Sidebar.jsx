import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();
  // Detecta la entidad actual desde la URL (ej: /gloria/historial -> 'gloria')
  const currentEntity = location.pathname.split('/')[1] || 'sucesores';
  const [openMenu, setOpenMenu] = useState(currentEntity);

  // Asegura que el acordeón correcto esté abierto si el usuario navega directamente con un link
  useEffect(() => {
    if (['sucesores', 'gloria', 'ico'].includes(currentEntity)) {
      setOpenMenu(currentEntity);
    }
  }, [currentEntity]);

  const toggleMenu = (menuId) => {
    setOpenMenu(openMenu === menuId ? null : menuId);
  };

  const entities = [
    { id: 'sucesores', title: 'Sucesores de Almiscar' },
    { id: 'gloria', title: 'Gloria Rodriguez' },
    { id: 'ico', title: 'Ico Batista' }
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <h2 className={styles.logo}>Sistema de Gestión</h2>
        <p className={styles.subtitle}>Operaciones Agro</p>
      </div>
      
      <nav className={styles.nav}>
        {entities.map(entity => (
          <div key={entity.id} className={styles.menuSection}>
            <button 
              className={`${styles.menuBtn} ${openMenu === entity.id ? styles.menuBtnActive : ''}`}
              onClick={() => toggleMenu(entity.id)}
            >
              {entity.title}
              <span className={styles.arrow}>{openMenu === entity.id ? '▼' : '▶'}</span>
            </button>
            
            {openMenu === entity.id && (
              <div className={styles.submenu}>
                <NavLink 
                  to={`/${entity.id}`} 
                  end
                  className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                >
                  Panel Central
                </NavLink>
                <NavLink 
                  to={`/${entity.id}/nueva-transaccion`} 
                  className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                >
                  Transacciones
                </NavLink>
                <NavLink 
                  to={`/${entity.id}/historial`} 
                  className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}
                >
                  Historial
                </NavLink>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;