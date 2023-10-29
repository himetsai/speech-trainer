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
  const [time, setTime] = useState<number>(30);
  const [showtime, setShowTime] = useState<boolean>(false);
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
      setTime(30);
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

  useEffect(() => {
    if (recording && time > 0) {
      // Run a timer that decrements the time every second
      const timerId = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);

      // Clear the interval when the component is unmounted, or the time reaches 0
      return () => clearInterval(timerId);
    }

    if (time === 0) {
      // Stop recording when the time reaches 0
      stopRecording();
    }
  }, [recording, time]);

  return (
    <div className="container mx-auto flex h-full py-8">
      {loading ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="spinner items-center justify-center">
            <Image src="/nerd.webp" alt="" width="200" height="200"></Image>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center pb-4">
          <div className="">
            {livecam ? (
              <div className="flex flex-col">
                <div className="flex h-16 justify-center text-5xl font-bold">
                  {recording && <h1>{time}</h1>}
                </div>
                <FaceWidgets
                  recording={recording}
                  setEmotionSnapshots={setEmotionSnapshots}
                />
                {/* Button */}
                <div className="container flex w-full flex-row justify-center space-x-3 text-center">
                  {recording ? (
                    <button
                      className="flex w-full items-center justify-center rounded-md bg-red-500 font-bold text-white hover:bg-red-600"
                      onClick={stopRecording}
                    >
                      <text className="flex h-full w-full items-center justify-center">
                        Stop Recording
                      </text>
                    </button>
                  ) : (
                    <button
                      className="flex w-full rounded-md bg-blue-500 font-bold text-white hover:bg-blue-600"
                      onClick={startRecording}
                    >
                      <text className="flex h-full w-full items-center justify-center">
                        Start Recording
                      </text>
                    </button>
                  )}

                  <button className="flex h-12 w-full rounded-md bg-green-500 font-bold text-white hover:bg-green-600">
                    <text className="flex h-full w-full items-center justify-center">
                      New Question
                    </text>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {blob && (
                  <video
                    width="480"
                    height="320"
                    src={URL.createObjectURL(blob)}
                    className="rounded-md pb-10"
                    controls
                  ></video>
                )}
              </div>
            )}
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
