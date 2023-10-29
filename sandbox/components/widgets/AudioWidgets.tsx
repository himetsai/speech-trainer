import { None, Optional } from "../../lib/utilities/typeUtilities";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Chart,
  LinearScale,
  PointElement,
  LineController,
  LineElement,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { AudioPrediction } from "../../lib/data/audioPrediction";
import { AudioRecorder } from "../../lib/media/audioRecorder";
import { AuthContext } from "../menu/Auth";
import { DiscreteTimeline } from "./DiscreteTimeline";
import { TopEmotions } from "./TopEmotions";
import { blobToBase64 } from "../../lib/utilities/blobUtilities";
import { getApiUrlWs } from "../../lib/utilities/environmentUtilities";
import { Emotion } from "../../lib/data/emotion";
import { ChartData, ChartTypeRegistry } from "chart.js";

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

import EmotionTimeline from "./EmotionTimeline"; // Adjust path accordingly
import EngagementTimeline from "./EngagementTimeline";
import EmotionRadar from "./EmotionRadar";

interface AudioWidgetsProps {
  modelName: string;
  recordingLengthMs: number;
  streamWindowLengthMs: number;
  onTimeline: Optional<(predictions: AudioPrediction[]) => void>;
}

export function AudioWidgets({
  modelName,
  recordingLengthMs,
  streamWindowLengthMs,
  onTimeline,
}: AudioWidgetsProps) {
  const authContext = useContext(AuthContext);
  const socketRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioBufferRef = useRef<Blob[]>([]);
  const mountRef = useRef(true);
  const numReconnects = useRef(0);
  const serverReadyRef = useRef(true);
  const [predictions, setPredictions] = useState<AudioPrediction[]>([]);
  const [status, setStatus] = useState("");
  const maxReconnects = 10;

  const emotions = predictions.length == 0 ? [] : predictions[0].emotions;

  // const [emotionsHistory, setEmotionsHistory] = useState<{time: string, name: string, score: number}[]>([]);

  const [emotionsHistoryGroup1, setEmotionsHistoryGroup1] = useState<
    { time: string; name: string; score: number }[]
  >([]);
  const [emotionsHistoryGroup2, setEmotionsHistoryGroup2] = useState<
    { time: string; name: string; score: number }[]
  >([]);
  const [emotionsHistoryGroup3, setEmotionsHistoryGroup3] = useState<
    { time: string; name: string; score: number }[]
  >([]);
  const [emotionsHistoryGroup4, setEmotionsHistoryGroup4] = useState<
    { time: string; name: string; score: number }[]
  >([]);

  const radarData = transformToRadarData(
    emotionsHistoryGroup1,
    emotionsHistoryGroup2,
    emotionsHistoryGroup3,
    emotionsHistoryGroup4
  );

  const [engagementHistory, setEngagementHistory] = useState<
    { time: string; score: number }[]
  >([]);

  const chartData = transformEmotionsToChartData(
    emotionsHistoryGroup1,
    emotionsHistoryGroup2,
    emotionsHistoryGroup3,
    emotionsHistoryGroup4
  );
  console.log(chartData);

  const engagementChartData = transformEngagementToChartData(engagementHistory);
  console.log(engagementChartData);

  type ChartDataShape = ChartData<"line", number[], string[]>; // Note the added extra array in string[][]

  useEffect(() => {
    const now = new Date().toISOString();

    // Handle the first group of relevant emotions
    const anxietyEmotion = emotions.find(
      (emotion) => emotion.name === "Anxiety"
    );
    const doubtEmotion = emotions.find((emotion) => emotion.name === "Doubt");
    const distressEmotion = emotions.find(
      (emotion) => emotion.name === "Distress"
    );
    const awkwardnessEmotion = emotions.find(
      (emotion) => emotion.name === "Awkwardness"
    );
    const confusionEmotion = emotions.find(
      (emotion) => emotion.name === "Confusion"
    );
    let summedScoreGroup1 = 0;
    if (anxietyEmotion?.score) summedScoreGroup1 += anxietyEmotion.score; // Safely access with optional chaining
    if (doubtEmotion?.score) summedScoreGroup1 += doubtEmotion.score; // Safely access with optional chaining
    if (distressEmotion?.score) summedScoreGroup1 += distressEmotion.score; // Safely access with optional chaining
    if (awkwardnessEmotion?.score)
      summedScoreGroup1 += awkwardnessEmotion.score;
    if (confusionEmotion?.score) summedScoreGroup1 += confusionEmotion.score;

    if (summedScoreGroup1 > 0) {
      // Only update history if the summed score is non-zero
      summedScoreGroup1 = summedScoreGroup1 * summedScoreGroup1 * 2;
      const newHistoryGroup1 = {
        time: now,
        name: "Summed Emotion Score Group 1",
        score: summedScoreGroup1,
      };

      setEmotionsHistoryGroup1((prev) => [...prev, newHistoryGroup1]);

      const newLastScoreGroup1 = summedScoreGroup1;
      const lastScoreGroup2 =
        emotionsHistoryGroup2.length > 0
          ? emotionsHistoryGroup2[emotionsHistoryGroup2.length - 1].score
          : 0;
      const lastScoreGroup3 =
        emotionsHistoryGroup3.length > 0
          ? emotionsHistoryGroup3[emotionsHistoryGroup3.length - 1].score
          : 0;
      const lastScoreGroup4 =
        emotionsHistoryGroup4.length > 0
          ? emotionsHistoryGroup4[emotionsHistoryGroup4.length - 1].score
          : 0;

      const engagementScore =
        lastScoreGroup2 +
        lastScoreGroup3 -
        (newLastScoreGroup1 + lastScoreGroup4);

      // const engagementScore = 1;

      // if (engagementScore !== 0) {  // Only update history if the engagement score is non-zero
      setEngagementHistory((prev) => [
        ...prev,
        { time: now, score: engagementScore },
      ]);
      // }
    }

    // Handle the second group of relevant emotions
    const excitementEmotion = emotions.find(
      (emotion) => emotion.name === "Excitement"
    );
    const interestEmotion = emotions.find(
      (emotion) => emotion.name === "Interest"
    );
    const prideEmotion = emotions.find((emotion) => emotion.name === "Pride");
    const admirationEmotion = emotions.find(
      (emotion) => emotion.name === "Admiration"
    );
    const realizationEmotion = emotions.find(
      (emotion) => emotion.name === "Realization"
    );
    const surprisePositiveEmotion = emotions.find(
      (emotion) => emotion.name === "Surprise (positive)"
    );

    let summedScoreGroup2 = 0;
    if (excitementEmotion?.score) summedScoreGroup2 += excitementEmotion.score; // Safely access with optional chaining
    if (interestEmotion?.score) summedScoreGroup2 += interestEmotion.score;
    if (prideEmotion?.score) summedScoreGroup2 += prideEmotion.score; // Safely access with optional chaining
    if (admirationEmotion?.score) summedScoreGroup2 += admirationEmotion.score; // Safely access with optional chaining
    if (realizationEmotion?.score)
      summedScoreGroup2 += realizationEmotion.score; // Safely access with optional chaining
    if (surprisePositiveEmotion?.score)
      summedScoreGroup2 += surprisePositiveEmotion.score; // Safely access with optional chaining

    if (summedScoreGroup2 > 0) {
      // Only update history if the summed score is non-zero
      summedScoreGroup2 = summedScoreGroup2 * summedScoreGroup2;

      const newHistoryGroup2 = {
        time: now,
        name: "Summed Emotion Score Group 2",
        score: summedScoreGroup2,
      };
      setEmotionsHistoryGroup2((prev) => [...prev, newHistoryGroup2]);
    }

    // Handle the third group of relevant emotions (Vocal Poise)
    const calmnessEmotion = emotions.find(
      (emotion) => emotion.name === "Calmness"
    );
    const satisfactionEmotion = emotions.find(
      (emotion) => emotion.name === "Satisfaction"
    );
    const contemplationEmotion = emotions.find(
      (emotion) => emotion.name === "Contemplation"
    );
    const concentrationEmotion = emotions.find(
      (emotion) => emotion.name === "Concentration"
    );
    const amusementEmotion = emotions.find(
      (emotion) => emotion.name === "Amusement"
    );
    const determinationEmotion = emotions.find(
      (emotion) => emotion.name === "Determination"
    );

    let summedScoreGroup3 = 0;
    if (calmnessEmotion?.score) summedScoreGroup3 += calmnessEmotion.score;
    if (satisfactionEmotion?.score)
      summedScoreGroup3 += satisfactionEmotion.score;
    if (contemplationEmotion?.score)
      summedScoreGroup3 += contemplationEmotion.score;
    if (concentrationEmotion?.score)
      summedScoreGroup3 += concentrationEmotion.score;
    if (amusementEmotion?.score) summedScoreGroup3 += amusementEmotion.score;
    if (determinationEmotion?.score)
      summedScoreGroup3 += determinationEmotion.score;

    if (summedScoreGroup3 > 0) {
      summedScoreGroup3 = summedScoreGroup3 * summedScoreGroup3;

      const newHistoryGroup3 = {
        time: now,
        name: "Summed Emotion Score Group 3",
        score: summedScoreGroup3,
      };
      setEmotionsHistoryGroup3((prev) => [...prev, newHistoryGroup3]);
    }

    // Handle the fourth group of relevant emotions (Vocal Apathy)
    const boredomEmotion = emotions.find(
      (emotion) => emotion.name === "Boredom"
    );
    const tirednessEmotion = emotions.find(
      (emotion) => emotion.name === "Tiredness"
    );
    const disappointmentEmotion = emotions.find(
      (emotion) => emotion.name === "Disappointment"
    );

    let summedScoreGroup4 = 0;
    if (boredomEmotion?.score) summedScoreGroup4 += boredomEmotion.score;
    if (tirednessEmotion?.score) summedScoreGroup4 += tirednessEmotion.score;
    if (disappointmentEmotion?.score)
      summedScoreGroup4 += disappointmentEmotion.score;
    if (confusionEmotion?.score) summedScoreGroup4 += confusionEmotion.score;
    if (contemplationEmotion?.score)
      summedScoreGroup4 += contemplationEmotion.score;

    if (summedScoreGroup4 > 0) {
      summedScoreGroup4 = summedScoreGroup4 * summedScoreGroup4 * 2;

      const newHistoryGroup4 = {
        time: now,
        name: "Summed Emotion Score Group 4",
        score: summedScoreGroup4,
      };
      setEmotionsHistoryGroup4((prev) => [...prev, newHistoryGroup4]);
    }
  }, [emotions]);

  function transformToRadarData(
    group1: Array<{ time: string; score: number }>,
    group2: Array<{ time: string; score: number }>,
    group3: Array<{ time: string; score: number }>,
    group4: Array<{ time: string; score: number }>
  ): ChartData<"radar", number[], string> {
    const labels = ["Discomfort", "Vigor", "Poise", "Apathy"];

    const dataPoints = [
      Math.sqrt(group1.reduce((acc, curr) => acc + curr.score, 0)),
      Math.sqrt(group2.reduce((acc, curr) => acc + curr.score, 0)),
      Math.sqrt(group3.reduce((acc, curr) => acc + curr.score, 0)),
      Math.sqrt(group4.reduce((acc, curr) => acc + curr.score, 0)),
    ];

    return {
      labels,
      datasets: [
        {
          label: "Emotion Scores",
          data: dataPoints,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  }

  function transformEngagementToChartData(
    engagementHistory: { time: string; score: number }[]
  ): ChartDataShape {
    const labels = engagementHistory.map((e) => [e.time]);
    const data = engagementHistory.map((e) =>
      e.score >= 0 ? Math.sqrt(e.score) : e.score
    );

    return {
      labels: labels,
      datasets: [
        {
          label: "Engagement",
          data: data,
          borderColor: "rgb(128, 128, 128)",
          backgroundColor: "rgba(128, 128, 128, 0.5)",
        },
      ],
    };
  }

  function transformEmotionsToChartData(
    emotionsHistory1: { time: string; name: string; score: number }[],
    emotionsHistory2: { time: string; name: string; score: number }[],
    emotionsHistory3: { time: string; name: string; score: number }[],
    emotionsHistory4: { time: string; name: string; score: number }[]
  ): ChartDataShape {
    const labelsGroup1 = emotionsHistory1.map((e) => [e.time]);
    const dataGroup1 = emotionsHistory1.map((e) => e.score);

    const labelsGroup2 = emotionsHistory2.map((e) => [e.time]);
    const dataGroup2 = emotionsHistory2.map((e) => e.score);

    const labelsGroup3 = emotionsHistory3.map((e) => [e.time]);
    const dataGroup3 = emotionsHistory3.map((e) => e.score);

    const labelsGroup4 = emotionsHistory4.map((e) => [e.time]);
    const dataGroup4 = emotionsHistory4.map((e) => e.score);
    return {
      labels: labelsGroup1,
      datasets: [
        {
          label: "Discomfort",
          data: dataGroup1,
          borderColor: "rgba(111, 218, 232, 0.5)", // Changed to a unique color
          backgroundColor: "rgba(111, 218, 232, 0.5)", // Adjusted to a 0.5 opacity version
          pointBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: "#000000",
          pointHoverBackgroundColor: "#000000",
        },
        {
          label: "Vigor",
          data: dataGroup2,
          borderColor: "rgba(59, 252, 109, 0.5)", // Changed to a unique color
          backgroundColor: "rgba(51,255,87, 0.5)", // Adjusted to a 0.5 opacity version
          pointBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: "#000000",
          pointHoverBackgroundColor: "#000000",
        },
        {
          label: "Poise",
          data: dataGroup3,
          borderColor: "rgba(192, 128, 232, 0.5)", // Changed to a unique color
          backgroundColor: "rgba(192, 128, 232, 0.5)", // Adjusted to a 0.5 opacity version
          pointBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: "#000000",
          pointHoverBackgroundColor: "#000000",
        },
        {
          label: "Apathy",
          data: dataGroup4,
          borderColor: "rgba(51,87,255, 0.5)", // Changed to a unique color
          backgroundColor: "rgba(51,87,255, 0.5)", // Adjusted to a 0.5 opacity version
          pointBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
          pointHoverBorderColor: "#000000",
          pointHoverBackgroundColor: "#000000",
        },
      ],
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
    const newPredictions: AudioPrediction[] =
      response[modelName]?.predictions || [];
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
    console.log(
      `Will send ${audioBufferRef.current.length} recorded blobs to server`
    );

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

  const chartContainerStyle: React.CSSProperties = {
    width: "100%",
    display: "inline-block",
    boxSizing: "border-box",
    padding: "0 15px",
  };

  return (
    <div className="flex h-full w-[500px] justify-center items-center">
      <div className="flex h-full w-full items-center">
        {/* {!onTimeline && <TopEmotions emotions={emotions} />} */}
        {onTimeline && (
          <div className="ml-10 w-full h-full">
            <DiscreteTimeline predictions={predictions} />
          </div>
        )}
        {/* <div style={chartContainerStyle}>
          <EmotionRadar data={radarData} />
        </div> */}
        <div className="flex h-full w-full">
          <EngagementTimeline data={engagementChartData} />
        </div>
        {/* <div style={chartContainerStyle}>
          <EmotionTimeline data={chartData} />
        </div> */}
      </div>
    </div>
  );
}

AudioWidgets.defaultProps = {
  onTimeline: None,
};
