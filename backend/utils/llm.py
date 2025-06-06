
from utils.memory import vectorstores
from openai import AsyncOpenAI
from typing import AsyncIterator
import os
from dotenv import load_dotenv
import numpy as np
import tiktoken
load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def retrieve_context_from_vectorstore(pdf_id: str, question: str, k=5):
    store = vectorstores.get(pdf_id)
    if not store:
        return {"context": "", "metadata": []}

    index = store["index"]
    texts = store["texts"]
    metadata = store["metadata"]

    response = await client.embeddings.create(
        model="text-embedding-ada-002", input=[question]
    )
    embedding = response.data[0].embedding

    D, I = index.search(np.array([embedding], dtype=np.float32), k)
    context_chunks = [texts[i] for i in I[0]]
    context_metadata = [metadata[i] for i in I[0]]

    return {
        "context": "\n\n".join(context_chunks),
        "metadata": context_metadata
    }

async def stream_openai_response(question: str, pdf_id: str, conversation_id: str) -> AsyncIterator[str]:
    result = await retrieve_context_from_vectorstore(pdf_id, question)
    context = result["context"]
    metadata = result["metadata"]

    enc = tiktoken.encoding_for_model("gpt-3.5-turbo")
    context_tokens = len(enc.encode(context))
    print(f"🔢 Tokens in context: {context_tokens}")

    
    total_pages_set = {meta.get("total_pages") for meta in metadata if "total_pages" in meta}
    total_pages = total_pages_set.pop() if len(total_pages_set) == 1 else "unknown"

    system_prompt = (
        f"You are an expert assistant that answers questions about the following PDF document, "
        f"which has {total_pages} pages.\n\n"
        f"{context}\n\n"
        "Answer precisely and cite information if relevant."
    )

    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ],
        stream=True,
        temperature=0.3,
        max_tokens=500,
    )
    accumulated = "" 

    async for chunk in response:
        delta = chunk.choices[0].delta.content
        if delta:
            accumulated += delta 
            print("🔹 Delta:", repr(delta))
            yield delta
    total_tokens = len(enc.encode(accumulated)) 
    print(f"Tokens used in response: {total_tokens}")
    prompt_tokens = context_tokens  #RAG context tokens (input)
    completion_tokens = len(enc.encode(accumulated))  # response tokens (output)

    input_cost = (prompt_tokens / 1000) * 0.0005
    output_cost = (completion_tokens / 1000) * 0.0015
    total_cost = input_cost + output_cost

    print(f"💸 Costo estimado:")
    print(f"    - Input (context): ${input_cost:.6f}")
    print(f"    - Output (asnwer): ${output_cost:.6f}")
    print(f"    - Total: ${total_cost:.6f}")





