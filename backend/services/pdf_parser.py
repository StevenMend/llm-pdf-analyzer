"from typing import List
import fitz 

def split_text(text: str, chunk_size=800, chunk_overlap=200) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - chunk_overlap
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
            "total_pages": total_pages,
        }

        for j, chunk_text in enumerate(split_text(text)):
            chunk_metadata = metadata.copy()
            chunk_metadata["chunk_id"] = f"{filename}_chunk_{i}_{j}"
            processed_chunks.append({
                "text": chunk_text,
                "metadata": chunk_metadata
            })

    doc.close()
    print(f"Total chunks generated: {len(processed_chunks)}")
    for c in processed_chunks:
        if len(c["text"].strip()) > 100:
            print("Chunk example", c["text"][:200])
            break

    return processed_chunks"