import { useState } from 'react';
import styles from './ExpenseForm.module.css';

const ExpenseForm = ({ onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentación');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newExpense = {
      id: crypto.randomUUID(),
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString()
    };

    onAddExpense(newExpense);
    
    // Limpiamos el formulario
    setDescription('');
    setAmount('');
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Registrar Nuevo Gasto</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>Descripción del gasto</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.input}
            placeholder="Ej. 100 Fardos de alfalfa"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="amount" className={styles.label}>Monto ($)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={styles.input}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>Categoría</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.select}
          >
            <option value="Alimentación">Alimentación (Forraje, Ración)</option>
            <option value="Veterinaria">Veterinaria (Vacunas, Insumos)</option>
            <option value="Maquinaria">Maquinaria (Combustible, Repuestos)</option>
            <option value="Infraestructura">Infraestructura (Alambrados, Galpones)</option>
            <option value="Sueldos">Sueldos y Jornales</option>
            <option value="Otros">Otros Gastos</option>
          </select>
        </div>

        <button type="submit" className={styles.submitButton}>
          Guardar Gasto
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;