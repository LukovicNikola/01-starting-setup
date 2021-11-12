import React from "react";
import Chart from "../Chart/Chart";
function ExpensesChart(props) {
  const chartDataPoints = [
    { lable: "Jan", value: 0 },
    { lable: "Feb", value: 0 },
    { lable: "Mart", value: 0 },
    { lable: "April", value: 0 },
    { lable: "Maj", value: 0 },
    { lable: "Jun", value: 0 },
    { lable: "Jul", value: 0 },
    { lable: "Avgust", value: 0 },
    { lable: "Septembar", value: 0 },
    { lable: "Oktobar", value: 0 },
    { lable: "Novembar", value: 0 },
    { lable: "Decembar", value: 0 },
  ];

  for (const expense of props.expenses) {
    const expenseMonth = expense.date.getMonth();
    chartDataPoints[expenseMonth].value += expense.amount;
  }

  return <Chart dataPoints={chartDataPoints} />;
}

export default ExpensesChart;
