import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import TransactionForm from './components/TransactionForm/TransactionForm.jsx';
import TransactionHistory from './components/TransactionHistory/TransactionHistory.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';

// Tomamos la URL de la variable de entorno, con un fallback al localhost para desarrollo
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/transactions';

const App = () => {
  const [transactions, setTransactions] = useState([]);

  // 1. LEER (GET) - Cargar transacciones desde MongoDB al iniciar
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error de red');
        const data = await response.json();
        
        // Adaptamos el _id de MongoDB al formato id que usan nuestros componentes
        const formattedData = data.map(item => ({
          ...item,
          id: item._id
        }));
        setTransactions(formattedData);
      } catch (error) {
        console.error("Error al cargar las transacciones:", error);
      }
    };

    fetchTransactions();
  }, []);

  // 2. CREAR (POST)
  const handleAddTransaction = async (newTransaction) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      const savedData = await response.json();
      
      savedData.id = savedData._id; // Adaptamos el ID
      setTransactions((prev) => [savedData, ...prev]);
    } catch (error) {
      console.error("Error al guardar en base de datos:", error);
    }
  };

  // 3. ELIMINAR (DELETE)
  const handleDeleteTransaction = async (id) => {
    if(window.confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      try {
        await fetch(`${API_URL}/${id}`, { 
          method: 'DELETE' 
        });
        setTransactions((prev) => prev.filter(t => t.id !== id));
      } catch (error) {
        console.error("Error al eliminar de la base de datos:", error);
      }
    }
  };

  // 4. ACTUALIZAR (PUT)
  const handleUpdateTransaction = async (updatedTransaction) => {
    try {
      const response = await fetch(`${API_URL}/${updatedTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTransaction)
      });
      const savedData = await response.json();
      
      savedData.id = savedData._id; // Adaptamos el ID
      setTransactions((prev) => 
        prev.map(t => t.id === savedData.id ? savedData : t)
      );
    } catch (error) {
      console.error("Error al actualizar en la base de datos:", error);
    }
  };

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0fdf4' }}>
        <Sidebar />
        
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Routes>
            <Route 
              path="/" 
              element={<Dashboard transactions={transactions} />} 
            />
            
            <Route 
              path="/nueva-transaccion" 
              element={
                <div>
                  <h1 style={{ color: '#065f46', marginBottom: '2rem', fontFamily: 'system-ui, sans-serif' }}>Registro Operativo</h1>
                  <TransactionForm 
                    onSaveTransaction={handleAddTransaction} 
                    transactions={transactions} 
                  />
                </div>
              } 
            />

            <Route 
              path="/historial" 
              element={
                <div>
                  <h1 style={{ color: '#065f46', marginBottom: '2rem', fontFamily: 'system-ui, sans-serif' }}>Historial y Modificaciones</h1>
                  <TransactionHistory 
                    transactions={transactions} 
                    onDelete={handleDeleteTransaction}
                    onUpdate={handleUpdateTransaction}
                  />
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;