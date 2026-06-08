import numpy as np
from Database.config import db
from ML.similarity import predict_with_cosine

THRESHOLD = 0.40  # Cosine similarity threshold

def _get_all_records(collection_name: str):
    records = list(db[collection_name].find({}))
    if not records:
        return [], []
    db_embeddings = [np.array(r["imageembedding"]) for r in records]
    user_info_list = [{"id": str(r["_id"]), "name": r.get("name", "Unknown")} for r in records]
    return db_embeddings, user_info_list

def find_match(embedding, collection_name: str = "users"):
    """
    Finds the closest match using Cosine Similarity against all known faces.
    """
    db_embeddings, user_info_list = _get_all_records(collection_name)
    
    if not db_embeddings:
        return None, 0.0
        
    best_user, best_score = predict_with_cosine(embedding, db_embeddings, user_info_list)
    
    if best_score >= THRESHOLD:
        return best_user, best_score
    return None, best_score

def save_face(name, embedding, collection_name: str = "users"):
    """
    Saves a new face embedding to the database.
    """
    db[collection_name].insert_one({"name": name, "imageembedding": embedding.tolist()})
