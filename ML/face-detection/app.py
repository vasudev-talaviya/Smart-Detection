from ML.detector import get_embedding, get_all_embeddings
from ML.visualize import show_result, show_results
from Database.operations import find_match, save_face

def register_user(image_path, name):
    try:
        all_faces = get_all_embeddings(image_path)
    except ValueError as e:
        print(f"Error: {e}")
        return False

    if not all_faces:
        print("No face detected in the image.")
        return False
        
    if len(all_faces) > 1:
        print(f"WARNING: {len(all_faces)} faces detected. Only the largest face will be registered as '{name}'.")
        
    emb, bbox = all_faces[0]
    match_name, score = find_match(emb)
    
    results = []
    
    if match_name:
        print(f"WARNING: Face already exists in database with name '{match_name}' (Probability: {score:.2f})")
        results.append((bbox, f"Already Registered: {match_name}"))
        success = False
    else:
        save_face(name, emb)
        print(f"Successfully registered '{name}'.")
        results.append((bbox, f"Registered: {name}"))
        success = True
        
    # Append the other faces so they are also displayed
    for other_emb, other_bbox in all_faces[1:]:
        results.append((other_bbox, "Ignored"))
        
    show_results(image_path, results)
    return success

def predict_user(image_path):
    try:
        all_faces = get_all_embeddings(image_path)
    except ValueError as e:
        print(f"Error: {e}")
        return None

    if not all_faces:
        print("No face detected in the image.")
        return None
        
    print(f"Found {len(all_faces)} face(s) in the image.")
    
    results = []
    
    for emb, bbox in all_faces:
        match_name, score = find_match(emb)
        if match_name:
            label = f"{match_name} ({score:.2f})"
            print(f"Match found: {match_name} (Probability: {score:.2f})")
            results.append((bbox, label))
        else:
            print("No match found for a face.")
            results.append((bbox, "Unknown"))
            
    show_results(image_path, results)
    return results
