import { useEffect, useRef, useState, FC } from "react";
import { FaceWidgets } from "../components/widgets/FaceWidgets";
import { Emotion } from "../lib/data/emotion";
import { ProsodyWidgets } from "../components/widgets/ProsodyWidgets";
import { fetchFeedback, fetchSTT } from "../api.js";

const VideoRecorder: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recording, setRecording] = useState<boolean>(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [EmotionSnapshots, setEmotionSnapshots] = useState<Emotion[][]>([]);

  useEffect(() => {
    let chunks: Blob[] = [];
    async function setupMediaRecorder() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream; // Set the srcObject property here
      }

      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        setBlob(e.data);
      };

      setMediaRecorder(recorder);
    }
    setupMediaRecorder();
  }, []);

  useEffect(() => {
    let chunks: Blob[] = [];
    async function setupAudioRecorder() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const audioStream = new MediaStream(stream.getAudioTracks());
      const audRecorder = new MediaRecorder(audioStream);

      audRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      setAudioRecorder(audRecorder);

      audRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, {
          type: "audio/wav",
        });

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();

        const transcript = await fetchSTT("http://127.0.0.1:5000/api/speech-to-text", audioBlob);
        const feedback = await fetchFeedback("http://127.0.0.1:5000/api/feedback", transcript)
        chunks = [];
      };
    }
    setupAudioRecorder();
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
    if (audioRecorder) {
      audioRecorder.start();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setEmotionSnapshots([]);
    }
    if (audioRecorder) {
      audioRecorder.stop();
    }
  };

  return (
    <div>
      <FaceWidgets
        recording={recording}
        setEmotionSnapshots={setEmotionSnapshots}
      />
      {/* <ProsodyWidgets recording={recording} /> */}
      {recording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}
      {blob && !recording && (
        <video src={URL.createObjectURL(blob)} controls></video>
      )}
    </div>
  );
};

export default VideoRecorder;
