import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './TransactionForm.module.css';

const TransactionForm = ({ onSaveTransaction, initialData = null, onCancel = null, transactions = [] }) => {
  const { entity } = useParams();
  const fundMap = { sucesores: 'Almiscar', gloria: 'Gloria', ico: 'Ico' };
  
  const activeFund = fundMap[entity] || 'Almiscar';

  const [type, setType] = useState('Egreso');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('UYU');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subcategory, setSubcategory] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');

  const defaultEgreso = ['Alimentación', 'Veterinaria', 'Maquinaria', 'Infraestructura', 'Sueldos', 'Otros'];
  const defaultIngreso = ['Venta de Ganado', 'Venta de Cosecha', 'Subsidios', 'Otros Ingresos'];

  const [egresoCategorias, setEgresoCategorias] = useState(defaultEgreso);
  const [ingresoCategorias, setIngresoCategorias] = useState(defaultIngreso);

  const [category, setCategory] = useState('Alimentación');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    const entityTransactions = transactions.filter(t => (t.fund === activeFund) || (!t.fund && activeFund === 'Almiscar'));
    
    const historicalEgreso = entityTransactions.filter(t => t.type === 'Egreso').map(t => t.category);
    const historicalIngreso = entityTransactions.filter(t => t.type === 'Ingreso').map(t => t.category);
    
    setEgresoCategorias([...new Set([...defaultEgreso, ...historicalEgreso])]);
    setIngresoCategorias([...new Set([...defaultIngreso, ...historicalIngreso])]);
  }, [transactions, activeFund]);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setCurrency(initialData.currency);
      
      const formattedDate = initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0];
      setDate(formattedDate);
      
      setCategory(initialData.category);
      setSubcategory(initialData.subcategory || '');
    }
  }, [initialData]);

  // Generamos la lista de subcategorías históricas
  const availableSubcategories = [...new Set(
    transactions
      .filter(t => t.category === category && t.subcategory && t.subcategory !== 'General' && ((t.fund === activeFund) || (!t.fund && activeFund === 'Almiscar')))
      .map(t => t.subcategory)
  )];

  // Generamos la lista de descripciones históricas únicas para predecir
  const availableDescriptions = [...new Set(
    transactions
      .filter(t => t.type === type && ((t.fund === activeFund) || (!t.fund && activeFund === 'Almiscar')))
      .map(t => t.description)
  )];

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'Egreso' ? egresoCategorias[0] : ingresoCategorias[0]);
    setIsAddingCategory(false);
    setNewCategoryName('');
    setSubcategory('');
    setDescription('');
  };

  // Función inteligente que autocompleta al reconocer una descripción
  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);

    // Buscamos si esta descripción ya existe en el historial de esta empresa
    const pastTransaction = transactions.find(t => 
      t.description === val && 
      t.type === type && 
      ((t.fund === activeFund) || (!t.fund && activeFund === 'Almiscar'))
    );

    // Si la encontramos, autocompletamos los demás campos mágicamente
    if (pastTransaction && !initialData) {
      setCategory(pastTransaction.category);
      setSubcategory(pastTransaction.subcategory === 'General' ? '' : pastTransaction.subcategory);
      // No autocompletamos el monto porque suele variar, pero ya le ahorramos 2 clics
    }
  };

  const handleCategorySelect = (e) => {
    if (e.target.value === 'ADD_NEW') {
      setIsAddingCategory(true);
    } else {
      setCategory(e.target.value);
      setIsAddingCategory(false);
      setSubcategory('');
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
      fund: activeFund, 
      type,
      description: description.trim(), // Limpiamos espacios extra
      amount: parseFloat(amount),
      currency,
      category,
      subcategory: subcategory.trim() || 'General',
      date
    };

    onSaveTransaction(transaction);
    
    if (!initialData) {
      setSuccessMessage(`¡${type} guardado con éxito!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      setDescription('');
      setAmount('');
      setSubcategory('');
    }
  };

  const currentCategories = type === 'Egreso' ? egresoCategorias : ingresoCategorias;

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>{initialData ? 'Editar Transacción' : 'Registrar Transacción'}</h2>
      
      {successMessage && (
        <div className={styles.successToast}>
          {successMessage}
        </div>
      )}

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
          {/* Conectamos el input con el datalist de descripciones */}
          <input 
            type="text" 
            id="description" 
            list="descriptions"
            value={description} 
            onChange={handleDescriptionChange} 
            className={styles.input} 
            placeholder="Ej. Venta de 10 novillos" 
            required 
            autoComplete="off"
          />
          <datalist id="descriptions">
            {availableDescriptions.map((desc, idx) => (
              <option key={`desc-${idx}`} value={desc} />
            ))}
          </datalist>
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
          <input
            type="text"
            id="subcategory"
            list="subcategories"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className={styles.input}
            placeholder="Ej. Vacunas, Fardos, etc. (O elige de la lista)"
            autoComplete="off"
          />
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