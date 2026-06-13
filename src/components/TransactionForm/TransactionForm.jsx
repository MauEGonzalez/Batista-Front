import React, { useState, useEffect } from 'react';
import styles from './TransactionForm.module.css';

const TransactionForm = ({ onSaveTransaction, initialData = null, onCancel = null, transactions = [] }) => {
  const [fund, setFund] = useState('Almiscar');
  const [type, setType] = useState('Egreso');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('UYU');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subcategory, setSubcategory] = useState('');
  
  // Estado para el mensaje de éxito
  const [successMessage, setSuccessMessage] = useState('');

  // Categorías base
  const defaultEgreso = ['Alimentación', 'Veterinaria', 'Maquinaria', 'Infraestructura', 'Sueldos', 'Otros'];
  const defaultIngreso = ['Venta de Ganado', 'Venta de Cosecha', 'Subsidios', 'Otros Ingresos'];

  // Estados dinámicos para las categorías
  const [egresoCategorias, setEgresoCategorias] = useState(defaultEgreso);
  const [ingresoCategorias, setIngresoCategorias] = useState(defaultIngreso);

  const [category, setCategory] = useState('Alimentación');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Efecto para aprender categorías del historial (transactions)
  useEffect(() => {
    const historicalEgreso = transactions.filter(t => t.type === 'Egreso').map(t => t.category);
    const historicalIngreso = transactions.filter(t => t.type === 'Ingreso').map(t => t.category);
    
    // Unimos las bases con las históricas y eliminamos duplicados usando Set
    setEgresoCategorias([...new Set([...defaultEgreso, ...historicalEgreso])]);
    setIngresoCategorias([...new Set([...defaultIngreso, ...historicalIngreso])]);
  }, [transactions]);

  // Poblamos datos si estamos editando
  useEffect(() => {
    if (initialData) {
      setFund(initialData.fund || 'Almiscar');
      setType(initialData.type);
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setCurrency(initialData.currency);
      
      // FIX: Recortamos la fecha de MongoDB para que el input HTML no arroje error en consola
      const formattedDate = initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0];
      setDate(formattedDate);
      
      setCategory(initialData.category);
      setSubcategory(initialData.subcategory || '');
    }
  }, [initialData]);

  // Generar lista de subcategorías históricas basadas en la categoría seleccionada
  const availableSubcategories = [...new Set(
    transactions
      .filter(t => t.category === category && t.subcategory && t.subcategory !== 'General')
      .map(t => t.subcategory)
  )];

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'Egreso' ? egresoCategorias[0] : ingresoCategorias[0]);
    setIsAddingCategory(false);
    setNewCategoryName('');
    setSubcategory('');
  };

  const handleCategorySelect = (e) => {
    if (e.target.value === 'ADD_NEW') {
      setIsAddingCategory(true);
    } else {
      setCategory(e.target.value);
      setIsAddingCategory(false);
      setSubcategory(''); // Limpiamos subcategoría al cambiar de categoría principal
    }
  };

  const handleSaveNewCategory = (e) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    if (type === 'Egreso') {
      setEgresoCategorias([...egresoCategorias, trimmedName]);
    } else {
      setIngresoCategorias([...ingresoCategorias, trimmedName]);
    }

    setCategory(trimmedName);
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAddingCategory) {
      handleSaveNewCategory(e);
      return;
    }
    if (!description || !amount || !date || category === 'ADD_NEW') return;

    const transaction = {
      id: initialData ? initialData.id : crypto.randomUUID(),
      fund,
      type,
      description,
      amount: parseFloat(amount),
      currency,
      category,
      subcategory: subcategory.trim() || 'General',
      date
    };

    onSaveTransaction(transaction);
    
    if (!initialData) {
      // Mostrar cartel de éxito
      setSuccessMessage(`¡${type} guardado con éxito!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      // Limpiar campos para la siguiente carga rápida
      setDescription('');
      setAmount('');
      setSubcategory('');
    }
  };

  const currentCategories = type === 'Egreso' ? egresoCategorias : ingresoCategorias;

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>{initialData ? 'Editar Transacción' : 'Registrar Transacción'}</h2>
      
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className={styles.successToast}>
          {successMessage}
        </div>
      )}

      <div className={styles.fundSelector}>
        <label className={styles.label}>Fondo Destino:</label>
        <select value={fund} onChange={(e) => setFund(e.target.value)} className={styles.select}>
          <option value="Almiscar">Sucesores de Almiscar Batista</option>
          <option value="Gloria">Capital: Gloria Rodriguez</option>
        </select>
      </div>

      <div className={styles.typeSelector}>
        <button 
          className={`${styles.typeBtn} ${type === 'Ingreso' ? styles.activeIngreso : ''}`}
          onClick={() => handleTypeChange('Ingreso')}
          type="button"
        >
          Entrada (Ingreso)
        </button>
        <button 
          className={`${styles.typeBtn} ${type === 'Egreso' ? styles.activeEgreso : ''}`}
          onClick={() => handleTypeChange('Egreso')}
          type="button"
        >
          Salida (Gasto)
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="date" className={styles.label}>Fecha</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>Descripción</label>
          <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className={styles.input} placeholder="Ej. Venta de 10 novillos" required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="amount" className={styles.label}>Monto</label>
          <div className={styles.amountWrapper}>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={styles.currencySelect}>
              <option value="UYU">$ UYU</option>
              <option value="USD">U$S USD</option>
            </select>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${styles.input} ${styles.amountInput}`} placeholder="0.00" min="0" step="0.01" required />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>Categoría Principal</label>
          <select id="category" value={isAddingCategory ? 'ADD_NEW' : category} onChange={handleCategorySelect} className={styles.select}>
            {currentCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            <option value="ADD_NEW" className={styles.addNewOption}>+ Crear nueva categoría...</option>
          </select>

          {isAddingCategory && (
            <div className={styles.newCategoryGroup}>
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nombre categoría" className={styles.input} autoFocus />
              <div className={styles.newCategoryActions}>
                <button type="button" onClick={handleSaveNewCategory} className={styles.addCatBtn}>Guardar</button>
                <button type="button" onClick={() => setIsAddingCategory(false)} className={styles.cancelCatBtn}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subcategory" className={styles.label}>Subcategoría (Opcional)</label>
          {/* El atributo list="subcategories" conecta este input con el <datalist> de abajo */}
          <input
            type="text"
            id="subcategory"
            list="subcategories"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className={styles.input}
            placeholder="Ej. Vacunas, Fardos, etc. (O elige de la lista)"
          />
          {/* Datalist provee autocompletado nativo sin librerías extra */}
          <datalist id="subcategories">
            {availableSubcategories.map(sub => (
              <option key={sub} value={sub} />
            ))}
          </datalist>
        </div>

        <div className={styles.actionButtonsContainer}>
          <button type="submit" className={`${styles.submitButton} ${type === 'Ingreso' ? styles.btnIngreso : styles.btnEgreso}`} disabled={isAddingCategory}>
            {initialData ? 'Actualizar ' : 'Guardar '} {type}
          </button>
          {onCancel && <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancelar</button>}
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;