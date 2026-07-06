#!/usr/bin/env python3
"""Resize logo.png into Android launcher icons for all mipmap densities."""

from PIL import Image
import os

# Source logo path
LOGO_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logo.png")

# Output base directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "android", "app", "src", "main", "res")

# Density sizes (px) for launcher icons
DENSITIES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

ADAPTIVE_SIZE = 108
PLAY_STORE_SIZE = 512


def resize_icon(size, output_path, scale_factor=0.75):
    """Resize logo.png to the given size with padding (zoom out) and save.
    
    Scale the logo to scale_factor of the target size, then center it on
    a transparent background to prevent cropping by adaptive icon masks.
    """
    img = Image.open(LOGO_PATH)
    logo_size = int(size * scale_factor)
    img_resized = img.resize((logo_size, logo_size), Image.LANCZOS)
    
    # Create transparent background and paste centered
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - logo_size) // 2
    y = (size - logo_size) // 2
    canvas.paste(img_resized, (x, y), img_resized)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path, "PNG")
    print(f"  Saved: {output_path} ({size}x{size}, logo at {scale_factor*100:.0f}%)")


def resize_icon_with_bg(size, output_path, bg_color=(10, 10, 10, 255), scale_factor=0.75):
    """Resize logo.png with padding and a solid background color."""
    img = Image.open(LOGO_PATH)
    logo_size = int(size * scale_factor)
    img_resized = img.resize((logo_size, logo_size), Image.LANCZOS)
    
    # Create solid background and paste centered
    canvas = Image.new("RGBA", (size, size), bg_color)
    x = (size - logo_size) // 2
    y = (size - logo_size) // 2
    canvas.paste(img_resized, (x, y), img_resized)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    canvas.save(output_path, "PNG")
    print(f"  Saved: {output_path} ({size}x{size}, logo at {scale_factor*100:.0f}%)")



def main():
    print("=== Generating Android Icons from logo.png ===\n")

    # Constants for scaling
    ADAPTIVE_SCALE = 0.62  # Keep within the 66dp safe zone of 108dp canvas
    LAUNCHER_SCALE = 0.75  # Legacy launcher icons with some padding
    PLAY_STORE_SCALE = 0.75

    # 1. Density-specific launcher icons (ic_launcher / ic_launcher_round)
    print("1. Launcher icons (ic_launcher / ic_launcher_round):")
    for density, px in DENSITIES.items():
        path_fg = os.path.join(OUTPUT_DIR, f"mipmap-{density}", "ic_launcher.png")
        path_round = os.path.join(OUTPUT_DIR, f"mipmap-{density}", "ic_launcher_round.png")
        resize_icon(px, path_fg, LAUNCHER_SCALE)
        resize_icon(px, path_round, LAUNCHER_SCALE)

    # 2. Adaptive icon foreground (108x108) with tighter padding for safe zone
    print(f"\n2. Adaptive icon foreground ({ADAPTIVE_SIZE}x{ADAPTIVE_SIZE}):")
    path_fg_png = os.path.join(OUTPUT_DIR, "drawable-v24", "ic_launcher_foreground.png")
    resize_icon(ADAPTIVE_SIZE, path_fg_png, ADAPTIVE_SCALE)

    # 3. Adaptive icon background (108x108)
    print(f"\n3. Adaptive icon background ({ADAPTIVE_SIZE}x{ADAPTIVE_SIZE}):")
    path_bg_png = os.path.join(OUTPUT_DIR, "drawable", "ic_launcher_background.png")
    resize_icon_with_bg(ADAPTIVE_SIZE, path_bg_png, (10, 10, 10, 255), ADAPTIVE_SCALE)

    # 4. Play Store icon (512x512)
    print(f"\n4. Play Store icon ({PLAY_STORE_SIZE}x{PLAY_STORE_SIZE}):")
    play_store_path = os.path.join(OUTPUT_DIR, "mipmap-xxxhdpi", "ic_launcher_playstore.png")
    resize_icon(PLAY_STORE_SIZE, play_store_path, PLAY_STORE_SCALE)

    print("\n=== Android icons regenerated successfully ===")


if __name__ == "__main__":
    main()
