import { useEffect, useRef, useState, FC } from "react";
import { FaceWidgets } from "../components/widgets/FaceWidgets";
import { Emotion } from "../lib/data/emotion";
import { ProsodyWidgets } from "../components/widgets/ProsodyWidgets";
import { fetchFeedback, fetchSTT, fetchTTS } from "../api.js";
import { AudioWidgets } from "../components/widgets/AudioWidgets";
import { getRandomQuestion } from "../util.js"

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
  const [question, setQuestion] = useState<string>("Describe a time when you faced a significant challenge at work. How did you handle it?");
  const [asking, setAsking] = useState<boolean>(false);

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
          {"question": question,
            "answer": transcript.text,
          },
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

  const handleScrollToBottom = () => {
    window.scrollBy({
        top: window.innerHeight, // scrolls down by one viewport height
        behavior: 'smooth'
    });
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

  const handleNewQuestion = async () => {
    console.log("CLICKED")
    setAsking(true);
    let new_question = question
    while (new_question === question) {
      new_question = getRandomQuestion();
    }
    setQuestion(new_question);
    const questionUrl = await fetchTTS(
      "http://127.0.0.1:5000/api/text-to-speech",
      question,
      "Bella",
      "question",
    );
    console.log(questionUrl);
    const questionSpeech = new Audio(questionUrl);
    questionSpeech.addEventListener('ended', () => setAsking(false))
    questionSpeech.play();
  }

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
                      disabled={asking}
                    >
                      <text className="flex h-full w-full items-center justify-center">
                        Start Recording
                      </text>
                    </button>
                  )}

                  <button
                    className="flex h-12 w-full rounded-md bg-green-500 font-bold text-white hover:bg-green-600"
                    disabled={asking}
                    onClick={handleNewQuestion}
                  >
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

          {/* <div className="container flex flex-row justify-center">
            {recording ? (
              <button
                className="rounded-lg bg-red-500 p-4 py-2 px-4 font-bold text-white hover:bg-red-600 lg:w-1/5"
                onClick={stopRecording}
              >
                Stop Recording
              </button>
            ) : (
              <button
                className="rounded-lg bg-blue-500 p-4 py-2 px-4 font-bold text-white hover:bg-blue-600 lg:w-1/5"
                onClick={startRecording}
                disabled={asking}
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
        </div>
      )}
                <div className="absolute bottom-5 w-full flex justify-center">
                    <div className="flex flex-row justify-center items-center cursor-pointer" onClick={handleScrollToBottom}>
                        <p className="text-sm text-gray-500">Show my insights</p>
                        <svg className="ml-2 w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                    </div>
                </div>

            {/* The empty space with the AudioWidgets */}
            <div className="container mx-auto py-8 mt-20 border border-black">
                    <AudioWidgets modelName="prosody" recordingLengthMs={500} streamWindowLengthMs={2000} />
                </div>
        </div>
    );
};

export default VideoRecorder;
