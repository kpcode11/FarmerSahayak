from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from vector import retriever

app = Flask(__name__)

# Initialize the model
try:
    model = ChatGroq(model="llama-3.1-8b-instant", temperature=0)
except Exception as e:
    print(f"Error initializing Groq: {e}")
    model = None

template = """
You are an expert in answering questions about all schemes for farmers in India.

Use the following context from the scheme database to answer the user's question.
If you don't know the answer based on the context, say so - don't make up information.
Keep your response concise and clear for WhatsApp messaging.

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

@app.route('/whatsapp', methods=['POST'])
def whatsapp_webhook():
    """Handle incoming WhatsApp messages"""
    # Get the message from WhatsApp
    incoming_msg = request.values.get('Body', '').strip()
    sender = request.values.get('From', '')
    
    print(f"Received message from {sender}: {incoming_msg}")
    
    # Create response object
    resp = MessagingResponse()
    msg = resp.message()
    
    try:
        if incoming_msg.lower() in ['hi', 'hello', 'start']:
            msg.body("Hello! I'm your Indian Farmer Schemes Assistant. Ask me anything about farmer schemes in India!")
        elif incoming_msg.lower() in ['help']:
            msg.body("I can help you with:\n\n Information about farmer schemes\n Eligibility criteria\n Benefits and application process\n Required documents\n\nJust ask your question!")
        else:
            if not retriever or not model:
                msg.body("Sorry, the chatbot service is currently offline.")
            else:
                # Retrieve relevant documents
                retrieved_docs = retriever.invoke(incoming_msg)
                context = format_docs(retrieved_docs)
                
                # Generate answer using context and question
                result = chain.invoke({"context": context, "question": incoming_msg})
                
                # Send the response
                # Depending on what the model returns, we might need result.content
                # ChatGoogleGenerativeAI returns an AIMessage, so we need .content
                # Wait, chain.invoke directly into model will return an AIMessage object.
                # Let's ensure it's a string.
                if hasattr(result, 'content'):
                    response_text = result.content
                else:
                    response_text = str(result)
                msg.body(response_text)
            
    except Exception as e:
        print(f"Error: {str(e)}")
        msg.body("Sorry, I encountered an error processing your request. Please try again.")
    
    return str(resp)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "WhatsApp Farmer Schemes Bot"}

if __name__ == '__main__':
    print(" WhatsApp Bot Server Starting...")
    print("Make sure Groq API key and MongoDB URI are set in .env!")
    app.run(host='0.0.0.0', port=5000, debug=True)
