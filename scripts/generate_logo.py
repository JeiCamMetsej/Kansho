#!/usr/bin/env python3
"""Generate Kansho app icons for all Android mipmap densities."""

from PIL import Image, ImageDraw
import os
import math

# Color scheme
BG_DARK = (18, 18, 30)
ACCENT = (156, 39, 176)
ACCENT2 = (255, 64, 129)
TEXT_COLOR = (255, 255, 255)

# Density sizes (px)
DENSITIES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

PLAY_STORE_SIZE = 512

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "android", "app", "src", "main", "res")


def draw_logo(draw, size, is_foreground=False):
    cx, cy = size // 2, size // 2
    book_w = size * 0.55
    book_h = size * 0.65
    bx = cx - book_w // 2
    by = cy - book_h // 2
    r = int(size * 0.06)

    draw.rounded_rectangle(
        [bx, by, bx + book_w, by + book_h],
        radius=r,
        fill=ACCENT if is_foreground else None,
        outline=ACCENT2 if not is_foreground else None,
        width=max(1, int(size * 0.025))
    )

    spine_x = bx + book_w * 0.18
    draw.line(
        [spine_x, by + r, spine_x, by + book_h - r],
        fill=ACCENT2,
        width=max(1, int(size * 0.02))
    )

    for i in range(3):
        ly = by + book_h * (0.3 + i * 0.18)
        lx1 = spine_x + book_w * 0.12
        lx2 = bx + book_w * 0.88
        draw.line(
            [lx1, ly, lx2, ly],
            fill=TEXT_COLOR,
            width=max(1, int(size * 0.015))
        )

    for i in range(2):
        dot_x = bx + book_w * (0.35 + i * 0.28)
        dot_y = by + book_h * 0.45
        dot_r = max(1, int(size * 0.02))
        draw.ellipse(
            [dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r],
            fill=TEXT_COLOR
        )

    star_y = by - size * 0.08
    star_size = int(size * 0.04)
    draw_star(draw, cx, star_y, star_size, ACCENT2 if not is_foreground else TEXT_COLOR)

    if not is_foreground:
        accent_y = by + book_h + size * 0.06
        draw.line(
            [cx - book_w * 0.3, accent_y, cx + book_w * 0.3, accent_y],
            fill=ACCENT2,
            width=max(1, int(size * 0.02))
        )


def draw_star(draw, x, y, size, color):
    points = []
    for i in range(8):
        angle = math.pi * i / 4 - math.pi / 8
        r = size if i % 2 == 0 else size * 0.35
        points.append((x + r * math.cos(angle), y + r * math.sin(angle)))
    draw.polygon(points, fill=color)


def generate_icon(size, is_foreground=False, output_path=None):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0) if is_foreground else BG_DARK)
    draw = ImageDraw.Draw(img)
    draw_logo(draw, size, is_foreground)
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path, "PNG")
        print(f"  Saved: {output_path} ({size}x{size})")
    return img


def generate_adaptive_background(size, output_path=None):
    img = Image.new("RGBA", (size, size), BG_DARK)
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    max_r = int(size * 0.7)
    for r in range(max_r, 0, -max_r // 20):
        alpha = int(30 * (1 - r / max_r))
        draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(156, 39, 176, alpha)
        )
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path, "PNG")
        print(f"  Saved: {output_path} ({size}x{size})")
    return img


def main():
    print("=== Generating Kansho App Icons ===")

    # 1. Density-specific launcher icons
    print("1. Launcher icons (ic_launcher / ic_launcher_round):")
    for density, px in DENSITIES.items():
        path_fg = os.path.join(OUTPUT_DIR, f"mipmap-{density}", "ic_launcher.png")
        path_round = os.path.join(OUTPUT_DIR, f"mipmap-{density}", "ic_launcher_round.png")
        generate_icon(px, output_path=path_fg)
        generate_icon(px, output_path=path_round)

    # 2. Adaptive icon foreground
    print("\n2. Adaptive icon foreground (108x108):")
    adaptive_size = 108
    path_fg_png = os.path.join(OUTPUT_DIR, "drawable-v24", "ic_launcher_foreground.png")
    generate_icon(adaptive_size, is_foreground=True, output_path=path_fg_png)

    # 3. Adaptive icon background
    print("\n3. Adaptive icon background (108x108):")
    path_bg_png = os.path.join(OUTPUT_DIR, "drawable", "ic_launcher_background.png")
    generate_adaptive_background(adaptive_size, output_path=path_bg_png)

    # 4. Play Store icon
    print("\n4. Play Store icon (512x512):")
    play_store_path = os.path.join(OUTPUT_DIR, "mipmap-xxxhdpi", "ic_launcher_playstore.png")
    generate_icon(PLAY_STORE_SIZE, output_path=play_store_path)

    print("\n=== Done! All icons generated successfully ===")


if __name__ == "__main__":
    main()
