import os
import time
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_huggingface import HuggingFaceEmbeddings

print("[vector.py] Starting initialization...")
start_time = time.time()

# Load environment variables if not already loaded by the main app
load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not MONGO_URI or not GOOGLE_API_KEY:
    print("[vector.py] WARNING: MONGODB_URI or GOOGLE_API_KEY is not set. Retriever will not function.")

# Initialize HuggingFace Embeddings
print("[vector.py] Loading HuggingFace embeddings model...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
print(f"[vector.py] Embeddings loaded in {time.time() - start_time:.1f}s")

# Connect to MongoDB
print("[vector.py] Connecting to MongoDB...")
try:
    client = MongoClient(MONGO_URI)
    collection = client["farmers"]["schemes_vectors"]
    
    # Initialize MongoDB Atlas Vector Search
    vector_store = MongoDBAtlasVectorSearch(
        collection=collection,
        embedding=embeddings,
        index_name="vector_index"
    )
    
    # Create retriever
    retriever = vector_store.as_retriever(
        search_kwargs={"k": 5}
    )
    print(f"[vector.py] Initialization complete in {time.time() - start_time:.1f}s")
except Exception as e:
    print(f"[vector.py] ERROR connecting to MongoDB: {e}")
    # Provide a dummy retriever so the app doesn't crash on import, but will fail gracefully when used
    retriever = None