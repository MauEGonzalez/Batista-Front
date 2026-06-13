import React, { useState } from 'react';
import TransactionForm from '../TransactionForm/TransactionForm.jsx';
import styles from './TransactionHistory.module.css';

const TransactionHistory = ({ transactions, onDelete, onUpdate }) => {
  const [filterType, setFilterType] = useState('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Estado para controlar la transacción que se está editando
  const [editingTransaction, setEditingTransaction] = useState(null);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filterType === 'Todos' || transaction.type === filterType;
    const matchesStartDate = startDate ? transaction.date >= startDate : true;
    const matchesEndDate = endDate ? transaction.date <= endDate : true;
    return matchesType && matchesStartDate && matchesEndDate;
  });

  const sortedTransactions = filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Función que se dispara cuando el formulario de edición se envía
  const handleSaveEdit = (updatedTransaction) => {
    onUpdate(updatedTransaction);
    setEditingTransaction(null); // Cerramos el modal
  };

  return (
    <div className={styles.historyContainer}>
      
      {/* Modal de Edición (se muestra si hay una transacción seleccionada) */}
      {editingTransaction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <TransactionForm 
              initialData={editingTransaction}
              onSaveTransaction={handleSaveEdit}
              onCancel={() => setEditingTransaction(null)}
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