import io
import os
import sys
import shutil
import uuid
from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from app.models.user import UserCreate, UserResponse
from app.services import user as user_service
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

# Add ML paths to sys.path to dynamically import the ML algorithms
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
ml_base_path = os.path.join(project_root, "ML")
face_path = os.path.join(ml_base_path, "face-detection")
voice_path = os.path.join(ml_base_path, "voice-detection")

if face_path not in sys.path:
    sys.path.append(face_path)
if voice_path not in sys.path:
    sys.path.append(voice_path)

@router.post("/", response_model=UserResponse)
async def create_user_endpoint(user: UserCreate):
    try:
        new_user = await user_service.create_user(user)
        return new_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.models.pagination import PaginatedResponse
from math import ceil

@router.get("/", response_model=PaginatedResponse[UserResponse])
async def get_users_endpoint(page: int = 1, page_size: int = 10):
    try:
        skip = (page - 1) * page_size
        users, total = await user_service.get_users(skip=skip, limit=page_size)
        total_pages = ceil(total / page_size) if page_size > 0 else 0
        return PaginatedResponse(
            data=users,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/register_dynamic/", response_model=UserResponse)
async def register_dynamic(
    name: str = Form(...),
    image: UploadFile = File(...),
    voice: UploadFile = File(...)
):
    try:
        # Dynamically import inside the function to avoid circular/initialization errors
        from ML.detector import get_embedding
        from helper.voice_embedding_convert import voice_to_embedding
        from Database.operations import find_match
        from model.machine_learning.similarity import best_match, print_scores
        from model.machine_learning.config import REGISTER_THRESHOLD

        img_bytes = await image.read()
        voice_bytes = await voice.read()
        
        face_emb, _ = get_embedding(img_bytes)
        if face_emb is None:
            raise HTTPException(status_code=400, detail="No face detected in image.")
            
        import tempfile
        import os
        
        fd, temp_path = tempfile.mkstemp(suffix=".webm")
        with os.fdopen(fd, 'wb') as f:
            f.write(voice_bytes)
            
        try:
            voice_emb_tensor = voice_to_embedding(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
        # Check if already registered
        best_face_name, best_face_score = find_match(face_emb, collection_name="users")
        if best_face_name is not None:
            raise HTTPException(status_code=400, detail=f"User already registered based on face match with {best_face_name}.")
            
        best_voice_score, _, best_voice_name, detailed_scores = best_match(voice_emb_tensor, collection_name="users")
        
        print("\n[DEBUG - REGISTER] Voice Match Scores:")
        print_scores(detailed_scores, best_voice_name)
        
        if best_voice_name is not None and best_voice_score >= REGISTER_THRESHOLD:
            raise HTTPException(status_code=400, detail=f"User already registered based on voice match with {best_voice_name}. Score: {best_voice_score:.4f}")
        
        imageembedding = face_emb.tolist()
        voiceembedding = voice_emb_tensor.squeeze().tolist()
        
        user_data = UserCreate(name=name, imageembedding=imageembedding, voiceembedding=voiceembedding)
        new_user = await user_service.create_user(user_data)
        
        return new_user
        
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict_dynamic/")
async def predict_dynamic(
    image: UploadFile = File(...),
    voice: UploadFile = File(...)
):
    try:
        from ML.detector import get_embedding
        from Database.operations import find_match
        from helper.voice_embedding_convert import voice_to_embedding
        from model.machine_learning.similarity import best_match, print_scores
        from model.machine_learning.config import PREDICT_THRESHOLD

        img_bytes = await image.read()
        voice_bytes = await voice.read()
            
        face_emb, _ = get_embedding(img_bytes)
        if face_emb is None:
            raise HTTPException(status_code=400, detail="No face detected in image.")
            
        import tempfile
        import os
        
        fd, temp_path = tempfile.mkstemp(suffix=".webm")
        with os.fdopen(fd, 'wb') as f:
            f.write(voice_bytes)
            
        try:
            voice_emb_tensor = voice_to_embedding(temp_path)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
        best_face_name, best_face_score = find_match(face_emb, collection_name="users")
        best_voice_score, _, best_voice_name, detailed_scores = best_match(voice_emb_tensor, collection_name="users")
        
        print("\n[DEBUG - PREDICT] Voice Match Scores:")
        print_scores(detailed_scores, best_voice_name)
        
        # Apply threshold to voice
        if best_voice_score < PREDICT_THRESHOLD:
            best_voice_name = None
        
        return {
            "face_match": best_face_name,
            "face_score": float(best_face_score) if best_face_score else 0.0,
            "voice_match": best_voice_name,
            "voice_score": float(best_voice_score) if best_voice_score else 0.0,
            "overall_status": "Success" if (best_face_name and best_face_name == best_voice_name) else "Mismatch or Uncertain"
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from typing import Optional

@router.put("/{user_id}", response_model=UserResponse)
async def update_user_endpoint(
    user_id: str,
    name: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    voice: Optional[UploadFile] = File(None)
):
    try:
        updates = {}
        if name:
            updates["name"] = name
            
        if image:
            from ML.detector import get_embedding
            img_bytes = await image.read()
            face_emb, _ = get_embedding(img_bytes)
            if face_emb is None:
                raise HTTPException(status_code=400, detail="No face detected in the provided image.")
            updates["imageembedding"] = face_emb.tolist()
            
        if voice:
            from helper.voice_embedding_convert import voice_to_embedding
            import tempfile
            import os
            
            voice_bytes = await voice.read()
            fd, temp_path = tempfile.mkstemp(suffix=".webm")
            with os.fdopen(fd, 'wb') as f:
                f.write(voice_bytes)
                
            try:
                voice_emb_tensor = voice_to_embedding(temp_path)
                updates["voiceembedding"] = voice_emb_tensor.squeeze().tolist()
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided.")
            
        updated_user = await user_service.update_user(user_id, updates)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found.")
            
        return updated_user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}")
async def delete_user_endpoint(user_id: str):
    try:
        success = await user_service.delete_user(user_id)
        if not success:
            raise HTTPException(status_code=404, detail="User not found.")
        return {"message": "User deleted successfully", "id": user_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
