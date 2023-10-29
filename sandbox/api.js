// import fetch from "node-fetch";

export const fetchFeedback = async (url, answer) => {
  // Make a POST request
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(answer),
  })
    .then(async (response) => {
      if (!response.ok) {
        // Log the response content if there's an error
        const text = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Body: ${text}`
        );
      }
      return response.json();
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
};

const fetchTTS = async (url, text, voice) => {
  const data = {
    text: text,
    voice: voice,
  };

  // Make a POST request
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      if (!response.ok) {
        // Log the response content if there's an error
        const text = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Body: ${text}`
        );
      }
      return response.json();
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
};

export const fetchSTT = async (url, audioBlob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audio.mp3");
  formData.append("model", "whisper-1");

  // Make a POST request
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  })

  const val = await res.json();

  console.log(val);

  return val;

    // .then(async (response) => {
    //   if (!response.ok) {
    //     // Log the response content if there's an error
    //     const text = await response.text();
    //     throw new Error(
    //       `HTTP error! Status: ${response.status}, Body: ${text}`
    //     );
    //   }
    //   console.log(response.text());
    //   return response.text();
    // })
    // .catch((error) => console.error("Error:", error));
};
