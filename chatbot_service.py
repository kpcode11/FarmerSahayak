from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_ollama.llms import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Express backend to communicate

# Initialize the model
model = OllamaLLM(model="llama3.2")

template = """
You are an expert assistant for the Farmer Sahayak platform, helping Indian farmers find and understand government schemes.

Use the following context from the scheme database to answer the user's question.
If you don't know the answer based on the context, say so - don't make up information.
Be conversational, helpful, and provide practical information.

Context:
{context}

Question: {question}

Answer (be concise but complete):
"""

prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

def format_docs(docs):
    """Format retrieved documents into a readable context string."""
    return "\n\n".join([f"Scheme: {doc.page_content}\nMetadata: {doc.metadata}" for doc in docs])

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chatbot queries"""
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({
                'success': False,
                'message': 'Question is required'
            }), 400
        
        # Handle greeting messages
        if question.lower() in ['hi', 'hello', 'hey', 'start', 'help']:
            return jsonify({
                'success': True,
                'data': {
                    'answer': "👋 Hello! I'm your Farmer Scheme Assistant. I can help you find information about government schemes for farmers in India. Ask me about:\n\n• Scheme eligibility\n• Benefits and subsidies\n• Application process\n• Required documents\n• State or Central schemes\n\nWhat would you like to know?",
                    'schemes_found': 0
                }
            })
        
        # Retrieve relevant documents
        retrieved_docs = retriever.invoke(question)
        context = format_docs(retrieved_docs)
        
        # Generate answer using context and question
        result = chain.invoke({"context": context, "question": question})
        
        # Extract scheme slugs for frontend to create links
        schemes = [{'slug': doc.metadata.get('slug'), 'tags': doc.metadata.get('tags')} 
                   for doc in retrieved_docs if doc.metadata.get('slug')]
        
        return jsonify({
            'success': True,
            'data': {
                'answer': result,
                'schemes_found': len(retrieved_docs),
                'related_schemes': schemes[:3]  # Return top 3 schemes
            }
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        # Test if Ollama is responding
        test_response = model.invoke("test")
        return jsonify({
            'success': True,
            'status': 'healthy',
            'ollama': 'connected',
            'vector_store': 'active'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 503

@app.route('/api/suggestions', methods=['GET'])
def suggestions():
    """Get suggested questions"""
    suggested_questions = [
        "What schemes are available for small farmers?",
        "How can I get a subsidy for buying farming equipment?",
        "What are the eligibility criteria for PM-KISAN?",
        "Which schemes provide financial assistance for irrigation?",
        "What documents do I need to apply for agricultural loans?",
        "Are there any schemes for organic farming?",
        "What benefits are available for women farmers?",
        "How do I apply for crop insurance schemes?"
    ]
    
    return jsonify({
        'success': True,
        'data': {
            'suggestions': suggested_questions
        }
    })

if __name__ == '__main__':
    print("Chatbot Service Starting...")
    print("Loading vector store...")
    print("Server ready on http://localhost:5001")
    print("\nMake sure:")
    print("  - Ollama is running (ollama serve)")
    print("  - Model llama3.2 is available")
    print("  - Vector database is initialized")
    app.run(host='0.0.0.0', port=5001, debug=True)
