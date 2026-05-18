"""
Slice the three Captain Culinary Motion Library contact sheets into 90
individual pose PNGs.

Each contact sheet is 5 columns x 6 rows. Page 1 = poses 1-30, page 2 = 31-60,
page 3 = 61-90. Outputs written zero-padded as cap-001.png through cap-090.png.

Usage:
    cd <repo root>
    python scripts/slice_motion_contact_sheets.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
INPUT_DIR = ROOT / "_motion_input"
OUT_DIR = ROOT.parent / "frontend" / "public" / "motions"
OUT_DIR.mkdir(parents=True, exist_ok=True)

COLS, ROWS = 5, 6
SHEETS = [
    ("page1.png", 1),
    ("page2.png", 31),
    ("page3.png", 61),
]

# Approximate top-of-page header offset to skip the title. Tune if needed —
# inspect cap-001.png after first run and adjust HEADER_OFFSET_PX upward if
# the title text is being cropped into the first row.
HEADER_OFFSET_PX = 90  # px from top of the contact sheet before the grid starts

count = 0
for filename, start_id in SHEETS:
    img_path = INPUT_DIR / filename
    if not img_path.exists():
        raise FileNotFoundError(f"Missing contact sheet: {img_path}")
    img = Image.open(img_path).convert("RGBA")
    w, h = img.size
    grid_top = HEADER_OFFSET_PX
    grid_h = h - grid_top
    cell_w = w // COLS
    cell_h = grid_h // ROWS

    pose_id = start_id
    for r in range(ROWS):
        for c in range(COLS):
            left = c * cell_w
            top = grid_top + r * cell_h
            right = left + cell_w
            bottom = top + cell_h
            crop = img.crop((left, top, right, bottom))
            out_name = f"cap-{pose_id:03d}.png"
            crop.save(OUT_DIR / out_name, optimize=True)
            pose_id += 1
            count += 1

print(f"Sliced {count} poses to {OUT_DIR}")
