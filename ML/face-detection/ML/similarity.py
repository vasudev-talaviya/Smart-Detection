import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def predict_with_cosine(target_embedding, db_embeddings, user_info_list):
    """
    Predicts the matching face using direct Cosine Similarity.
    This creates strict "bubbles" around known faces instead of slicing the universe,
    which makes it vastly superior for open-set face recognition.
    """
    if not db_embeddings:
        return None, 0.0

    # Compute similarities
    similarities = cosine_similarity([target_embedding], db_embeddings)[0]
    
    # Get the highest similarity score
    best_match_idx = np.argmax(similarities)
    best_score = similarities[best_match_idx]
    best_user = user_info_list[best_match_idx]
    
    return best_user, best_score
