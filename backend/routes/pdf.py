
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_parser import parse_pdf_and_chunk
from services.vector_store import create_vectorstore_from_chunks

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="The file must be a PDF")

    try:
        pdf_bytes = await file.read()
        filename = file.filename
        pdf_id = filename

        chunks = parse_pdf_and_chunk(pdf_bytes, filename)

        
        create_vectorstore_from_chunks(pdf_id, chunks)

        return {
            "message": "PDF loaded and ready",
            "pdf_id": pdf_id,
            "total_chunks": len(chunks)
        }

    except Exception as e:
        print(f"Error processing PDF: {str(e)}") 
        raise HTTPException(status_code=500, detail=str(e))