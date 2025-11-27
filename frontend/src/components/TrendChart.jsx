import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './TrendChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function TrendChart({ data, focusedWords, showHighConsistency }) {
  if (!data || data.length === 0) return null;

  // Check if we only have single quarter data - show simplified view
  const isSingleQuarter = data[0]?.quarters?.length === 1;

  // Filter data if words are focused (multi-select)
  let displayData = focusedWords && focusedWords.length > 0
    ? data.filter(wordData => focusedWords.includes(wordData.word))
    : data;

  // Filter for high consistency (75%+) if enabled
  if (showHighConsistency) {
    displayData = displayData.filter(wordData => parseFloat(wordData.consistencyPercent) >= 75);
  }

  // For single quarter, show a horizontal bar chart of mentions per word
  if (isSingleQuarter) {
    const quarterLabel = data[0].quarters[0].quarter;
    const labels = displayData.map(d => d.word);
    const counts = displayData.map(d => d.total);

    const chartData = {
      labels,
      datasets: [{
        label: `Mentions in ${quarterLabel}`,
        data: counts,
        backgroundColor: counts.map((_, idx) => {
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
          return colors[idx % colors.length];
        }),
        borderRadius: 4,
        maxBarThickness: 40
      }]
    };

    const options = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Keyword Mentions - ${quarterLabel}`,
          font: { size: 16, weight: 'bold' },
          padding: { bottom: 20 }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.x} mentions`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0 },
          title: { display: true, text: 'Mention Count' }
        },
        y: {
          title: { display: true, text: 'Keyword' }
        }
      }
    };

    return (
      <div className="trend-chart-container">
        <h3>📊 Mention Summary</h3>
        <div className="chart-wrapper" style={{ height: Math.max(200, displayData.length * 50) }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    );
  }

  // Multi-quarter view (original)
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

  const datasets = displayData.map((wordData, idx) => ({
    label: wordData.word,
    data: wordData.quarters.map(q => q.count),
    backgroundColor: colors[idx % colors.length],
    borderColor: colors[idx % colors.length],
    borderWidth: 1,
    borderRadius: 4,
    maxBarThickness: 60
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
        text: 'Quarterly Mention Comparison',
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
      <h3>📊 Quarterly Comparison</h3>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default TrendChart;
