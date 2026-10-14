# Featured example screenshots

The homepage and example pages share the matching screenshots in `/examples/` (`relationship`, `org-chart`, `mindmap`, and `fishbone`), not AI-generated images or customer case studies. No separate homepage PNGs are maintained.
The homepage uses a CSS crop viewport to hide unused background while retaining all detected graph content with a 32px safety margin, limited by the original image bounds.
Original layout documentation images remain unchanged. Regenerate the matching runtime captures as described in `site/public/examples/featured-scenarios.md`.

`crop-records.json` is imported by the homepage component to position and scale the original screenshots. When source captures change, update the crop rectangles and dimensions to match the graph content bounds and retain the 32px safety margin described above. No image-generation step is required by the homepage build.

`crop-records.json` records source paths, crop rectangles and crop viewport dimensions.
The bilingual homepage links directly to the corresponding runnable example details, without a static-image dialog.
