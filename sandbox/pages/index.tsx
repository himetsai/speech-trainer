import { useEffect, useRef, useState, FC } from "react";
import { FaceWidgets } from "../components/widgets/FaceWidgets";
import { Emotion } from "../lib/data/emotion";
import { ProsodyWidgets } from "../components/widgets/ProsodyWidgets";
import { fetchFeedback, fetchSTT, fetchTTS } from "../api.js";
import { AudioWidgets } from "../components/widgets/AudioWidgets";

const VideoRecorder: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recording, setRecording] = useState<boolean>(false);
  const [livecam, setLiveCam] = useState<boolean>(true);
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

        const transcript = await fetchSTT(
          "http://127.0.0.1:5000/api/speech-to-text",
          audioBlob
        );
        const feedback = await fetchFeedback(
          "http://127.0.0.1:5000/api/feedback",
          transcript
        );
        const feedbackUrl = await fetchTTS(
          "http://127.0.0.1:5000/api/text-to-speech",
          feedback,
          "Bella",
          "feedback",
        );
        console.log(feedbackUrl);
        const feedbackSpeech = new Audio(feedbackUrl);
        feedbackSpeech.play();
        chunks = [];
      };
    }
    setupAudioRecorder();
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setRecording(true);
      setLiveCam(true);
    }
    if (audioRecorder) {
      audioRecorder.start();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setLiveCam(false);
      setEmotionSnapshots([]);
    }
    if (audioRecorder) {
      audioRecorder.stop();
    }
  };

  const handleScrollToBottom = () => {
    const target = document.querySelector('.scroll-target');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
};


  return (
    <div className="container mx-auto py-4">
      {<div className="flex flex-col items-center py-10">
        <div className="">
          {livecam ? (
            <FaceWidgets
              recording={recording}
              setEmotionSnapshots={setEmotionSnapshots}
            />
          ) : (
            <div>
              {blob && (
                <video
                  width="480"
                  height="320"
                  src={URL.createObjectURL(blob)}
                  className="pb-10"
                  controls
                ></video>
              )}
            </div>
          )}
        </div>

        <div className="container flex flex-row justify-center">

          {recording ? (
            <button
              className="rounded-lg bg-red-500 py-2 px-4 p-4 font-bold text-white hover:bg-red-600 lg:w-1/10 mr-4"
              onClick={stopRecording}
            >
              Stop Recording
            </button>
          ) : (
            <button
              className="rounded-lg bg-blue-500 py-2 px-4 p-4 font-bold text-white hover:bg-blue-600 lg:w-1/10 mr-4"
              onClick={startRecording}
            >
              Start Recording
            </button>
          )}

            <button
              className="rounded-lg bg-green-500 py-2 px-4 p-4 font-bold text-white hover:bg-green-600 lg:w-1/10 mr-4"
            >
              New Question
            </button>

        </div>

        <div className="absolute bottom-5 w-full flex justify-center">
  <div className="flex flex-row justify-center items-center cursor-pointer" onClick={handleScrollToBottom}>
    <p className="text-sm text-gray-500">View my insights</p>
    <svg className="ml-2 w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
    </svg>
  </div>
</div>

<div className="container mx-auto py-8 mt-20 h-[calc(100vh-55px)] scroll-target">

            <AudioWidgets modelName="prosody" recordingLengthMs={500} streamWindowLengthMs={2000} />

        </div>

        
        {/* {blob && !recording && (
          <video src={URL.createObjectURL(blob)} controls></video>
        )} */}
        {/* <ProsodyWidgets /> */}
      </div>}
    </div>
  );
};

export default VideoRecorder;
