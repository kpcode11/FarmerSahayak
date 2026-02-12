from langchain_chroma import Chroma
from langchain_core.documents import Document
import os
import pandas as pd
import time

print("[vector.py] Starting initialization...")
start_time = time.time()

# Use HuggingFace embeddings in production (free, no GPU), Ollama locally
if os.environ.get("GROQ_API_KEY"):
    from langchain_huggingface import HuggingFaceEmbeddings
    print("[vector.py] Loading HuggingFace embeddings model...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    print(f"[vector.py] Embeddings loaded in {time.time() - start_time:.1f}s")
else:
    from langchain_ollama import OllamaEmbeddings
    embeddings = OllamaEmbeddings(model="mxbai-embed-large")
    print("Using Ollama embeddings (local)")

db_location = "./chrome_langchain_db"
add_documents = not os.path.exists(db_location) or not os.path.exists(os.path.join(db_location, "chroma.sqlite3"))

df = pd.read_csv("updated_data.csv")

if add_documents:
    documents = []
    ids = []
    
    for i, row in df.iterrows():
        document = Document(
            page_content=f"Name: {row['scheme_name']}. Details: {row['details']}. Benefits: {row['benefits']}. Eligibility: {row['eligibility']}. Application: {row['application']}. Documents: {row['documents']}. Level: {row['level']}. Category: {row['schemeCategory']}.",
            metadata={"slug": row["slug"], "tags": row["tags"]},
            id=str(i)
        )
        ids.append(str(i))
        documents.append(document)
        

vector_store = Chroma(
    collection_name="schemesInfo",
    persist_directory=db_location,
    embedding_function=embeddings
)

if add_documents:
    print(f"[vector.py] Embedding {len(df)} documents into ChromaDB (first run only)...")
    vector_store.add_documents(documents=documents, ids=ids)
    print(f"[vector.py] Documents embedded in {time.time() - start_time:.1f}s")
    
retriever = vector_store.as_retriever(
    search_kwargs={"k": 5}
)
print(f"[vector.py] Initialization complete in {time.time() - start_time:.1f}s")