import os
from PIL import Image

INPUT_DIR = "images"   
OUTPUT_DIR = "thumbnails"       
THUMB_SIZE = (300, 300)         
QUALITY = 75                    

os.makedirs(OUTPUT_DIR, exist_ok=True)

supported_formats = ('.jpg', '.jpeg', '.png', '.webp')

for filename in os.listdir(INPUT_DIR):
    if not filename.lower().endswith(supported_formats):
        continue

    input_path = os.path.join(INPUT_DIR, filename)
    name, ext = os.path.splitext(filename)
    output_path = os.path.join(OUTPUT_DIR, f"{name}_thumb.jpg")  

    try:
        with Image.open(input_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')

            img.thumbnail(THUMB_SIZE, Image.Resampling.LANCZOS)
            img.save(output_path, 'JPEG', quality=QUALITY, optimize=True)
            print(f"Создана миниатюра: {output_path}")
    except Exception as e:
        print(f"Ошибка с {filename}: {e}")

print("Готово!")