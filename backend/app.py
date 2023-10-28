from flask import Flask
import together
import os
from flask import request
from dotenv import load_dotenv

load_dotenv()

together.api_key = os.environ.get("TOGETHER_API_KEY")

app = Flask(__name__)

@app.route('/api/feedback', methods=['POST'])
def feedback():
    data = request.json

    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    question = "Tell me about your experience during your last internship."
    answer = data.get('answer')


    prompt = "Given an interview question and this response, provide a constructive critical analysis to help improve my interview answer pretending you are a speaking coach directing guidance. Question: " + question + " Response: " + answer
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
    return output['output']['choices'][0]['text']

if __name__ == '__main__':
    app.run()
