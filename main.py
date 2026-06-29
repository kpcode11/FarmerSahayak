from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever
import os
from dotenv import load_dotenv

load_dotenv()

try:
    model = ChatGroq(model="llama-3.1-8b-instant", temperature=0)
except Exception as e:
    print(f"Error initializing Groq: {e}")
    model = None

template = """
You are an expert in answering questions about all schemes for farmers in India.

Use the following context from the scheme database to answer the user's question.
If you don't know the answer based on the context, say so - don't make up information.

Context:
{context}

Question: {question}

Answer:
"""
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

def format_docs(docs):
    """Format retrieved documents into a readable context string."""
    return "\n\n".join([f"Scheme: {doc.page_content}" for doc in docs])

while True:
    print("\n\n-------------------------------")
    question = input("Ask your question (q to quit): ")
    print("\n\n")
    if question == "q":
        break
    
    if not retriever or not model:
        print("Error: Database retriever or model is offline.")
        break
        
    # Retrieve relevant documents
    retrieved_docs = retriever.invoke(question)
    context = format_docs(retrieved_docs)
    
    # Generate answer using context and question
    result = chain.invoke({"context": context, "question": question})
    
    if hasattr(result, 'content'):
        answer_text = result.content
    else:
        answer_text = str(result)
        
    print("Answer:", answer_text)
    print("\n[Retrieved", len(retrieved_docs), "relevant schemes]")