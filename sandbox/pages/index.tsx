import { useEffect, useRef, useState, FC } from "react";
import { FaceWidgets } from "../components/widgets/FaceWidgets";
import { Emotion, EmotionName } from "../lib/data/emotion";

const VideoRecorder: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recording, setRecording] = useState<boolean>(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [EmotionSnapshots, setEmotionSnapshots] = useState<Emotion[][]>([]);

  useEffect(() => {
    async function setupMediaRecorder() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream; // Set the srcObject property here
      }
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => setBlob(e.data);
      setMediaRecorder(recorder);
    }
    setupMediaRecorder();
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      console.log(EmotionSnapshots);
      setEmotionSnapshots([]);
    }
  };


  return (
    <div>
      <FaceWidgets
        recording={recording}
        setEmotionSnapshots={setEmotionSnapshots}
      />
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
