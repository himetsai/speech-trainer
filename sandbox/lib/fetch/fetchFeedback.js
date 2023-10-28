const axios = require('axios');

function fetchFeedback(data) {
  const url = 'https://127.0.0.1:5000';
  
  axios.get('https://127.0.0.1:5000')
    .then((response, data) => {
      console.log(response.data)
    })
    .catch((error) => {
      return error;
    });
}

const data = {
    answer: 'My last internship I was working on validating optical flow technology in UAVs because my company was trying to navigate in GPS denied environments, and we wanted a localization solution. As an intern I tested optical flow sensors, did data analysis in MATLAB, and solved engineering problems to solve various challenges that popped up as I was implemented the sensors with our software and using them for navigation. I learned about validating and experi - validating my hypotheses and asking better questions, as well as presentation skills and how to tackle difficult or unknown engineering problems.'
  };

  fetchFeedback(data)

