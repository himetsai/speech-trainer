import os
import openai
import together
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file
from elevenlabs import generate, save
from flask_cors import CORS
import logging
import random

load_dotenv()

app = Flask(__name__)
CORS(app)

interviewQuestions = ["Give me an example of a time you had a conflict with a team member. How did you handle it?", 
                      "Give me an example of a challenge you faced in your internship or project. How did you handle it?", 
                      "Describe an occasion when you failed at a task. What did you learn from it?", 
                      "Describe an occasion when you had to manage your time to complete a task. How did you do it?", 
                      "Tell me about a time you took the initiative in your career. What was your motivation for doing so?", 
                      "Tell me about your greatest achievement.",
                      "Tell me about your last internship",
                      "You realize you'll be unable to meet a deadline, what do you do?"]

@app.route('/api/feedback', methods=['POST'])
def feedback():
    together.api_key = os.environ.get("TOGETHER_API_KEY")
    
    # question = random.choice(interviewQuestions)
    question = interviewQuestions[1]

    # response = "Of course. So, there was this one period at my previous job where our department was going through a lot of changes. We were merging with another team, and I had recently taken on a new project while still wrapping up a previous one. One morning, I came in to find that two members of our team were out sick, and their tasks had been temporarily reallocated, with a few landing on my desk. I remember staring at my to-do list and feeling this rush of anxiety because there were urgent tasks from multiple projects that needed my attention, on top of the new responsibilities from the merger. I honestly didn't know where to start. After a moment of panic, I decided to step away for a few minutes to clear my head. I grabbed a coffee and took a short walk outside. When I came back, I prioritized the tasks based on their deadlines and importance, breaking each task into smaller steps. I reached out to my manager, explaining the situation and asking for clarification on which tasks were absolutely critical for the day. With her guidance and a clear plan in place, I managed to tackle each task one by one. The day was long and challenging, but by the end of it, I felt a sense of accomplishment. It was a learning experience for sure. It taught me the importance of communication, delegation when needed, and the ability to step back and reassess when feeling overwhelmed."

    answer = request.json.get("text")
    # prompt = """Question: \"" + question + "\"\nResponse: \"" + answer + \
    #     "\"\nGiven this interview question, provide constructive critical feedback to help me improve my answer."

    prompt = "[INST] You are a professional one-on-one coach who provides job-seekers with individualized feedback in order to best prepare them for upcoming interviews. You just asked them the question, \"" + question + "\". Respond with one sentence per section of STAR, always including one way they can improve their application of STAR. [INST]" + answer

    output = together.Complete.create(
        prompt,
        model = "togethercomputer/llama-2-13b-chat", 
        max_tokens = 128,
        temperature = 0.8,
        top_k = 50,
        top_p = 0.7,
        repetition_penalty = 1.1,
    )
    return jsonify(output['output']['choices'][0]['text'])

@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    """
    Request format: {"filepath": "blobUrl"}
    """
    try:
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        audio_file = request.files["audio"]
        audio_file.save('audio.wav')
        audio_file = open("audio.wav", "rb")
        try:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
            return jsonify(transcript)
        except Exception as e:
            return jsonify({'Error': str(e)}), 404

    except Exception as e:
        return jsonify({'Error': str(e)}), 500

@app.route('/api/text-to-speech/<res_type>', methods=['POST'])
def text_to_speech(res_type):
    """
    Request format: {"text": "Hello World!", "voice": "Grace"}
    """
    try:
        text, voice = request.json["text"], request.json["voice"]
        audio_bytes = generate(text=text, voice=voice)
        if res_type == "feedback":
            save(audio_bytes, "feedback.mp3")
        elif res_type == "question":
            save(audio_bytes, "question.mp3")
        return send_file("./feedback.mp3", as_attachment=False)
    except Exception as e:
        return jsonify({'Error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
