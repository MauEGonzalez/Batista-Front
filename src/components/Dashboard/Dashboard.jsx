import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';

const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#64748b'];

const DashboardSection = ({ title, transactions }) => {
  const [activeType, setActiveType] = useState('Egreso'); 
  const [activeCategory, setActiveCategory] = useState(null); 

  const totals = transactions.reduce((acc, t) => {
    if (t.currency === 'UYU') {
      t.type === 'Ingreso' ? acc.uyu.ingresos += t.amount : acc.uyu.egresos += t.amount;
    } else {
      t.type === 'Ingreso' ? acc.usd.ingresos += t.amount : acc.usd.egresos += t.amount;
    }
    return acc;
  }, { uyu: { ingresos: 0, egresos: 0 }, usd: { ingresos: 0, egresos: 0 } });

  const saldos = {
    uyu: totals.uyu.ingresos - totals.uyu.egresos,
    usd: totals.usd.ingresos - totals.usd.egresos
  };

  const handleTypeChange = (type) => {
    setActiveType(type);
    setActiveCategory(null);
  };

  const relevantTransactions = transactions.filter(t => t.type === activeType);

  let chartData = [];
  if (!activeCategory) {
    const grouped = relevantTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    chartData = Object.keys(grouped).map(key => ({ name: key, value: grouped[key] }));
  } else {
    const filteredByCategory = relevantTransactions.filter(t => t.category === activeCategory);
    const grouped = filteredByCategory.reduce((acc, t) => {
      const sub = t.subcategory || 'General';
      acc[sub] = (acc[sub] || 0) + t.amount;
      return acc;
    }, {});
    chartData = Object.keys(grouped).map(key => ({ name: key, value: grouped[key] }));
  }

  chartData.sort((a, b) => b.value - a.value);

  return (
    <div className={styles.sectionContainer}>
      <h2 className={styles.sectionTitle}>{title}</h2>

      <div className={styles.cardsGrid}>
        <div className={`${styles.card} ${styles.cardUyu}`}>
          <h3 className={styles.cardTitle}>Saldo UYU</h3>
          <p className={styles.cardBalance} style={{ color: saldos.uyu < 0 ? '#dc2626' : '#1e293b' }}>
            $ {saldos.uyu.toFixed(2)}
          </p>
          <div className={styles.cardDetails}>
            <span className={styles.detailIngreso} title="Total Ingresos UYU">↑ ${totals.uyu.ingresos.toFixed(2)}</span>
            <span className={styles.detailEgreso} title="Total Egresos UYU">↓ ${totals.uyu.egresos.toFixed(2)}</span>
          </div>
        </div>
        
        <div className={`${styles.card} ${styles.cardUsd}`}>
          <h3 className={styles.cardTitle}>Saldo USD</h3>
          <p className={styles.cardBalance} style={{ color: saldos.usd < 0 ? '#dc2626' : '#1e293b' }}>
            U$S {saldos.usd.toFixed(2)}
          </p>
          <div className={styles.cardDetails}>
            <span className={styles.detailIngreso} title="Total Ingresos USD">↑ U$S{totals.usd.ingresos.toFixed(2)}</span>
            <span className={styles.detailEgreso} title="Total Egresos USD">↓ U$S{totals.usd.egresos.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartTabs}>
          <button 
            className={`${styles.tabBtn} ${activeType === 'Egreso' ? styles.activeTabEgreso : ''}`}
            onClick={() => handleTypeChange('Egreso')}
          >
            Ver Egresos
          </button>
          <button 
            className={`${styles.tabBtn} ${activeType === 'Ingreso' ? styles.activeTabIngreso : ''}`}
            onClick={() => handleTypeChange('Ingreso')}
          >
            Ver Ingresos
          </button>
        </div>

        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>
            {activeCategory 
              ? `Subcategorías de: ${activeCategory}` 
              : `Distribución de ${activeType}s Totales`}
          </h3>
          {activeCategory && (
            <button className={styles.backBtn} onClick={() => setActiveCategory(null)}>
              ← Volver
            </button>
          )}
        </div>
        
        {chartData.length > 0 ? (
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={!activeCategory ? (data) => setActiveCategory(data.name) : undefined}
                  style={{ cursor: !activeCategory ? 'pointer' : 'default' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$ ${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            {!activeCategory && <p className={styles.chartHint}>👆 Haz clic en una porción para ver sus subcategorías</p>}
          </div>
        ) : (
          <p className={styles.noData}>No hay {activeType.toLowerCase()}s para este período.</p>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ transactions }) => {
  const { entity } = useParams();
  
  // Diccionario para mapear la URL al nombre real del fondo en tu base de datos
  const fundMap = {
    sucesores: 'Almiscar',
    gloria: 'Gloria',
    ico: 'Ico'
  };
  
  const titleMap = {
    sucesores: 'Sucesores de Almiscar Batista',
    gloria: 'Capital: Gloria Rodriguez',
    ico: 'Capital: Ico Batista'
  };

  const activeFund = fundMap[entity] || 'Almiscar';
  const displayTitle = titleMap[entity] || 'Sucesores de Almiscar Batista';

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [filterMode, setFilterMode] = useState('currentMonth');
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);

  // Primero filtramos las transacciones por la empresa actual, luego aplicamos los filtros de fecha
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Filtro de empresa (los registros viejos sin fondo los toma Almiscar por defecto)
      const belongsToActiveFund = (t.fund === activeFund) || (!t.fund && activeFund === 'Almiscar');
      if (!belongsToActiveFund) return false;

      // Filtro de tiempo
      if (filterMode === 'historical') return true;
      
      const txDate = t.date.split('T')[0]; 
      
      if (filterMode === 'currentMonth') {
        return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
      }
      
      if (filterMode === 'custom') {
        const matchesStart = startDate ? txDate >= startDate : true;
        const matchesEnd = endDate ? txDate <= endDate : true;
        return matchesStart && matchesEnd;
      }
      
      return true;
    });
  }, [transactions, filterMode, startDate, endDate, firstDayOfMonth, lastDayOfMonth, activeFund]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Dashboard Operativo</h1>
        
        <div className={styles.filterBar}>
          <div className={styles.filterButtons}>
            <button 
              className={`${styles.filterBtn} ${filterMode === 'currentMonth' ? styles.activeFilterBtn : ''}`}
              onClick={() => setFilterMode('currentMonth')}
            >
              Mes Actual
            </button>
            <button 
              className={`${styles.filterBtn} ${filterMode === 'historical' ? styles.activeFilterBtn : ''}`}
              onClick={() => setFilterMode('historical')}
            >
              Histórico
            </button>
            <button 
              className={`${styles.filterBtn} ${filterMode === 'custom' ? styles.activeFilterBtn : ''}`}
              onClick={() => setFilterMode('custom')}
            >
              Rango Personalizado
            </button>
          </div>

          {filterMode === 'custom' && (
            <div className={styles.customDates}>
              <div className={styles.dateInputGroup}>
                <label>Desde:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={styles.dateInput} />
              </div>
              <div className={styles.dateInputGroup}>
                <label>Hasta:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={styles.dateInput} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Un único contenedor central al 100% de ancho */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <DashboardSection 
          title={displayTitle} 
          transactions={filteredTransactions} 
        />
      </div>
    </div>
  );
};

export default Dashboard;