from insightface.app import FaceAnalysis
import cv2

app = FaceAnalysis(name='buffalo_l')
app.prepare(ctx_id=0, det_size=(640,640))

import numpy as np

def get_all_embeddings(img_input):
    """
    Returns a list of tuples: (embedding, bbox) for all faces detected in the image.
    Sorted by largest face first.
    img_input can be a filepath (str) or raw image bytes (bytes).
    """
    if isinstance(img_input, bytes):
        nparr = np.frombuffer(img_input, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Unable to read image from bytes")
    else:
        img = cv2.imread(img_input)
        if img is None:
            raise ValueError(f"Image not found or unable to read: {img_input}")
        
    faces = app.get(img)
    if not faces:
        return []
        
    # Sort faces by bounding box area (largest first)
    faces = sorted(faces, key=lambda x: (x.bbox[2] - x.bbox[0]) * (x.bbox[3] - x.bbox[1]), reverse=True)
    
    results = [(face.embedding, face.bbox) for face in faces]
    return results

def get_embedding(img_path):
    """
    Returns the embedding and bbox for only the largest face.
    """
    results = get_all_embeddings(img_path)
    if not results:
        return None, None
    return results[0][0], results[0][1]