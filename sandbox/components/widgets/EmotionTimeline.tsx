import { Line } from 'react-chartjs-2';
import { ChartData, ChartTypeRegistry, LineController } from 'chart.js';

type EmotionTimelineProps = {
  data: ChartData<'line', number[], string[]>;
};

function EmotionTimeline({ data }: EmotionTimelineProps) {
  return <Line data={data} />;
}

export default EmotionTimeline;
