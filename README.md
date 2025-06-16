# ML Knowledge Quiz

A simple, web-based quiz application for testing Machine Learning knowledge. This app uses GPT-4o to generate answers and explanations for your questions.

## How to Run

1.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Set OpenAI API Key**
    You need to set your OpenAI API key as an environment variable. ONLY if you want new questions!!
    ```bash
    export OPENAI_API_KEY="your-secret-api-key-goes-here"
    ```

3.  **Generate Quiz Content (Optional)**
    **Note:** The `quiz_data.json` file is already included. You only need to run this step if you modify `questions.json` and want to regenerate the content.
    ```bash
    python generate_answers.py
    ```

4.  **Run the Application**
    ```bash
    python app.py
    ```

5.  **Open in Browser**
    Navigate to `http://0.0.0.0:5001` in your web browser.

## Features

- **Dynamic Content**: Generates true statements, false statements, and deeper explanations for each question using GPT-4o.
- **Game Modes**: Choose between Lightweight (single correct answer) and Normal (multiple correct answers) modes.
- **Question Order**: Play in sequential or random order.
- **Hints**: Get a hint about the number of correct answers for each question.
- **Instant Feedback**: See if you were right or wrong immediately after answering.

## File Structure

```
.
├── app.py                  # Main Flask application
├── generate_answers.py     # Script to generate quiz content
├── questions.json          # Your list of base questions
├── quiz_data.json          # The generated quiz data
├── requirements.txt        # Project dependencies
├── static/
│   └── css/
│       └── style.css       # Styles
└── templates/
    ├── index.html          # Start page
    ├── quiz.html           # Question page
    ├── feedback.html       # Feedback page
    └── results.html        # Final results page
```

## Customizing Questions 

Edit the `quiz_questions_template.json` file to add your own questions. Follow this format:

```json
{
  "id": 1,
  "question": "Your question here?",
  "options": [
    "Option A text",
    "Option B text", 
    "Option C text",
    "Option D text"
  ],
  "answer": "Option A text"
}
```

## Technologies Used 

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Poppins)

## Browser Support 

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

