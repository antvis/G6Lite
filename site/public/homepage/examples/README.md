# Featured example screenshots

These are crops of the matching runnable website examples (`relationship`, `org-chart`, `mindmap`, and `fishbone`), not AI-generated images or customer case studies.
Only unused background is removed; all detected graph content is retained with a 32px safety margin, limited by the original image bounds.
Original layout documentation images remain unchanged. Regenerate the matching runtime captures first as described in `site/public/examples/featured-scenarios.md`.

Offline crop tools are maintained locally, not in the website build. To regenerate, apply the crop rectangles in `crop-records.json` to the matching source captures; when source dimensions change, detect the graph content bounds and retain the 32px safety margin described above.

`crop-records.json` records source paths, crop rectangles and output dimensions.
The bilingual homepage links directly to the corresponding runnable example details, without a static-image dialog.
