import openai
import json
import os
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Get OpenAI API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set.")

client = openai.OpenAI(api_key=api_key)

def get_structured_answer(question):
    """
    Calls the OpenAI API to get structured answers for a given question.
    Retries on failure.
    """
    system_prompt = """
    You are an expert in machine learning. Your task is to generate educational content for a quiz.
    For the given question, you must provide:
    1.  Three statements that are factually correct and directly related to the question.
    2.  Three statements that are factually incorrect, plausible-sounding, but ultimately false. These should be common misconceptions if possible.
    3.  A "more_info" section that provides a brief, deeper explanation of the topic. It can include simple formulas if relevant, but should be concise.

    You must provide your response in a valid JSON format. Do not include any text outside of the JSON structure.
    The JSON structure should be:
    {
      "true_statements": [
        "Statement 1",
        "Statement 2",
        "Statement 3"
      ],
      "false_statements": [
        "Statement 1",
        "Statement 2",
        "Statement 3"
      ],
      "more_info": "A deeper explanation..."
    }
    """

    attempts = 3
    for i in range(attempts):
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                temperature=0.5,
                response_format={"type": "json_object"}
            )
            # Try to parse to ensure it's valid JSON before returning
            json.loads(response.choices[0].message.content)
            return response
        except (openai.APIError, json.JSONDecodeError) as e:
            logging.warning(f"API call failed for question '{question}' on attempt {i+1}/{attempts}. Error: {e}. Retrying...")
            time.sleep(1) # Wait before retrying
    
    logging.error(f"Failed to get a valid structured answer for question '{question}' after {attempts} attempts.")
    return None

def main():
    """
    Main function to read questions, get answers, and save them.
    """
    try:
        with open('questions.json', 'r') as f:
            questions = json.load(f)
    except FileNotFoundError:
        logging.error("questions.json not found. Please make sure the file exists.")
        return
    except json.JSONDecodeError:
        logging.error("Error decoding questions.json. Please check if it's a valid JSON.")
        return

    all_quiz_data = {}
    raw_responses = {}

    for q_id, q_text in questions.items():
        logging.info(f"Processing question {q_id}: {q_text}")
        
        response = get_structured_answer(q_text)

        if response and response.choices:
            raw_content = response.choices[0].message.content
            raw_responses[q_id] = {
                "question": q_text,
                "raw_response": raw_content
            }
            try:
                # Attempt to parse the JSON content from the response
                structured_content = json.loads(raw_content)
                all_quiz_data[q_id] = {
                    "question": q_text,
                    **structured_content
                }
            except json.JSONDecodeError:
                logging.error(f"Failed to decode JSON for question {q_id}. Storing raw response only.")
                # Even if JSON parsing fails, we have the raw response saved
                all_quiz_data[q_id] = {
                    "question": q_text,
                    "error": "Failed to parse API response as JSON.",
                    "raw_response": raw_content
                }
        else:
            logging.warning(f"No response received for question {q_id}.")
            raw_responses[q_id] = {
                "question": q_text,
                "raw_response": "No response from API."
            }
            all_quiz_data[q_id] = {
                "question": q_text,
                "error": "No response from API."
            }

    # Save the structured, parsed data
    with open('quiz_data.json', 'w') as f:
        json.dump(all_quiz_data, f, indent=4)
    logging.info("Successfully saved structured quiz data to quiz_data.json")

    # Save the raw, unparsed data for debugging
    with open('raw_responses.json', 'w') as f:
        json.dump(raw_responses, f, indent=4)
    logging.info("Successfully saved raw API responses to raw_responses.json")

if __name__ == "__main__":
    main() 