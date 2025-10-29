import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './TrendChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function TrendChart({ data }) {
  if (!data || data.length === 0) return null;

  // Prepare data for Chart.js
  const labels = data[0].quarters.map(q => q.quarter);

  // Generate distinct colors for each word
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316'  // orange
  ];

  const datasets = data.map((wordData, idx) => ({
    label: wordData.word,
    data: wordData.quarters.map(q => q.count),
    borderColor: colors[idx % colors.length],
    backgroundColor: colors[idx % colors.length] + '20', // Add transparency
    tension: 0.3,
    borderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6
  }));

  const chartData = {
    labels,
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Word Frequency Trends Over Time',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} mentions`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        },
        title: {
          display: true,
          text: 'Mention Count'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Quarter'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="trend-chart-container">
      <h3>📈 Trend Visualization</h3>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default TrendChart;
