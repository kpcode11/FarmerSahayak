import os
import time
import pandas as pd
from dotenv import load_dotenv
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from pymongo import MongoClient

def main():
    print("Loading environment variables...")
    load_dotenv()
    
    MONGO_URI = os.getenv("MONGODB_URI")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    
    if not MONGO_URI or not GOOGLE_API_KEY:
        print("Error: MONGODB_URI and GOOGLE_API_KEY must be set in .env")
        return
        
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    collection = client["farmers"]["schemes_vectors"]
    
    print("Initializing HuggingFace Embeddings (runs locally, no API limits!)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    print("Loading CSV data...")
    try:
        df = pd.read_csv("updated_data.csv")
    except FileNotFoundError:
        print("Error: updated_data.csv not found. Are you in the right directory?")
        return
        
    documents = []
    
    print(f"Preparing {len(df)} records for vectorization...")
    for i, row in df.iterrows():
        # Clean null values
        def clean_val(val):
            return str(val) if pd.notna(val) else ""
            
        page_content = (
            f"Name: {clean_val(row.get('scheme_name'))}. "
            f"Details: {clean_val(row.get('details'))}. "
            f"Benefits: {clean_val(row.get('benefits'))}. "
            f"Eligibility: {clean_val(row.get('eligibility'))}. "
            f"Application: {clean_val(row.get('application'))}. "
            f"Documents: {clean_val(row.get('documents'))}. "
            f"Level: {clean_val(row.get('level'))}. "
            f"Category: {clean_val(row.get('schemeCategory'))}."
        )
        
        doc = Document(
            page_content=page_content,
            metadata={
                "slug": clean_val(row.get("slug")),
                "tags": clean_val(row.get("tags")),
                "scheme_id": str(i)
            }
        )
        documents.append(doc)
        
    print(f"Prepared {len(documents)} documents.")
    print("Uploading to MongoDB Atlas Vector Search...")
    print("Note: Depending on your Gemini API tier, this might take a while due to rate limits.")
    
    # Upload everything in one go since HuggingFace is local and MongoDB Atlas handles large inserts well
    MongoDBAtlasVectorSearch.from_documents(
        documents=documents,
        embedding=embeddings,
        collection=collection,
        index_name="vector_index"
    )
        
    print("\n✅ Successfully migrated embeddings to MongoDB!")
    print("--------------------------------------------------")
    print("IMPORTANT: You MUST create a Vector Search Index in the MongoDB Atlas UI.")
    print("1. Go to Atlas -> Search -> Create Search Index -> Atlas Vector Search -> JSON Editor")
    print("2. Target the 'farmers.schemes_vectors' collection.")
    print("3. Use the following JSON configuration:")
    print('''
{
  "fields": [
    {
      "numDimensions": 384,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
    ''')
    print("Name the index 'vector_index'. It may take a few minutes to build.")

if __name__ == "__main__":
    main()
