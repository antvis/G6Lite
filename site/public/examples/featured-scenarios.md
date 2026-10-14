# Featured runnable scenarios

`relationship.png`, `org-chart.png`, `mindmap.png`, and `fishbone.png` are screenshots of the matching Playground modules. The homepage links directly to their website example details; these are functional demonstrations, not customer case studies.

To regenerate, start the repository's Playground development server on port 5179, then run:

```sh
CAPTURE_BASE=http://127.0.0.1:5179 node site/scripts/capture-demo-thumbnails.mjs relationship org-chart mindmap fishbone
```

The capture script uses independent browser contexts and the examples' ready state, with a 960×600 viewport at DPR 2. Each of these examples initially fits its graph with 64px padding. No source layout screenshot is overwritten or artificially redrawn.
