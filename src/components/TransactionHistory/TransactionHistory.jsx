import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TransactionForm from '../TransactionForm/TransactionForm.jsx';
import styles from './TransactionHistory.module.css';

const TransactionHistory = ({ transactions, onDelete, onUpdate }) => {
  const { entity } = useParams();
  
  const fundMap = { sucesores: 'Almiscar', gloria: 'Gloria', ico: 'Ico' };
  const activeFund = fundMap[entity] || 'Almiscar';

  const [filterType, setFilterType] = useState('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Doble filtro: Primero por empresa activa, luego por los filtros del usuario
  const filteredTransactions = transactions.filter((transaction) => {
    // 1. Filtro de Empresa
    const belongsToActiveFund = (transaction.fund === activeFund) || (!transaction.fund && activeFund === 'Almiscar');
    if (!belongsToActiveFund) return false;

    // 2. Filtros de Usuario
    const matchesType = filterType === 'Todos' || transaction.type === filterType;
    const matchesStartDate = startDate ? transaction.date >= startDate : true;
    const matchesEndDate = endDate ? transaction.date <= endDate : true;
    
    return matchesType && matchesStartDate && matchesEndDate;
  });

  const sortedTransactions = filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleSaveEdit = (updatedTransaction) => {
    onUpdate(updatedTransaction);
    setEditingTransaction(null);
  };

  return (
    <div className={styles.historyContainer}>
      
      {editingTransaction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <TransactionForm 
              initialData={editingTransaction}
              onSaveTransaction={handleSaveEdit}
              onCancel={() => setEditingTransaction(null)}
              transactions={transactions}
            />
          </div>
        </div>
      )}

      <div className={styles.filtersWrapper}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Tipo de Operación</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.select}
          >
            <option value="Todos">Todos</option>
            <option value="Ingreso">Solo Ingresos</option>
            <option value="Egreso">Solo Egresos</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Desde Fecha</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Hasta Fecha</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.input}
          />
        </div>
        
        <button 
          className={styles.clearBtn}
          onClick={() => {
            setFilterType('Todos');
            setStartDate('');
            setEndDate('');
          }}
        >
          Limpiar Filtros
        </button>
      </div>

      {sortedTransactions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No se encontraron transacciones con los filtros actuales.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>
                    <span className={t.type === 'Ingreso' ? styles.badgeIngreso : styles.badgeEgreso}>
                      {t.type}
                    </span>
                  </td>
                  <td>{t.description}</td>
                  <td>{t.category}</td>
                  <td className={styles.amount}>
                    {t.currency === 'UYU' ? '$' : 'U$S'} {t.amount.toFixed(2)}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.editBtn} 
                        onClick={() => setEditingTransaction(t)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className={styles.deleteBtn} 
                        onClick={() => onDelete(t.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;