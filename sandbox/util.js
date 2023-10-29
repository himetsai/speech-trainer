const questionBank = [
    "Describe a time when you faced a significant challenge at work. How did you handle it?",
    "Tell me about a time when you had to work closely with a colleague who was very different from you. How did you ensure a productive working relationship?",
    "Share an instance where you had to meet a tight deadline. How did you manage your time and resources?",
    "Can you provide an example of when you took the initiative to solve a problem at work? What was the outcome?",
    "Describe a situation where you received constructive criticism. How did you respond, and what did you learn from the experience?",
    "Tell me about a time when you had to adapt to a significant change in your work environment. How did you handle it?",
    "Describe a situation where you had to collaborate with a challenging team or group. How did you navigate the challenges?",
    "Share an example of a project where you had to manage multiple tasks or priorities. How did you ensure successful completion?",
    "Tell me about a time when you went above and beyond the requirements of your job. What motivated you to put in the extra effort?",
    "Describe a situation where you had to communicate a complex idea or information to a team or individual. How did you ensure understanding?",
]

const getRandomInt = (min, max) => {
    let min = Math.ceil(min);
    let max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const getRandomQuestion = () => {
    return questionBank[getRandomInt(0, questionBank.length - 1)]
}