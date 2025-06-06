from typing import List
from sentence_transformers import SentenceTransformer
import fitz  
import numpy as np
import faiss
from utils.memory import vectorstores

from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def split_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks


def parse_pdf_and_chunk(pdf_bytes: bytes, filename: str) -> List[dict]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    processed_chunks = []

    total_pages = doc.page_count 

    for i, page in enumerate(doc):
        text = page.get_text("text")
        if not text.strip():
            continue

        metadata = {
            "filename": filename,
            "source": filename,
            "page_number": i + 1,
            "total_pages": total_pages 
        }

        for j, chunk_text in enumerate(split_text(text)):
            chunk_metadata = metadata.copy()
            chunk_metadata["chunk_id"] = f"{filename}_chunk_{i}_{j}"
            processed_chunks.append({
                "text": chunk_text,
                "metadata": chunk_metadata
            })

    doc.close()
    return processed_chunks

def create_vectorstore_from_chunks(pdf_id: str, chunks: List[dict]):
    texts = [chunk["text"] for chunk in chunks]
    metadata = [chunk["metadata"] for chunk in chunks]

    
    batch_size = 50
    embeddings = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=batch
        )
        batch_embeddings = [e.embedding for e in response.data]
        embeddings.extend(batch_embeddings)

    embeddings = np.array(embeddings).astype("float32")
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    vectorstores[pdf_id] = {
        "index": index,
        "metadata": metadata,
        "texts": texts
    }

    print(f"📦 FAISS index created and saved in memory for PDF ID: {pdf_id}")
    print(f"🔢 Total indexed texts: {len(texts)} - Embeddings: {len(embeddings)}")




