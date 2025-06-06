from fastapi import FastAPI
from routes import pdf, chat, health 
app = FastAPI()


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





app.include_router(pdf.router, prefix="/api/pdf", tags=["PDF"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(health.router, tags=["Health"])

