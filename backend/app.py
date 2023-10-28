import os

import openai
import together
from dotenv import load_dotenv
from flask import Flask, request, jsonify

load_dotenv()

app = Flask(__name__)

@app.route('/api/feedback', methods=['POST'])
def feedback():
    together.api_key = os.environ.get("TOGETHER_API_KEY")

    data = request.json

    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    question = "Tell me about your experience during your last internship."
    answer = data.get('answer')


    prompt = "Given an interview question and this response, provide a constructive critical analysis to help improve my interview answer pretending you are a speaking coach directing guidance. Be concise, no need to explain everything in detail. Question: " + question + " Response: " + answer
    # prompt = "hi how are you?"
    output = together.Complete.create(
        prompt,
        model = "togethercomputer/llama-2-13b-chat", 
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
    Request format: {"filepath": "/path/to/audio/file.mp3}
    """
    try:
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        # Get the file path from the request
        audio_filepath = request.json["filepath"]

        # Check if the file exists
        if not os.path.exists(audio_filepath):
            return jsonify({'Error': 'File not found'}), 404
        
        file_size = os.path.getsize(audio_filepath)
        
        # Check if the file size is greater than 25 MB
        if file_size > 25 * 1024 * 1024:
            return jsonify({'error': 'File size exceeds 25 MB'}), 400
        
        audio_file = open(audio_filepath, "rb")
        try:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
            return transcript["text"]
        except Exception as e:
            return jsonify({'Error': str(e)}), 404

    except Exception as e:
        return jsonify({'Error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
