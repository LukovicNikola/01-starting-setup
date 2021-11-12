import Card from "../UI/Card";
import "./Expenses.css";
import React, { useState } from "react";
import ExpensesFilter from "./ExpensesFilter";
import ExpensesList from "./ExpensesList";
import ExpensesChart from "./ExpensesChart";

function Expenses(props) {
  const [filteredYear, setFilteredYear] = useState("2020");
  function filterChangeHendler(selectedYear) {
    setFilteredYear(selectedYear);
  }

  const yearFilter = props.items.filter((item) => {
    return item.date.getFullYear().toString() === filteredYear;
  });

  return (
    <Card className="expenses">
      <ExpensesFilter
        selected={filteredYear}
        onChangeFilter={filterChangeHendler}
      />
      <ExpensesChart expenses={yearFilter} />
      <ExpensesList items={yearFilter} />
    </Card>
  );
}

export default Expenses;
