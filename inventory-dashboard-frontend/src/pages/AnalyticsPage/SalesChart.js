import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Or import specific chart types

const SalesChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (data && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      if (chartInstance.current) {
        chartInstance.current.destroy(); // Destroy previous chart if it exists
      }

      chartInstance.current = new Chart(ctx, {
        type: 'bar', // Example: bar chart
        data: {
          labels: data.labels, // E.g., months or dates
          datasets: [{
            label: 'Sales (₹)',
            data: data.values, // Corresponding sales values
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Sales (₹)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time Period'
              }
            }
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div>
      <canvas ref={chartRef} width={400} height={200}></canvas>
    </div>
  );
};

export default SalesChart;