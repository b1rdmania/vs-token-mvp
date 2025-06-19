import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PenaltyCurveChartProps {
  nftId: string;
  totalValue: number;
  vestingPeriod: number;
  startTime: number;
  currentTime: number;
}

export function PenaltyCurveChart({ nftId, totalValue, vestingPeriod, startTime, currentTime }: PenaltyCurveChartProps) {
  // Generate data points for the curve
  const generateCurveData = () => {
    const points = 50; // Number of points to plot
    const labels: string[] = [];
    const penaltyData: number[] = [];
    const claimableData: number[] = [];
    const currentPoint = Math.floor(((currentTime - startTime) / vestingPeriod) * 100);

    for (let i = 0; i <= points; i++) {
      const timeProgress = i / points;
      const monthsLabel = Math.floor(timeProgress * 9); // 9 months vesting period
      labels.push(`${monthsLabel}m`);
      
      // Linear decay for penalty (100% to 0%)
      const penalty = Math.max(0, 100 * (1 - timeProgress));
      penaltyData.push(penalty);
      
      // Linear increase for claimable value (0% to 100%)
      const claimable = Math.min(100, 100 * timeProgress);
      claimableData.push(claimable);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Penalty (%)',
          data: penaltyData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.4,
        },
        {
          label: 'Claimable (%)',
          data: claimableData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4,
        },
      ],
    };
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `NFT #${nftId} Vesting Progress`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            if (context.dataset.label === 'Claimable (%)') {
              return `Claimable: ${value.toFixed(2)}% (${((value / 100) * totalValue).toFixed(2)} S)`;
            }
            return `Penalty: ${value.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time (months)'
        }
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
      <Line options={options} data={generateCurveData()} />
    </div>
  );
} 