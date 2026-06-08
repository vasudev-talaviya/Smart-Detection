from fastapi import APIRouter, HTTPException, Body, File, UploadFile
from typing import Any, Dict, List
import base64
import io

router = APIRouter(tags=["frontend_compat"])

@router.post("/faces/detect")
async def detect_faces(payload: Dict[str, Any] = Body(...)):
    image_data = payload.get("image")
    if not image_data:
        raise HTTPException(status_code=400, detail="No image provided")
        
    try:
        from ML.detector import get_all_embeddings
        from Database.operations import find_match
        
        # Decode base64
        img_str = image_data
        if img_str.startswith("data:image"):
            img_str = img_str.split(",")[1]
            
        img_bytes = base64.b64decode(img_str)
        faces = get_all_embeddings(img_bytes)
        
        print("\n" + "="*70)
        print(" FACE DETECTION REPORT (REGISTRATION) ".center(70, "="))
        print("="*70)
        print(f"| {'Name':<20} | {'Confidence':<12} | {'Bounding Box (x1, y1, x2, y2)':<28} |")
        print("-" * 70)
        
        result_faces = []
        for emb, bbox in faces:
            best_user, best_score = find_match(emb, collection_name="users")
            name = best_user["name"] if best_user else "Unknown"
            confidence = float(best_score) if best_score else 0.0
            
            box_coords = bbox.tolist()
            box_str = f"[{int(box_coords[0])}, {int(box_coords[1])}, {int(box_coords[2])}, {int(box_coords[3])}]"
            
            print(f"| {name:<20} | {confidence*100:>9.2f}%  | {box_str:<28} |")
            
            result_faces.append({
                "is_new_face": best_user is None,
                "name": name,
                "confidence": confidence,
                "bbox": box_coords
            })

        print("="*70 + "\n")
            
        return {"data": {"faces": result_faces}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/attendance/scan")
async def scan_attendance(
    image: UploadFile = File(None),
    voice: UploadFile = File(None)
):
    try:
        from ML.detector import get_all_embeddings
        from Database.operations import find_match
        
        result_faces = []
        if image:
            img_bytes = await image.read()
            faces = get_all_embeddings(img_bytes)
            
            print("\n" + "="*70)
            print(" FACE DETECTION REPORT (SCANNER) ".center(70, "="))
            print("="*70)
            print(f"| {'Name':<20} | {'Confidence':<12} | {'Bounding Box (x1, y1, x2, y2)':<28} |")
            print("-" * 70)
            
            for emb, bbox in faces:
                best_user, best_score = find_match(emb, collection_name="users")
                name = best_user["name"] if best_user else "Unknown"
                confidence = float(best_score) if best_score else 0.0
                
                box_coords = bbox.tolist()
                box_str = f"[{int(box_coords[0])}, {int(box_coords[1])}, {int(box_coords[2])}, {int(box_coords[3])}]"
                
                print(f"| {name:<20} | {confidence*100:>9.2f}%  | {box_str:<28} |")
                
                result_faces.append({
                    "user_id": best_user["id"] if best_user else None,
                    "name": name,
                    "confidence": confidence,
                    "box": box_coords
                })
            print("="*70 + "\n")
                
        voice_result = None
        if voice:
            voice_bytes = await voice.read()
            from helper.voice_embedding_convert import voice_to_embedding
            from model.machine_learning.similarity import best_match, print_scores
            from model.machine_learning.config import PREDICT_THRESHOLD
            import tempfile
            import os
            
            # Write bytes to a temporary file so librosa/soundfile can read the WebM format
            fd, temp_path = tempfile.mkstemp(suffix=".webm")
            with os.fdopen(fd, 'wb') as f:
                f.write(voice_bytes)
                
            try:
                voice_emb_tensor = voice_to_embedding(temp_path, min_duration=3.0)
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
            best_voice_score, best_voice_id, best_voice_name, detailed_scores = best_match(voice_emb_tensor, collection_name="users")
            
            print("\n[DEBUG - SCANNER] Voice Match Scores:")
            print_scores(detailed_scores, best_voice_name)
            
            if best_voice_score < PREDICT_THRESHOLD:
                print(f"[DEBUG - SCANNER] Note: Best match '{best_voice_name}' is below threshold ({best_voice_score} < {PREDICT_THRESHOLD})")
                
            voice_result = {
                "user_id": best_voice_id,
                "name": best_voice_name,
                "confidence": float(best_voice_score) if best_voice_score else 0.0
            }
            
        return {"data": {"faces": result_faces, "voice_match": voice_result}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/attendance")
async def submit_attendance(payload: Dict[str, Any] = Body(...)):
    # Mock submit attendance to return success
    return {"message": "Attendance submitted successfully!", "data": payload}
