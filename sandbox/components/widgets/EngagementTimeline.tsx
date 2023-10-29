import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartData } from 'chart.js';

type EngagementTimelineProps = {
  data: ChartData<'line', number[], string[]>;
};

function EngagementTimeline({ data }: EngagementTimelineProps) {
  // Modify datasets for gradient color and fill
  const modifiedData = {
    ...data,
    datasets: data.datasets.map((dataset) => {
      const ctx = document.createElement('canvas').getContext('2d');
      
      const gradientStroke = ctx!.createLinearGradient(0, 0, 0, 400);
      gradientStroke.addColorStop(0, '#000000');   // Adjust this to the desired color
      gradientStroke.addColorStop(1, '#ffffff');   // Adjust this to the desired color

      const gradientFill = ctx!.createLinearGradient(0, 0, 0, 400);
      gradientFill.addColorStop(0, 'rgba(95,232,225,0.5)');  // Adjust this color
      gradientFill.addColorStop(1, 'rgba(59,252,109,0.5)');  // Adjust this color

      const pointGradient = ctx!.createLinearGradient(0, 0, 400, 0);
      pointGradient.addColorStop(0, 'rgba(51,87,255, 0.5)');
      pointGradient.addColorStop(1, 'rgba(192, 128, 232, 0.5)');

      return {
        ...dataset,
        borderColor: '#ffffff',
        pointBorderColor: '#ffffff',
        pointBackgroundColor: pointGradient,
        pointHoverBackgroundColor: gradientStroke,
        pointHoverBorderColor: gradientStroke,
        pointBorderWidth: 1,
        fill: true,
        backgroundColor: gradientFill,
        tension: 0.4
      };
    })
  };

  const options = {
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          display: false,
          color: 'rgba(0, 0, 0, 0.5)',
          padding: 10
        }
      },
      y: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: 'rgba(0, 0, 0, 0.5)',
          padding: 10
        }
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

export default EngagementTimeline;
