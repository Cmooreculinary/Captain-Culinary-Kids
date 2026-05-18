# Motion Library Input

Place the three Captain Culinary Motion Library contact sheets here before
running `python scripts/slice_motion_contact_sheets.py`:

- `page1.png` — poses 1–30 (5 cols × 6 rows)
- `page2.png` — poses 31–60
- `page3.png` — poses 61–90

The slicer writes 90 individual pose PNGs to `frontend/public/motions/`.
This input directory is intentionally gitignored — the source contact sheets
are large and not needed at runtime.
