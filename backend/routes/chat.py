from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from utils.llm import stream_openai_response
import json

router = APIRouter()

@router.post("")
async def chat(request: Request):
    body = await request.json()
    message = body.get("message", "")
    conversation_id = body.get("conversation_id", "default")
    pdf_id = body.get("pdf_id", "default")

    async def event_stream():
        async for chunk in stream_openai_response(message, pdf_id, conversation_id):
            payload = json.dumps({"type": "content", "content": chunk})
            yield f"data: {payload}\n\n"
        yield 'data: {"type": "done"}\n\n'

    return StreamingResponse(event_stream(), media_type="text/event-stream")