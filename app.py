from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json
import random
import os

app = Flask(__name__)
# A secret key is required for session management
app.secret_key = os.urandom(24)

def load_quiz_data():
    """Loads the quiz data from quiz_data.json."""
    try:
        with open('quiz_data.json', 'r') as f:
            data = json.load(f)
            # Filter out questions that might have had generation errors
            return {k: v for k, v in data.items() if 'error' not in v}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

QUIZ_DATA = load_quiz_data()

@app.route('/', methods=['GET', 'POST'])
def index():
    """
    Handles the start page.
    A POST request starts a new quiz session.
    """
    if request.method == 'POST':
        # Start a new quiz
        session['lightweight_mode'] = 'lightweight_mode' in request.form
        sequential_mode = 'sequential_mode' in request.form
        
        question_ids = list(QUIZ_DATA.keys())
        if not sequential_mode:
            random.shuffle(question_ids)
            
        session['question_ids'] = question_ids
        session['current_question_index'] = 0
        session['score'] = 0
        
        return redirect(url_for('quiz'))

    return render_template('index.html')

@app.route('/quiz', methods=['GET'])
def quiz():
    """Displays the current question."""
    if 'question_ids' not in session:
        return redirect(url_for('index'))

    q_index = session.get('current_question_index', 0)
    question_ids = session.get('question_ids', [])

    if q_index >= len(question_ids):
        return redirect(url_for('results'))

    q_id = question_ids[q_index]
    question_data = QUIZ_DATA.get(q_id, {})

    true_statements = question_data.get('true_statements', [])
    false_statements = question_data.get('false_statements', [])
    lightweight_mode = session.get('lightweight_mode', False)

    # If a question has no true statements, it's un-askable. Skip it.
    if not true_statements:
        print(f"ERROR: Question {q_id} has no true statements. Skipping.")
        session['current_question_index'] += 1
        return redirect(url_for('quiz'))

    choices = []
    correct_choices = []

    if lightweight_mode:
        # Lightweight Mode: 1 true, 3 false.
        correct_answer = random.choice(true_statements)
        choices.append(correct_answer)
        correct_choices.append(correct_answer)
        
        choices.extend(random.sample(false_statements, 3))
    else:
        # Normal Mode: A mix adding to 4 choices total.
        # Decide how many true statements to include (1 to 3).
        num_true = random.randint(1, min(len(true_statements), 3))
        num_false = 4 - num_true

        correct_answers = random.sample(true_statements, num_true)
        incorrect_answers = random.sample(false_statements, num_false)
        
        choices.extend(correct_answers)
        choices.extend(incorrect_answers)
        correct_choices.extend(correct_answers)
    
    random.shuffle(choices)
    
    session['current_correct_choices'] = correct_choices
    session['current_more_info'] = question_data.get('more_info', 'No further information available.')

    return render_template(
        'quiz.html',
        question=question_data.get('question', 'Error: Question text could not be loaded.'),
        choices=choices,
        q_num=q_index + 1,
        total_questions=len(question_ids),
        lightweight_mode=lightweight_mode,
        num_correct=len(correct_choices)
    )

@app.route('/check', methods=['POST'])
def check_answer():
    """Checks the submitted answer and shows feedback."""
    if 'question_ids' not in session:
        return redirect(url_for('index'))

    user_answers = request.form.getlist('choice')
    correct_choices = session.get('current_correct_choices', [])
    
    # In lightweight mode, there's only one choice. In multi-select, all correct must be chosen.
    is_correct = sorted(user_answers) == sorted(correct_choices)
    
    if is_correct:
        session['score'] = session.get('score', 0) + 1

    session['current_question_index'] += 1

    return render_template(
        'feedback.html',
        is_correct=is_correct,
        more_info=session.get('current_more_info'),
        correct_answers=correct_choices
    )

@app.route('/results')
def results():
    """Displays the final results of the quiz."""
    if 'question_ids' not in session:
        return redirect(url_for('index'))
    
    score = session.get('score', 0)
    total = len(session.get('question_ids', []))
    
    # Clear session for the next quiz
    session.pop('question_ids', None)
    session.pop('current_question_index', None)
    session.pop('score', None)

    return render_template('results.html', score=score, total=total)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 