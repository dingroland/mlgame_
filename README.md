# ML Knowledge Quiz 

A beautiful, modern web-based quiz application for testing Machine Learning knowledge. Features an attractive UI with smooth animations, real-time feedback, and responsive design.

## Features 

- **Modern UI**: Beautiful gradient backgrounds, smooth animations, and professional styling
- **Interactive Experience**: Click or use keyboard shortcuts to navigate
- **Real-time Feedback**: Instant visual feedback showing correct/incorrect answers
- **Progress Tracking**: Live progress bar and question counter
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Navigation**: Browse between questions freely, with answers preserved
- **Score Tracking**: Complete results with percentage scoring
- **Keyboard Shortcuts**: Use number keys (1-4) to select options, Enter to submit, arrow keys to navigate
- **Auto-advance**: Automatically moves to next question after showing results

## Quick Start 

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Application**
   ```bash
   python app.py
   ```

3. **Open Browser**
   Navigate to `http://localhost:5000` in your web browser

## Keyboard Shortcuts 

- **1-4**: Select answer options A-D
- **Enter**: Submit answer or go to next question
- **←/→**: Navigate between questions (when appropriate)

## File Structure 

```
├── app.py              
├── quiz_questions_template.json  
├── requirements.txt       
├── templates/
│   └── quiz.html        
├── static/
│   ├── css/
│   │   └── style.css     
│   └── js/
│       └── quiz.js       
└── README.md             
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

