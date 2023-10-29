import { useEffect, useRef, useState, FC } from "react";
import { FaceWidgets } from "../components/widgets/FaceWidgets";
import { Emotion } from "../lib/data/emotion";
import { ProsodyWidgets } from "../components/widgets/ProsodyWidgets";
import { fetchFeedback, fetchSTT, fetchTTS } from "../api.js";
import Image from "next/image";

const VideoRecorder: FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recording, setRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
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

        setLoading(true);

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
          "feedback"
        );

        setLoading(false);
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

  return (
    <div className="container mx-auto flex h-full py-8">
      {loading ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="spinner items-center justify-center">
            <Image src="/nerd.webp" alt="" width="200" height="200"></Image>
          </div>
        </div>
      ) : (
        <div className="flex w-full h-full flex-col items-center py-10">
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
                className="rounded-lg bg-red-500 py-2 px-4 p-4 font-bold text-white hover:bg-red-600 lg:w-1/5"
                onClick={stopRecording}
              >
                Stop Recording
              </button>
            ) : (
              <button
                className="rounded-lg bg-blue-500 py-2 px-4 p-4 font-bold text-white hover:bg-blue-600 lg:w-1/5"
                onClick={startRecording}
              >
                Start Recording
              </button>
            )}
  
            <button
              className="rounded-lg bg-green-500 py-2 px-4 p-4 font-bold text-white hover:bg-green-600 lg:w-1/5"
            >
              New Question
            </button>

        </div>
        {/* {blob && !recording && (
          <video src={URL.createObjectURL(blob)} controls></video>
        )} */}
          {/* <ProsodyWidgets /> */}
        </div>
      )}
    </div>
  );
};

export default VideoRecorder;
