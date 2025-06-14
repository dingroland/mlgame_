from flask import Flask, render_template, request, jsonify
import json
import random

app = Flask(__name__)

# Load quiz questions
def load_questions():
    try:
        with open('quiz_questions_template.json', 'r') as f:
            questions = json.load(f)
        return questions
    except FileNotFoundError:
        return []

@app.route('/')
def index():
    return render_template('quiz.html')

@app.route('/api/questions')
def get_questions():
    questions = load_questions()
    # Shuffle questions for variety
    random.shuffle(questions)
    return jsonify(questions)

@app.route('/api/submit', methods=['POST'])
def submit_answer():
    data = request.json
    question_id = data.get('question_id')
    selected_answer = data.get('selected_answer')
    
    questions = load_questions()
    question = next((q for q in questions if q['id'] == question_id), None)
    
    if question:
        correct_answer = question['answer']
        is_correct = selected_answer == correct_answer
        
        return jsonify({
            'correct': is_correct,
            'correct_answer': correct_answer,
            'explanation': f"The correct answer is: {correct_answer}"
        })
    
    return jsonify({'error': 'Question not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 