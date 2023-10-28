let fetch;

// Dynamically import node-fetch
import('node-fetch').then(module => {
    fetch = module.default;


    //fetch speech to text from whisper
    const fetchSTT = (filepath) => {
        const url = "http://10.42.130.71:5000/api/speech-to-text";
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
        .then((response) => {
          if (!response.ok) {
              // Log the response content if there's an error
              return response.text().then(text => {
                  throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
              });
          }
          return response.text();
      })

            .then((data) => console.log(data))
            .catch((error) => console.error("Error:", error));
    }



    // Fetch feedback from llama
    const fetchFeedback = (answer) => {
        const url = "http://10.42.130.71:5000/api/feedback";
        const data = {
            "answer": answer,
            "api_key": "0f0f03e6f007eb22b31ca7625a3122c5193309f982135a246bc1eb1dcbbcb1fe"  // Add your API key here
        };

        // Make a POST request
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
          if (!response.ok) {
              // Log the response content if there's an error
              return response.text().then(text => {
                  throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
              });
          }
          return response.json();
        })

        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));

    }

    //get TTS audio from elevenlabs API
    const fetchTTS = (text_reply) => {
        const url = "http://10.42.130.71:5000/api/text-to-speech";
        const data = {
            "text_reply": text_reply
        };

        // Make a POST request
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
          if (!response.ok) {
              // Log the response content if there's an error
              return response.text().then(text => {
                  throw new Error(`HTTP error! Status: ${response.status}, Body: ${text}`);
              });
          }
          return response.json();
        })

        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));

    }

    const answer = "My last internship I was working on validating optical flow technology in UAVs because my company was trying to navigate in GPS denied environments, and we wanted a localization solution. As an intern I tested optical flow sensors, did data analysis in MATLAB, and solved engineering problems to solve various challenges that popped up as I was implemented the sensors with our software and using them for navigation. I learned about validating and experi - validating my hypotheses and asking better questions, as well as presentation skills and how to tackle difficult or unknown engineering problems.";

    const filepath = "New_Recording.mp3"

    const text_reply = "Hey baby drop it to the floor come on make it move"

    // Call your function
    fetchFeedback(answer);
    fetchSTT(filepath);
    // fetchTTS(text_reply);

}).catch(error => {
    console.error("Failed to dynamically import node-fetch:", error);
});