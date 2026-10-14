"""Generate homepage screenshot crops; leave documentation originals intact."""
import json
from pathlib import Path
from PIL import Image, ImageChops

root = Path(__file__).resolve().parents[2]
output = root / "site/public/homepage/examples"
output.mkdir(parents=True, exist_ok=True)
records = {}
for key, source in [("network", "relationship"), ("hierarchy", "org-chart"), ("mindmap", "mindmap"), ("fishbone", "fishbone")]:
    image = Image.open(root / f"site/public/examples/{source}.png").convert("RGB")
    difference = ImageChops.difference(image, Image.new("RGB", image.size, image.getpixel((0, 0))))
    red, green, blue = difference.split()
    mask = ImageChops.lighter(ImageChops.lighter(red, green), blue).point(lambda value: 255 if value > 12 else 0)
    bounds = mask.getbbox()
    if not bounds:
        raise ValueError(f"Empty screenshot: {source}")
    left, top, right, bottom = bounds
    crop = (max(0, left - 32), max(0, top - 32), min(image.width, right + 32), min(image.height, bottom + 32))
    result = image.crop(crop)
    result.save(output / f"{key}.png", optimize=True)
    records[key] = {"source": f"/examples/{source}.png", "crop": list(crop), "width": result.width, "height": result.height}
    print(f"{key}: {image.size} -> {result.size}, bounds {crop}")
(output / "crop-records.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
