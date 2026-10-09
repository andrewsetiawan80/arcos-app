/**
 * Arcos Supergraphic shape — "horizontal cut of the letter O"
 *
 * To match the PDF exactly:
 * 1. Open "Arcos - Brand Identity Guidelines.pdf" in Adobe Illustrator (or similar).
 * 2. Go to the Supergraphic page (pages 25–26).
 * 3. Select the supergraphic shape shown there.
 * 4. Export as SVG or copy the path: Object → Path → Outline Stroke (if needed), then copy the path data.
 * 5. Paste the path string below as SUPERGRAPHIC_PATH_D and set VIEWBOX to match the shape’s bounds.
 *
 * The path should be a single filled shape (the arc/cut). Colors are applied by the component (#353535 / #232323).
 */

/** ViewBox for the supergraphic shape: "minX minY width height" */
export const SUPERGRAPHIC_VIEWBOX = "0 0 100 50";

/**
 * SVG path d="..." for the supergraphic.
 * Default: semi-circle (bottom half of circle) — replace with the exact path from the PDF for accuracy.
 */
export const SUPERGRAPHIC_PATH_D =
  "M 0 50 A 50 50 0 0 1 100 50 L 100 50 L 0 50 Z";
