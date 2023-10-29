import { useEffect, useRef, useState, FC } from "react";
import { FaceWidgets } from "../components/widgets/FaceWidgets";
import { Emotion, EmotionName } from "../lib/data/emotion";
import { AudioWidgets } from "../components/widgets/AudioWidgets";
import { ProsodyWidgets } from "../components/widgets/ProsodyWidgets";

const VideoRecorder: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recording, setRecording] = useState<boolean>(false);
  const [livecam, setLiveCam] = useState<boolean>(true);
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
      setLiveCam(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setLiveCam(false);
      console.log(EmotionSnapshots);
      setEmotionSnapshots([]);
    }
  };


  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center py-10">
        <div className="">
          {livecam ? (
            <FaceWidgets
                  recording={recording}
                  setEmotionSnapshots={setEmotionSnapshots}
            />
            ) : (
              <div>
              {blob && (
                <video width="480" height="320" src={URL.createObjectURL(blob)} className="pb-10" controls></video>
              )}
              </div>
            )
          }
        </div>
        
        {recording ? (
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg lg:w-1/5" onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg lg:w-1/5" onClick={startRecording}>Start Recording</button>
        )}
        {/* {blob && !recording && (
          <video src={URL.createObjectURL(blob)} controls></video>
        )} */}
        {/* <ProsodyWidgets /> */}
      </div>
      
    </div>
  );
};

export default VideoRecorder;
