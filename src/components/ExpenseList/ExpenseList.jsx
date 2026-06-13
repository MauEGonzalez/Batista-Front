import styles from './ExpenseList.module.css';

const ExpenseList = ({ expenses }) => {
  if (expenses.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Aún no hay gastos registrados.</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <h3 className={styles.title}>Historial de Gastos</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.description}</td>
                <td>
                  <span className={styles.categoryBadge}>{expense.category}</span>
                </td>
                <td className={styles.amount}>$ {expense.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;