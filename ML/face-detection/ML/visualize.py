import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image

def show_results(image_path, detections):
    """
    Displays an image with multiple bounding boxes and names using matplotlib.
    detections: A list of tuples (bbox, name)
    """
    try:
        img = Image.open(image_path)
        fig, ax = plt.subplots(1)
        ax.imshow(img)
        
        for bbox, name in detections:
            # bbox is [left, top, right, bottom]
            left, top, right, bottom = bbox
            width = right - left
            height = bottom - top
            
            # Create a Rectangle patch
            rect = patches.Rectangle((left, top), width, height, linewidth=2, edgecolor='g', facecolor='none')
            
            # Add the patch to the Axes
            ax.add_patch(rect)
            plt.text(left, top - 10, name, color='green', fontsize=12, weight='bold', bbox=dict(facecolor='white', alpha=0.7, edgecolor='none'))
            
        plt.axis('off')
        plt.show(block=True)
    except Exception as e:
        print(f"Could not display image: {e}")

# Keeping for backward compatibility temporarily if needed
def show_result(image_path, bbox, name):
    show_results(image_path, [(bbox, name)])
