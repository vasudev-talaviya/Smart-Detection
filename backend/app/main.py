from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import user, frontend_compat

import sys
import os

# Add ML paths to sys.path to dynamically import the ML algorithms
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ML/face-detection")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ML/voice-detection")))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    
    print("Loading ML models into memory...")
    try:
        from ML.detector import get_embedding, get_all_embeddings
        from helper.voice_embedding_convert import voice_to_embedding
        print("ML models loaded successfully.")
    except Exception as e:
        print(f"Failed to load ML models: {e}")
        
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(title="SmartAI Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(frontend_compat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SmartAI API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running smoothly"}
