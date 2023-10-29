import { Radar } from 'react-chartjs-2';
import { ChartData, Chart } from 'chart.js';
import styles from './EngagementRadar.module.css';
import React, { useRef, useEffect, useState } from 'react';


import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(RadialLinearScale);
ChartJS.register(Filler);

type EmotionRadarProps = {
  data: ChartData<'radar', number[], string>;
};
function EmotionRadar({ data }: EmotionRadarProps) {
  const radarRef = useRef<Chart<'radar', number[], string> | null>(null);

  const [gradientFill, setGradientFill] = useState<any>();

  useEffect(() => {
    if (radarRef.current) {
        const chartInstance = radarRef.current;
        const ctx = chartInstance.ctx;  // Get the ctx from the Chart.js instance

        if (ctx instanceof CanvasRenderingContext2D) {  // Make sure it's the 2D context
            const width = ctx.canvas.width;
            const height = ctx.canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
            gradient.addColorStop(0, 'rgba(95,232,225,0.5)');  // Green
            gradient.addColorStop(1, 'rgba(59,252,109,0.5)');  // White

            setGradientFill(gradient);
        }
    }
}, []);

  

  const modifiedData = {
    ...data,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      borderColor: '#ffffff',  // Dark green
      borderWidth: 5, 
      pointBorderColor: '#ffffff',
      pointBackgroundColor: 'rgba(192, 128, 232, 0.5)',
      pointBorderWidth: 1,
      fill: true,
      backgroundColor: gradientFill,
      tension: 0.4,
      pointHoverBorderWidth: 2,
      pointHoverBorderColor: '#000000',
      pointHoverBackgroundColor: '#000000',
    }))
  };

  const options = {
    scales: {
      r: {
        grid: {
          display: false,
          drawBorder: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          display: false,
          color: 'rgba(0, 0, 0, 0.5)'
        },
        pointLabels: {
          display: true,
          color: 'rgba(0, 0, 0, 0.7)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
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

  return <Radar ref={radarRef} data={modifiedData} options={options} />;
}

export default EmotionRadar;
