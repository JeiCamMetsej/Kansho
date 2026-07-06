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


def resize_icon(size, output_path):
    """Resize logo.png to the given size and save to output_path."""
    img = Image.open(LOGO_PATH)
    img_resized = img.resize((size, size), Image.LANCZOS)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img_resized.save(output_path, "PNG")
    print(f"  Saved: {output_path} ({size}x{size})")


def main():
    print("=== Generating Android Icons from logo.png ===\n")

    # 1. Density-specific launcher icons (ic_launcher / ic_launcher_round)
    print("1. Launcher icons (ic_launcher / ic_launcher_round):")
    for density, px in DENSITIES.items():
        path_fg = os.path.join(OUTPUT_DIR, f"mipmap-{density}", "ic_launcher.png")
        path_round = os.path.join(OUTPUT_DIR, f"mipmap-{density}", "ic_launcher_round.png")
        resize_icon(px, path_fg)
        resize_icon(px, path_round)

    # 2. Adaptive icon foreground (108x108)
    print("\n2. Adaptive icon foreground (108x108):")
    path_fg_png = os.path.join(OUTPUT_DIR, "drawable-v24", "ic_launcher_foreground.png")
    resize_icon(ADAPTIVE_SIZE, path_fg_png)

    # 3. Adaptive icon background (108x108)
    print("\n3. Adaptive icon background (108x108):")
    path_bg_png = os.path.join(OUTPUT_DIR, "drawable", "ic_launcher_background.png")
    resize_icon(ADAPTIVE_SIZE, path_bg_png)

    # 4. Play Store icon (512x512)
    print("\n4. Play Store icon (512x512):")
    play_store_path = os.path.join(OUTPUT_DIR, "mipmap-xxxhdpi", "ic_launcher_playstore.png")
    resize_icon(PLAY_STORE_SIZE, play_store_path)

    print("\n=== Done! All icons generated successfully ===")


if __name__ == "__main__":
    main()
