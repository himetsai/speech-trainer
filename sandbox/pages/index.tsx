import { useEffect, useRef, useState, FC } from "react";
import { FaceWidgets } from "../components/widgets/FaceWidgets";
import { Emotion } from "../lib/data/emotion";
import { ProsodyWidgets } from "../components/widgets/ProsodyWidgets";
import { fetchFeedback, fetchSTT, fetchTTS } from "../api.js";
import { AudioWidgets } from "../components/widgets/AudioWidgets";
import { getRandomQuestion } from "../util.js";

import Image from "next/image";

const VideoRecorder: FC = () => {
  const feedbackk = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget purus vel erat lacinia hendrerit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris in libero ac neque laoreet venenatis. Fusce non felis id justo tincidunt auctor. Sed volutpat tortor eu arcu viverra, id auctor odio consequat. Sed nec orci in massa mattis vehicula. Integer nec dolor vel libero hendrerit iaculis. Proin eu lectus eu libero iaculis fermentum. Sed bibendum odio ac ipsum laoreet bibendum.

  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed id semper urna, ac convallis justo. Curabitur ac risus at ipsum pellentesque iaculis. Fusce in elit nec ligula vehicula tincidunt. Quisque nec erat eu libero sollicitudin lobortis nec non enim. Duis nec feugiat libero. Sed eu tellus id libero bibendum venenatis. Aliquam erat volutpat. Vivamus lacinia urna a justo ullamcorper, eu tincidunt arcu luctus. Vivamus id massa vel libero lacinia feugiat`;

  const user_said =
    "This is an example of a paragraph that the user may have said, transcribed by Whisper.";

  const interviewer_question =
    "What was a time you had to use time management skills?";

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
  const [question, setQuestion] = useState<string>(
    "Describe a time when you faced a significant challenge at work. How did you handle it?"
  );
  const [response, setResponse] = useState<string>(user_said);
  const [critique, setCritique] = useState<string>(feedbackk);
  const [asking, setAsking] = useState<boolean>(false);
  // const [showGraph, setShowGraph] = useState(false);

  const [isDone, setDone] = useState<boolean>(false);

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

        if (transcript) setResponse(transcript.text);

        const feedback = await fetchFeedback(
          "http://127.0.0.1:5000/api/feedback",
          { question: question, answer: transcript.text }
        );

        if (feedback) setCritique(feedback);

        const feedbackUrl = await fetchTTS(
          "http://127.0.0.1:5000/api/text-to-speech",
          feedback,
          "Bella",
          "feedback"
        );
        setDone(true);
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
      top: window.innerHeight - 60, // scrolls down by one viewport height
      behavior: "smooth",
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
    console.log("CLICKED");
    setAsking(true);
    let new_question = question;
    while (new_question === question) {
      new_question = getRandomQuestion();
    }
    setQuestion(new_question);
    const questionUrl = await fetchTTS(
      "http://127.0.0.1:5000/api/text-to-speech",
      question,
      "Bella",
      "question"
    );
    console.log(questionUrl);
    const questionSpeech = new Audio(questionUrl);
    questionSpeech.addEventListener("ended", () => setAsking(false));
    questionSpeech.play();
  };

  return (
    <div className="flex h-full w-full">
      {loading ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="spinner items-center justify-center">
            <Image src="/nerd.webp" alt="" width="200" height="200"></Image>
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center">
          <div className="">
            {livecam ? (
              <div className="flex w-full flex-col">
                <div className="flex h-16 justify-center text-5xl font-bold">
                  {recording && <h1>{time}</h1>}
                </div>
                <div className="flex w-full items-center space-x-24">
                  <FaceWidgets
                    recording={recording}
                    setEmotionSnapshots={setEmotionSnapshots}
                  />
                  {/* {showGraph && (
                    <div className="flex h-full w-full">
                      <AudioWidgets
                        modelName="prosody"
                        recordingLengthMs={500}
                        streamWindowLengthMs={2000}
                      />
                    </div>
                  )} */}
                </div>

                {/* Button */}
                <div className="container flex w-full flex-row justify-center space-x-3 pt-4 text-center">
                  {recording ? (
                    <button
                      className="flex w-full max-w-[300px] items-center justify-center rounded-md bg-red-500
                       font-bold text-white hover:bg-red-600"
                      onClick={stopRecording}
                    >
                      <text className="flex h-full w-full items-center justify-center">
                        Stop Recording
                      </text>
                    </button>
                  ) : (
                    <button
                      className="flex w-full max-w-[300px] rounded-md bg-blue-500 font-bold text-white
                       hover:bg-blue-600"
                      onClick={startRecording}
                      disabled={asking}
                    >
                      <text className="flex h-full w-full items-center justify-center">
                        Start Recording
                      </text>
                    </button>
                  )}

                  <button
                    className="flex h-12 w-full max-w-[300px] rounded-md bg-green-500 font-bold 
                    text-white  hover:bg-green-600"
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
                    width="700"
                    height="300"
                    src={URL.createObjectURL(blob)}
                    className="rounded-md"
                    controls
                  ></video>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex w-full justify-center">
            <div
              className="flex cursor-pointer flex-row items-center justify-center"
              onClick={handleScrollToBottom}
            >
              <p className="text-sm text-black">Show my insights</p>
              <svg
                className="ml-2 h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* The empty space with the AudioWidgets */}
          <div className="my-1 flex w-full justify-center">
            {/* <div className="rounded-lg border-2 border-black bg-[#FFFAF0] p-10"> */}
            <AudioWidgets
              modelName="prosody"
              recordingLengthMs={500}
              streamWindowLengthMs={2000}
            />
            {/* </div> */}
          </div>

          {/* Summary */}
          {isDone && (
            <div className="flex">
              <div className="grid grid-cols-2">
                <div className="m-4 rounded-lg border-2 border-black bg-[#FFFAF0] p-10">
                  <h1 className="py-5 text-4xl font-bold">Question</h1>
                  <p className="text-xl">{question}</p>

                  <h1 className="py-5 text-4xl font-bold">Response</h1>
                  <p className="text-xl">{response}</p>
                </div>

                <div className="m-4 rounded-lg border-2 border-black bg-[#FFFAF0] p-10">
                  <h1 className="py-5 text-4xl font-bold">Feedback</h1>
                  <p className="text-lg">{critique}</p>
                </div>
              </div>
            </div>
          )}
          {/* <div
            className="fixed top-4 right-20"
            onClick={() => setShowGraph(showGraph ? false : true)}
          >
            {showGraph ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </div> */}

          {/* <div className="absolute bottom-5 flex w-full justify-center">
            <div
              className="flex cursor-pointer flex-row items-center justify-center"
              onClick={handleScrollToBottom}
            >
              <p className="text-sm text-gray-500">View my insights</p>
              <svg
                className="ml-2 h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div> */}

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
