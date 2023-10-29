import { Line } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import styles from './EngagementTimeline.module.css';

type EmotionTimelineProps = {
  data: ChartData<'line', number[], string[]>;
};

function EmotionTimeline({ data }: EmotionTimelineProps) {
  // Modify datasets for smooth lines
  const modifiedData = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      showLine: true, // Don't show a connecting line between points
      tension: 0.4  // Making the lines smooth
      
    }))
  };

  const options = {
    scales: {
      x: {
        grid: {
          display: false, // Remove the grid in the background
          drawBorder: false
        },
        ticks: {
          display: false, // Get rid of the x-axis labels
        }
      },
      y: {
        grid: {
          display: false, // Remove the grid in the background
          drawBorder: false
        },
        // ticks: {
        //   display: false, // Get rid of the x-axis labels
        // }
      }
    },
    plugins: {
      legend: {
        display: true
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }
    },
    interaction: {
      intersect: false,
      mode: "index" as "index"
    }
  };

  return <Line data={modifiedData} options={options} />;
}

export default EmotionTimeline;
