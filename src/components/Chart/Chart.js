import React from "react";
import "./Chart.css";
import ChartBar from "./ChartBar";

function Chart(props) {
  return (
    <div className="chart">
      {props.dataPoints.map((dataPoint) => (
        <ChartBar
          value={dataPoint.value}
          maxValue={null}
          lable={dataPoint.lable}
          key={dataPoint.lable}
        />
      ))}
    </div>
  );
}

export default Chart;
