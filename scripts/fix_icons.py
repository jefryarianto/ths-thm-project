"""
Fix mobile app icons by adding proper padding for Android adaptive icon.
- icon.png: 1024x1024, logo centered with ~20% padding on all sides (for app stores)
- adaptive-icon.png: 1024x1024, logo centered with ~33% padding (safe zone for Android adaptive)
"""
from PIL import Image
import os

SOURCE = "docs/AppIcons/playstore.png"   # 512px original
OUT_ICON = "apps/mobile/assets/icon.png"
OUT_ADAPTIVE = "apps/mobile/assets/adaptive-icon.png"

# Canvas size
SIZE = 1024

# Open source logo
logo = Image.open(SOURCE).convert("RGBA")
orig_w, orig_h = logo.size
print(f"Source size: {orig_w}x{orig_h}")

# ── icon.png ──────────────────────────────────────────────
# Logo fills ~72% of canvas (padding ~14% each side)
icon_logo_size = int(SIZE * 0.72)
ratio = min(icon_logo_size / orig_w, icon_logo_size / orig_h)
new_w = int(orig_w * ratio)
new_h = int(orig_h * ratio)
logo_resized = logo.resize((new_w, new_h), Image.LANCZOS)

canvas = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
x = (SIZE - new_w) // 2
y = (SIZE - new_h) // 2
canvas.paste(logo_resized, (x, y), logo_resized)
canvas.save(OUT_ICON, "PNG")
print(f"Saved {OUT_ICON} ({SIZE}x{SIZE}, logo {new_w}x{new_h})")

# ── adaptive-icon.png ─────────────────────────────────────
# Logo fills ~60% of canvas (padding ~20% each side = safe zone)
adaptive_logo_size = int(SIZE * 0.60)
ratio = min(adaptive_logo_size / orig_w, adaptive_logo_size / orig_h)
new_w = int(orig_w * ratio)
new_h = int(orig_h * ratio)
logo_resized = logo.resize((new_w, new_h), Image.LANCZOS)

canvas = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
x = (SIZE - new_w) // 2
y = (SIZE - new_h) // 2
canvas.paste(logo_resized, (x, y), logo_resized)
canvas.save(OUT_ADAPTIVE, "PNG")
print(f"Saved {OUT_ADAPTIVE} ({SIZE}x{SIZE}, logo {new_w}x{new_h})")

print("Done!")
