import os

import openai
import together
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from elevenlabs import generate, save
from flask_cors import CORS
import logging

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/feedback', methods=['POST'])
def feedback():
    together.api_key = os.environ.get("TOGETHER_API_KEY")
    
    question = "Tell me about your experience during your last internship."

    answer = request.json.get("text")
    prompt = "Question: \"" + question + "\"\nResponse: \"" + answer + \
        "\"\nGiven this interview question, provide constructive critical feedback to help me improve my answer."

    print(prompt)
    output = together.Complete.create(
        prompt,
        model = "togethercomputer/llama-2-7b-chat", 
        max_tokens = 512,
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

        # audio_filepath = request.json["filepath"]

        # if not os.path.exists(audio_filepath):
        #     return jsonify({'Error': 'File not found'}), 404
        
        # file_size = os.path.getsize(audio_filepath)
        
        # Check if the file size is greater than 25 MB
        # if file_size > 25 * 1024 * 1024:
        #     return jsonify({'error': 'File size exceeds 25 MB'}), 400
        # print(request.files["audio"])

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

@app.route('/api/text-to-speech', methods=['POST'])
def text_to_speech():
    """
    Request format: {"text": "Hello World!", "voice": "Grace"}
    """
    try:
        text, voice = request.json["text"], request.json["voice"]
        audio_bytes = generate(text=text, voice=voice)
        save(audio_bytes, "feedback.mp3")
        return jsonify({})
    except Exception as e:
        return jsonify({'Error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
