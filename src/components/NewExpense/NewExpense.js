import { useState } from "react/cjs/react.development";
import ExpenseForm from "./ExpenseForm";
import "./NewExpense.css";

function NewExpense(props) {
  const [isEditing, setIsEditing] = useState(false);
  const saveExpenseDataHandler = (enteredExpenseData) => {
    const expenseData = {
      ...enteredExpenseData,
      id: Math.random().toString(),
    };
    if (enteredExpenseData.title !== "" && enteredExpenseData.amount !== "") {
      setIsEditing(false);
    }

    props.onAddExpense(expenseData);
  };
  function onEditExpense() {
    setIsEditing(true);
  }
  function stopEditing() {
    setIsEditing(false);
  }
  return (
    <div className="new-expense">
      {!isEditing && <button onClick={onEditExpense}>Add New Expense</button>}
      {isEditing && (
        <ExpenseForm
          onCancel={stopEditing}
          onSaveExpenseData={saveExpenseDataHandler}
        />
      )}
    </div>
  );
}

export default NewExpense;
