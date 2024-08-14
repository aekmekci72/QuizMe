from flask import Flask, request, jsonify
from flask_cors import CORS
from huggingface_hub import login
from langchain_community.llms import HuggingFaceEndpoint
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
import re 

load_dotenv()

app = Flask(__name__)
CORS(app)  
visit_counter = 0

hf_token = os.getenv('HUGGINGFACE_API_TOKEN')
if not hf_token:
    raise ValueError("HUGGINGFACE_API_TOKEN not set in environment variables")

login(token=hf_token)

list_llm = [
    "mistralai/Mistral-7B-Instruct-v0.2"
]
default_llm_index = 0

llm_model = list_llm[default_llm_index]
llm = HuggingFaceEndpoint(
    repo_id=llm_model,
    temperature=0.5,  
    max_new_tokens=5000,  
    top_k=20
)


async def parse_questions_and_answers(response):
    questions = re.findall(r'Question\s*\d+:\s*(.*?)(?=Question\s*\d+:|$)', response, re.DOTALL)
    
    questions = [q.strip() for q in questions]
    
    if(len(questions)==0):
        questions = re.findall(r'\d+\.\s*(.*?)(?=\d+\.\s*|$)', response, re.DOTALL)
        
        questions = [q.strip() for q in questions]
        
    if(len(questions)==0):
        questions = re.findall(r'Question:\s*(.*?)(?=Question:|$)', response, re.DOTALL)
    
        questions = [q.strip() for q in questions]
        
    for i, question in enumerate(questions):
        if "Answer" in question:
            questions[i] = question.split("Answer")[0].strip()
    for i, question in enumerate(questions):
        if "Question:" in question:
            questions[i] = question.split("Question:")[0].strip()
    


    return questions

async def generate_qs(text, num_flashcards=10):
    prompt = f"""
    Generate {num_flashcards} questions based on the following notes. These questions should be designed to test a user's understanding of the content before a test. The questions should range from conceptual questions to more specific, detailed questions. Ensure the questions cover all key topics and concepts mentioned in the notes. Return the questions in a format where each question is prefixed with 'Question:' for easy parsing. Please ensure this standard format. Do not return answers to the questions.

    Notes:
    {text}
    """
    
    response = llm(prompt)
    
    qs = await parse_questions_and_answers(response)
    return qs

@app.route('/get_questions', methods=['POST'])
async def get_questions():
    data = request.json
    notes = data.get('notes', '')  
    num = data.get('numQuestions', 10)  

    qs = await generate_qs(notes, int(num))

    return jsonify(qs)


async def generate_feedback(notes, question, user_answer):
    prompt = f"""
    Based on the following notes, evaluate the my answer to the question. Determine if the answer is correct, if it includes all necessary information, or if any part is incorrect or missing. Provide detailed feedback on the accuracy and completeness of the answer. 

    Notes:
    {notes}

    Question:
    {question}

    My Answer:
    {user_answer}

    Feedback:
    """
    
    response = llm(prompt)
        
    return response

@app.route('/get_feedback', methods=['POST'])
async def get_feedback():
    data = request.json
    notes = data.get('notes', '')  
    question = data.get('question', '')  
    answer = data.get('userAnswer', '')

    feedback = await generate_feedback(notes,question,answer)

    return jsonify(feedback)

@app.route('/increment_counter', methods=['GET'])
async def increment_counter():
    global visit_counter
    visit_counter += 1  
    return jsonify(visit_count=visit_counter)  


if __name__ == '__main__':
    app.run(debug=True)