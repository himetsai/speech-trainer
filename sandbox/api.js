// import fetch from "node-fetch";

export const fetchFeedback = async (url, answer) => {
  // Make a POST request
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answer),
    });
    if (!res.ok) {
      // Log the response content if there's an error
      const text = await res.text();
      throw new Error(`HTTP error! Status: ${res.status}, Body: ${text}`);
    }
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Error:", e);
  }
};

export const fetchTTS = async (url, text, voice) => {
  const data = {
    text: text,
    voice: voice,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log(res);
    if (!res.ok) {
      // Log the response content if there's an error
      const text = await res.text();
      throw new Error(`HTTP error! Status: ${res.status}, Body: ${text}`);
    }
    const d = await res.blob();
    return URL.createObjectURL(d);
  } catch (e) {
    console.error("Error:", e);
  }
};

export const fetchSTT = async (url, audioBlob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.mp3");
  formData.append("model", "whisper-1");

  // Make a POST request
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const val = await res.json();

  return val;
};
