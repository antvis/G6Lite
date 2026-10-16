/**
 * Hand-tuned crop windows for example thumbnails.
 *
 * `width` and `height` are the pixel size of the screenshot written by
 * `npm run examples:capture` (`site/scripts/capture-demo-thumbnails.mjs`).
 * `left`, `top`, `cropWidth`, and `cropHeight` select the visible region
 * in that image. The capture script does not update these numbers. After a
 * recapture, adjust any entry whose screenshot size or framing changed.
 */
const exampleCrops = {
  "basic": {
    "width": 1920,
    "height": 1200,
    "left": 336,
    "top": 0,
    "cropWidth": 1249,
    "cropHeight": 1200
  },
  "combo": {
    "width": 1920,
    "height": 1200,
    "left": 0,
    "top": 109,
    "cropWidth": 1920,
    "cropHeight": 983
  },
  "data-mutations": {
    "width": 1920,
    "height": 1200,
    "left": 0,
    "top": 0,
    "cropWidth": 1187,
    "cropHeight": 787
  },
  "default-theme": {
    "width": 1920,
    "height": 696,
    "left": 0,
    "top": 0,
    "cropWidth": 1920,
    "cropHeight": 696
  },
  "edge-arrows": {
    "width": 1920,
    "height": 1200,
    "left": 0,
    "top": 246,
    "cropWidth": 1920,
    "cropHeight": 707
  },
  "extension-system": {
    "width": 1920,
    "height": 1200,
    "left": 0,
    "top": 0,
    "cropWidth": 1920,
    "cropHeight": 791
  },
  "fishbone": {
    "width": 1920,
    "height": 1200,
    "left": 235,
    "top": 348,
    "cropWidth": 1521,
    "cropHeight": 503
  },
  "large-labeled": {
    "width": 960,
    "height": 600,
    "left": 179,
    "top": 0,
    "cropWidth": 627,
    "cropHeight": 600
  },
  "large": {
    "width": 960,
    "height": 600,
    "left": 165,
    "top": 0,
    "cropWidth": 631,
    "cropHeight": 600
  },
  "layout-gallery": {
    "width": 1920,
    "height": 1200,
    "left": 0,
    "top": 0,
    "cropWidth": 1291,
    "cropHeight": 826
  },
  "layouts": {
    "width": 1920,
    "height": 1200,
    "left": 0,
    "top": 0,
    "cropWidth": 1920,
    "cropHeight": 1096
  },
  "mindmap": {
    "width": 1920,
    "height": 1200,
    "left": 365,
    "top": 478,
    "cropWidth": 1147,
    "cropHeight": 245
  },
  "node-style": {
    "width": 1920,
    "height": 1200,
    "left": 360,
    "top": 0,
    "cropWidth": 1207,
    "cropHeight": 1200
  },
  "org-chart": {
    "width": 1920,
    "height": 1200,
    "left": 539,
    "top": 387,
    "cropWidth": 841,
    "cropHeight": 425
  },
  "parallel-edges": {
    "width": 1920,
    "height": 1200,
    "left": 0,
    "top": 0,
    "cropWidth": 1920,
    "cropHeight": 1200
  },
  "queries-and-states": {
    "width": 1920,
    "height": 1200,
    "left": 0,
    "top": 0,
    "cropWidth": 1278,
    "cropHeight": 789
  },
  "real-dataset": {
    "width": 960,
    "height": 600,
    "left": 0,
    "top": 0,
    "cropWidth": 960,
    "cropHeight": 600
  },
  "relationship": {
    "width": 1920,
    "height": 1200,
    "left": 732,
    "top": 446,
    "cropWidth": 513,
    "cropHeight": 327
  },
  "selection-behaviors": {
    "width": 1920,
    "height": 1200,
    "left": 0,
    "top": 0,
    "cropWidth": 1327,
    "cropHeight": 847
  },
  "tooltip": {
    "width": 1920,
    "height": 1200,
    "left": 390,
    "top": 0,
    "cropWidth": 1129,
    "cropHeight": 1200
  },
  "viewport-controls": {
    "width": 1920,
    "height": 1200,
    "left": 0,
    "top": 0,
    "cropWidth": 1331,
    "cropHeight": 852
  }
} as const;

export default exampleCrops;
