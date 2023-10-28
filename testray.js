const fetchFeedbacka = (answer) => {
    const url = "https://127.0.0.1:5000/api/feedback";
  
    data = { "answer": answer };
  
    // Make a POST request
    fetch(url, {
      method: "POST", // Specify the request method
      headers: {
        "Content-Type": "application/json", // Specify content type as JSON
      },
      body: JSON.stringify(data), // Convert data to JSON string
    })
      .then((response) => response.json()) // Parse the JSON from the response
      .then((data) => console.log(data)) // Handle the data from the request
      .catch((error) => console.error("Error:", error)); // Handle errors
  }
  
  const answer = "My last internship I was working on validating optical flow technology in UAVs because my company was trying to navigate in GPS denied environments, and we wanted a localization solution. As an intern I tested optical flow sensors, did data analysis in MATLAB, and solved engineering problems to solve various challenges that popped up as I was implemented the sensors with our software and using them for navigation. I learned about validating and experi - validating my hypotheses and asking better questions, as well as presentation skills and how to tackle difficult or unknown engineering problems.",
  
  fetchFeedbacka(answer)