import fetch from "node-fetch";

const fetchFeedback = async (url, answer) => {
    const data = {
        "answer": answer
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
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
    }
    return response.json();
  })
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
}

const fetchTTS = async (url, text, voice) => {
    const data = {
        "text": text,
        "voice": voice
    };

    // Make a POST request
    fetch(url, {
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
          throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
      }
      return response.json();
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
}

const fetchSTT = async (url, filepath) => {
    const data = {
        "filepath": filepath
    };

    // Make a POST request
    fetch(url, {
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
          throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
      }
      return response.text();
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
}