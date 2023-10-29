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

@app.route('/api/feedback', methods=['POST'])
def feedback():
    together.api_key = os.environ.get("TOGETHER_API_KEY")

    print(request.json)
    
    question = request.json.get("question")

    answer = request.json.get("answer")
    prompt = "I was asked to answer this question during an interview: \"" + question \
    + "\". I responded with: \"" + answer + "\". Provide three short feedback points to help me improve my answer. Do NOT repeat my answer or offer an improved response."
    
    #prompt = "Question: \"" + question + "\"\nResponse: \"" + answer + \
    #    "\"\nGiven this interview question, provide constructive critical feedback to help me improve my answer."

    #prompt = "[INST] You are a professional one-on-one coach who provides job-seekers with individualized feedback in order to best prepare them for upcoming interviews. You just asked them the question, \"" + question + "\". Respond with one sentence per section of STAR, always including one way they can improve their application of STAR. [INST]" + answer

    output = together.Complete.create(
        prompt,
        model = "togethercomputer/llama-2-13b-chat", 
        max_tokens = 256,
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
            return send_file("./feedback.mp3", as_attachment=False)
        elif res_type == "question":
            save(audio_bytes, "question.mp3")
            return send_file("./question.mp3", as_attachment=False)
    except Exception as e:
        return jsonify({'Error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
