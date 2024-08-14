from huggingface_hub import login
from langchain_community.llms import HuggingFaceEndpoint
from bs4 import BeautifulSoup

login(token="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")

list_llm = [
    "mistralai/Mistral-7B-Instruct-v0.2",
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "mistralai/Mistral-7B-Instruct-v0.1",
    "google/gemma-7b-it",
    "google/gemma-2b-it",
    "HuggingFaceH4/zephyr-7b-beta",
    "HuggingFaceH4/zephyr-7b-gemma-v0.1",
    "meta-llama/Llama-2-7b-chat-hf",
    "microsoft/phi-2",
    "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    "mosaicml/mpt-7b-instruct",
    "tiiuae/falcon-7b-instruct",
    "google/flan-t5-xxl"
]
default_llm_index = 0

llm_model = list_llm[default_llm_index]
llm = HuggingFaceEndpoint(
    repo_id=llm_model,
    temperature=0.5,  
    max_new_tokens=5000,  
    top_k=20
)

def parse_questions_and_answers(response):
    qna_pairs = []
    questions = response.split("Question:")
    
    for question_block in questions[1:]:
        question_text = question_block.split("Answer:")[0].strip()
        
        answer_text = question_block.split("Answer:")[1].strip()
        
        qna_pairs.append([question_text, answer_text])
    
    if(len(qna_pairs)==0):
        questions = response.split("Question ")

        for question_block in questions[1:]:
            question_text = question_block.split("Answer:")[0].strip()
            
            answer_text = question_block.split("Answer:")[1].strip()
            
            qna_pairs.append([question_text, answer_text])
    if(len(qna_pairs)==0):
        lines = response.splitlines()
    
        question_text = ""
        answer_text = ""
        
        for line in lines:
            if line.strip().startswith(tuple(str(i) + '.' for i in range(1, 100))):
                if question_text and answer_text:
                    qna_pairs.append([question_text, answer_text.strip()])
                    answer_text = ""
                question_text = line.split('.', 1)[1].strip()
            elif line.strip().startswith("Answer:"):
                answer_text = line.split("Answer:", 1)[1].strip()
            else:
                answer_text += " " + line.strip()
        
        if question_text and answer_text:
            qna_pairs.append([question_text, answer_text.strip()])
    
    for qa_pair in qna_pairs:
        answer = qa_pair[1]
        cleaned_answer = answer.strip()
        cleaned_answer = cleaned_answer.split('\n\n')[0].strip()
        qa_pair[1]=cleaned_answer
    return qna_pairs

def generate_qs(text, num_flashcards=10):
    prompt = f"""
    Generate {num_flashcards} questions based on the following notes. These questions should be designed to test a user's understanding of the content before a test. The questions should range from conceptual questions to more specific, detailed questions. Ensure the questions cover all key topics and concepts mentioned in the notes. Return the questions in a format where each question is prefixed with 'Question:' and the corresponding answer is prefixed with 'Answer:'

    Notes:
    {text}
    """
    
    response = llm(prompt)
    
    print("Raw response:", response)

    qna_pairs = parse_questions_and_answers(response)
    return qna_pairs

    

def main():
    user_notes = """
    Machine learning is a method of data analysis that automates analytical model building. 
    It is a branch of artificial intelligence based on the idea that systems can learn from data, 
    identify patterns, and make decisions with minimal human intervention.
    """

    qna_pairs = generate_qs(user_notes)
    print("Parsed Q&A Pairs:", qna_pairs)
if __name__ == '__main__':
    main()