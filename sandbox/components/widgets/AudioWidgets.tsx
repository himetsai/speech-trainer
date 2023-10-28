import { None, Optional } from "../../lib/utilities/typeUtilities";
import { useContext, useEffect, useRef, useState } from "react";
import { Chart, LinearScale, PointElement, LineController, LineElement, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import { AudioPrediction } from "../../lib/data/audioPrediction";
import { AudioRecorder } from "../../lib/media/audioRecorder";
import { AuthContext } from "../menu/Auth";
import { DiscreteTimeline } from "./DiscreteTimeline";
import { TopEmotions } from "./TopEmotions";
import { blobToBase64 } from "../../lib/utilities/blobUtilities";
import { getApiUrlWs } from "../../lib/utilities/environmentUtilities";
import { Emotion } from "../../lib/data/emotion";
import { ChartData, ChartTypeRegistry } from 'chart.js';

// Register the components
Chart.register(
  LinearScale, 
  PointElement, 
  LineController, 
  LineElement, 
  CategoryScale, 
  Title, 
  Tooltip, 
  Legend
);


import EmotionTimeline from "./EmotionTimeline";  // Adjust path accordingly


interface AudioWidgetsProps {
  modelName: string;
  recordingLengthMs: number;
  streamWindowLengthMs: number;
  onTimeline: Optional<(predictions: AudioPrediction[]) => void>;
}

export function AudioWidgets({ modelName, recordingLengthMs, streamWindowLengthMs, onTimeline }: AudioWidgetsProps) {
  const authContext = useContext(AuthContext);
  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioBufferRef = useRef<Blob[]>([]);
  const mountRef = useRef(true);
  const numReconnects = useRef(0);
  const serverReadyRef = useRef(true);
  const [predictions, setPredictions] = useState<AudioPrediction[]>([]);
  const [status, setStatus] = useState("");
  const maxReconnects = 3;

  const emotions = predictions.length == 0 ? [] : predictions[0].emotions;
  

  const [emotionsHistory, setEmotionsHistory] = useState<{time: string, name: string, score: number}[]>([]);

  const [emotionsHistoryGroup1, setEmotionsHistoryGroup1] = useState<{time: string, name: string, score: number}[]>([]);
  const [emotionsHistoryGroup2, setEmotionsHistoryGroup2] = useState<{time: string, name: string, score: number}[]>([]);
  const [emotionsHistoryGroup3, setEmotionsHistoryGroup3] = useState<{time: string, name: string, score: number}[]>([]);
  const [emotionsHistoryGroup4, setEmotionsHistoryGroup4] = useState<{time: string, name: string, score: number}[]>([]);


  const chartData = transformEmotionsToChartData(emotionsHistoryGroup1, emotionsHistoryGroup2, emotionsHistoryGroup3, emotionsHistoryGroup4);
  console.log(chartData);

  type ChartDataShape = ChartData<'line', number[], string[]>;  // Note the added extra array in string[][]

  useEffect(() => {
    const now = new Date().toISOString();

    // Handle the first group of relevant emotions
    const anxietyEmotion = emotions.find(emotion => emotion.name === "Anxiety");
    const doubtEmotion = emotions.find(emotion => emotion.name === "Doubt");
    const distressEmotion = emotions.find(emotion => emotion.name === "Distress");
    const awkwardnessEmotion = emotions.find(emotion => emotion.name === "Awkwardness");

    
    let summedScoreGroup1 = 0;
    if (anxietyEmotion?.score) summedScoreGroup1 += anxietyEmotion.score;    // Safely access with optional chaining
    if (doubtEmotion?.score) summedScoreGroup1 += doubtEmotion.score;        // Safely access with optional chaining
    if (distressEmotion?.score) summedScoreGroup1 += distressEmotion.score;  // Safely access with optional chaining
    if (awkwardnessEmotion?.score) summedScoreGroup1 += awkwardnessEmotion.score;

    if (summedScoreGroup1 > 0) {  // Only update history if the summed score is non-zero
        const newHistoryGroup1 = {
            time: now,
            name: "Summed Emotion Score Group 1",
            score: summedScoreGroup1
        };
        setEmotionsHistoryGroup1(prev => [...prev, newHistoryGroup1]);
    }

    // Handle the second group of relevant emotions
    const determinationEmotion = emotions.find(emotion => emotion.name === "Determination");
    const excitementEmotion = emotions.find(emotion => emotion.name === "Excitement");
    const interestEmotion = emotions.find(emotion => emotion.name === "Interest");
    
    let summedScoreGroup2 = 0;
    if (determinationEmotion?.score) summedScoreGroup2 += determinationEmotion.score;   // Safely access with optional chaining
    if (excitementEmotion?.score) summedScoreGroup2 += excitementEmotion.score;         // Safely access with optional chaining
    if (interestEmotion?.score) summedScoreGroup2 += interestEmotion.score;             // Safely access with optional chaining

    if (summedScoreGroup2 > 0) {  // Only update history if the summed score is non-zero
        const newHistoryGroup2 = {
            time: now,
            name: "Summed Emotion Score Group 2",
            score: summedScoreGroup2
        };
        setEmotionsHistoryGroup2(prev => [...prev, newHistoryGroup2]);
    }

    // Handle the third group of relevant emotions (Vocal Poise)
const calmnessEmotion = emotions.find(emotion => emotion.name === "Calmness");
const confidenceEmotion = emotions.find(emotion => emotion.name === "Pride");

let summedScoreGroup3 = 0;
if (calmnessEmotion?.score) summedScoreGroup3 += calmnessEmotion.score;
if (confidenceEmotion?.score) summedScoreGroup3 += confidenceEmotion.score;

if (summedScoreGroup3 > 0) {
    const newHistoryGroup3 = {
        time: now,
        name: "Summed Emotion Score Group 3",
        score: summedScoreGroup3
    };
    setEmotionsHistoryGroup3(prev => [...prev, newHistoryGroup3]);
}

// Handle the fourth group of relevant emotions (Vocal Apathy)
const boredomEmotion = emotions.find(emotion => emotion.name === "Boredom");
const tirednessEmotion = emotions.find(emotion => emotion.name === "Tiredness");
const disappointmentEmotion = emotions.find(emotion => emotion.name === "Disappointment");
// const awkwardnessEmotion = emotions.find(emotion => emotion.name === "Awkwardness");

let summedScoreGroup4 = 0;
if (boredomEmotion?.score) summedScoreGroup4 += boredomEmotion.score;
if (tirednessEmotion?.score) summedScoreGroup4 += tirednessEmotion.score;
if (disappointmentEmotion?.score) summedScoreGroup4 += disappointmentEmotion.score;
// if (awkwardnessEmotion?.score) summedScoreGroup4 += awkwardnessEmotion.score;

if (summedScoreGroup4 > 0) {
    const newHistoryGroup4 = {
        time: now,
        name: "Summed Emotion Score Group 4",
        score: summedScoreGroup4
    };
    setEmotionsHistoryGroup4(prev => [...prev, newHistoryGroup4]);
}

}, [emotions]);


function transformEmotionsToChartData(
  emotionsHistory1: { time: string; name: string; score: number; }[],
  emotionsHistory2: { time: string; name: string; score: number; }[],
  emotionsHistory3: { time: string; name: string; score: number; }[],
  emotionsHistory4: { time: string; name: string; score: number; }[]
): ChartDataShape {
    const labelsGroup1 = emotionsHistory1.map(e => [e.time]);
    const dataGroup1 = emotionsHistory1.map(e => e.score);

    const labelsGroup2 = emotionsHistory2.map(e => [e.time]);
    const dataGroup2 = emotionsHistory2.map(e => e.score);

    const labelsGroup3 = emotionsHistory3.map(e => [e.time]);
    const dataGroup3 = emotionsHistory3.map(e => e.score);

    const labelsGroup4 = emotionsHistory4.map(e => [e.time]);
    const dataGroup4 = emotionsHistory4.map(e => e.score);

    return {
      labels: labelsGroup1,
      datasets: [
        {
          label: 'Discomfort',
          data: dataGroup1,
          borderColor: 'rgb(255, 0, 0)',
          backgroundColor: 'rgba(255, 0, 0, 0.5)',
        },
        {
          label: 'Vigor',
          data: dataGroup2,
          borderColor: 'rgb(255,255,204)',
          backgroundColor: 'rgba(255,255,204, 0.5)',
        },
        {
          label: 'Poise',
          data: dataGroup3,
          borderColor: 'rgb(0,128,0)',
          backgroundColor: 'rgba(0,128,0, 0.5)',
        },
        {
          label: 'Apathy',
          data: dataGroup4,
          borderColor: 'rgb(0,0,255)',
          backgroundColor: 'rgba(0,0,255, 0.5)',
        }
      ]
    };
    
}


  useEffect(() => {
    mountRef.current = true;
    connect();

    return () => {
      console.log("Tearing down component");
      stopEverything();
    };
  }, []);

  async function connect() {
    const baseUrl = getApiUrlWs(authContext.environment);
    const socketUrl = `${baseUrl}/v0/stream/models?apikey=${authContext.key}`;

    serverReadyRef.current = true;

    console.log(`Connecting to websocket... (using ${socketUrl})`);
    setStatus(`Connecting to server...`);
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = socketOnOpen;
    socketRef.current.onmessage = socketOnMessage;
    socketRef.current.onclose = socketOnClose;
    socketRef.current.onerror = socketOnError;
  }

  async function socketOnOpen() {
    console.log("Connected to websocket");
    setStatus("");

    recorderRef.current = await AudioRecorder.create();

    while (mountRef.current) {
      const blob = await recorderRef.current.record(recordingLengthMs);
      audioBufferRef.current.push(blob);
      if (serverReadyRef.current) {
        sendRequest();
      }
    }
  }

  async function socketOnMessage(event: MessageEvent) {
    setStatus("");
    const response = JSON.parse(event.data);
    console.log("Got response", response);
    const newPredictions: AudioPrediction[] = response[modelName]?.predictions || [];
    const warning = response[modelName]?.warning || "";
    const error = response.error;
    if (error) {
      setStatus(error);
      console.error(error);
      stopEverything();
      return;
    }

    setPredictions(newPredictions);
    if (onTimeline) {
      onTimeline(newPredictions);
    }
    if (newPredictions.length == 0) {
      if (modelName == "burst") {
        setStatus("No vocal bursts detected");
      } else {
        setStatus("No speech detected");
      }
    }

    if (audioBufferRef.current.length > 0) {
      sendRequest();
    } else {
      serverReadyRef.current = true;
    }
  }

  async function socketOnClose(event: CloseEvent) {
    console.log("Socket closed");

    if (mountRef.current === true) {
      setStatus("Reconnecting");
      console.log("Component still mounted, will reconnect...");
      connect();
    } else {
      console.log("Component unmounted, will not reconnect...");
    }
  }

  async function socketOnError(event: Event) {
    console.error("Socket failed to connect: ", event);
    if (numReconnects.current > maxReconnects) {
      setStatus(`Failed to connect to the Hume API (${authContext.environment}).
      Please log out and verify that your API key is correct.`);
      stopEverything();
    } else {
      numReconnects.current++;
      console.warn(`Connection attempt ${numReconnects.current}`);
    }
  }

  function stopEverything() {
    console.log("Stopping everything...");
    mountRef.current = false;
    const socket = socketRef.current;
    if (socket) {
      console.log("Closing socket");
      socket.close();
      socketRef.current = null;
    } else {
      console.warn("Could not close socket, not initialized yet");
    }
    const recorder = recorderRef.current;
    if (recorder) {
      console.log("Stopping recorder");
      recorder.stopRecording();
      recorderRef.current = null;
    } else {
      console.warn("Could not stop recorder, not initialized yet");
    }
  }

  async function sendRequest() {
    console.log(`Will send ${audioBufferRef.current.length} recorded blobs to server`);

    const socket = socketRef.current;

    if (!socket) {
      console.log("No socket on state");
      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      const combinedBlob = new Blob(audioBufferRef.current);
      serverReadyRef.current = false;
      audioBufferRef.current = [];

      const encodedBlob = await blobToBase64(combinedBlob);
      const response = JSON.stringify({
        data: encodedBlob,
        models: {
          [modelName]: {},
        },
        stream_window_ms: streamWindowLengthMs,
      });

      socket.send(response);
    } else {
      console.log("Socket not open");
      socket.close();
    }
  }

  return (
    <div>
      <div className="md:flex">
        {!onTimeline && <TopEmotions emotions={emotions} />}
        {onTimeline && (
          <div className="ml-10">
            <DiscreteTimeline predictions={predictions} />
          </div>
        )}
        <EmotionTimeline data={chartData} />
      </div>

      <div>{status}</div>
    </div>
  );
}

AudioWidgets.defaultProps = {
  onTimeline: None,
};
