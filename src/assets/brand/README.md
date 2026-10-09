# Brand assets

## Supergraphic shape (O-cut)

The supergraphic is defined as **“taken from the horizontal cut of the letter O”** in the Arcos Brand Identity PDF.

### Using the exact shape from the PDF

1. Open **Arcos - Brand Identity Guidelines.pdf** in **Adobe Illustrator** (or another vector editor that can open PDFs).
2. Go to the **Supergraphic** page (pages 25–26).
3. Select the supergraphic shape shown there (the arc/cut shape).
4. Copy the path:
   - **Illustrator:** Select the shape → Object → Path → Outline Stroke (if it’s a stroke) → Copy. Then File → Export → Export As → SVG. Open the SVG in a text editor and copy the `d="..."` value from the `<path>`.
   - Or: right‑click the shape → “Copy path data” (if your tool supports it).
5. In this project, open **`supergraphicPath.ts`** and replace `SUPERGRAPHIC_PATH_D` with the copied path string.
6. If the shape has a different bounding box, set `SUPERGRAPHIC_VIEWBOX` to match (e.g. `"0 0 120 40"` for width 120, height 40).

All supergraphic components (OcutShape, Supergraphic, SupergraphicStrip) use this single path, so updating it here updates the shape everywhere.
