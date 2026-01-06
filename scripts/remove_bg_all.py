from rembg import remove
from PIL import Image
import os
import glob

# Input directory
TEAM_DIR = 'client/public/team'

# Pattern for images
extensions = ['*.jpg', '*.jpeg', '*.JPG', '*.JPEG']
files = []
for ext in extensions:
    files.extend(glob.glob(os.path.join(TEAM_DIR, ext)))

print(f"Found {len(files)} images to process in {TEAM_DIR}...")

for file_path in files:
    try:
        print(f"Processing {file_path}...")
        
        # Determine output path (same name, .png extension)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        output_path = os.path.join(TEAM_DIR, f"{base_name}.png")
        
        if os.path.exists(output_path):
             print(f"Skipping {output_path} (already exists)")
             # continue # Uncomment to skip if needed, but for now we might want to overwrite if re-running

        input_image = Image.open(file_path)
        
        # Remove background called 'nano banapro' style (just kidding, it's just rembg)
        output_image = remove(input_image)
        
        # Save
        output_image.save(output_path)
        print(f"Saved {output_path}")
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

print("Background removal complete.")
