import ExpenseItem from "./ExpenseItem";
import Card from "../UI/Card";
import "./Expenses.css";
import React, { useState } from "react";
import ExpensesFilter from "./ExpensesFilter";

function Expenses(props) {
  const [filteredYear, setFilteredYear] = useState("2020");
  function filterChangeHendler(selectedYear) {
    setFilteredYear(selectedYear);
  }

  const yearFilter = props.items.filter((item) => {
    return item.date.getFullYear().toString() === filteredYear;
  });
  let expenseContent = <p>There is no data</p>;

  if (yearFilter.length > 0) {
    expenseContent = yearFilter.map((expense) => (
      <ExpenseItem
        key={expense.id}
        title={expense.title}
        amount={expense.amount}
        date={expense.date}
      />
    ));
  }

  return (
    <Card className="expenses">
      <ExpensesFilter
        selected={filteredYear}
        onChangeFilter={filterChangeHendler}
      />
      {expenseContent}
    </Card>
  );
}

export default Expenses;
