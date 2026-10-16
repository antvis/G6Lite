/**
 * Shared hero-graph packing for the sigma.js v4 AI-papers layout.
 * Coordinates stay in the upstream ForceAtlas2 space, translated to the origin.
 * Source: https://github.com/jacomyal/sigma.js/tree/v4/packages/website/public/data
 * Copyright (C) 2012-2026 Alexis Jacomy, Guillaume Plique, Benoît Simard. MIT License.
 */

// The renderer keeps camera zoom at 0.1 or above. Raw coordinates span about 23k
// units, so they are scaled to roughly 1800 units and still fill the hero after fitView.
export const LAYOUT_SCALE = 1800 / 23208;

// [text, placement, minZoom]. minZoom 0 stays on the default view. Later tiers
// appear as the camera zooms in. Titles are stored in full; labelMaxWidth truncates them.
export const LABELS = {
  0: ["ResNet", "left", 0],
  12: ["Pattern classification and scene analysis", "right", 0.85],
  150: ["Regression Shrinkage and Selection Via the Lasso", "right", 0.85],
  340: ["Collective dynamics of ‘small-world’ networks", "right", 0.85],
  689: ["From Sparse Solutions of Systems of Equations to Sparse Modeling of Signals and Images", "right", 2.4],
  1336: ["The minimal preprocessing pipelines for the Human Connectome Project", "right", 2.4],
  2735: ["Advances in functional and structural MR image analysis and implementation as FSL", "right", 2.4],
  4834: ["Rethinking the Inception Architecture for Computer Vision", "right", 2.4],
  5146: ["Gapped BLAST and PSI-BLAST", "right", 0.85],
  5516: ["Community detection in graphs", "right", 2.4],
  5821: ["A Comparison of Affine Region Detectors", "right", 2.4],
  5846: ["Learning generative visual models from few training examples: An incremental Bayesian approach tested on 101 object categories", "right", 0.85],
  6339: ["Probabilistic Reasoning in Intelligent Systems: Networks of Plausible Inference", "right", 2.4],
  6510: ["Adaptation in Natural and Artificial Systems", "right", 0.85],
  6591: ["Non-local sparse models for image restoration", "right", 2.4],
  6604: ["The Elements of Statistical Learning", "right", 2.4],
  6982: ["Stochastic Relaxation, Gibbs Distributions, and the Bayesian Restoration of Images", "right", 2.4],
  7040: ["A Learning Algorithm for Boltzmann Machines*", "right", 2.4],
  7098: ["Deep Neural Networks for Acoustic Modeling in Speech Recognition: The Shared Views of Four Research Groups", "right", 2.4],
  7114: ["TensorFlow", "right", 0.85],
  7167: ["Deep learning", "right", 0.85],
  7299: ["Relational inductive biases, deep learning, and graph networks", "right", 0.85],
  7337: ["Evaluation of 14 nonlinear deformation algorithms applied to human brain MRI registration", "right", 2.4],
  7506: ["Individual differences in reasoning: Implications for the rationality debate?", "right", 0.85],
  7610: ["Sentiment Analysis and Opinion Mining", "right", 2.4],
  7642: ["Distributed Representations of Words and Phrases and their Compositionality", "right", 2.4],
  7668: ["Seq2Seq", "top", 0],
  7689: ["MizAR 60 for Mizar 50", "right", 0.85],
  7718: ["Image quality assessment", "right", 2.4],
  7757: ["Shape matching and object recognition using shape contexts", "right", 2.4],
  7800: ["Sparse Representation for Computer Vision and Pattern Recognition", "right", 0.85],
  7834: ["On Spectral Clustering", "right", 2.4],
  7853: ["Survey of Clustering Algorithms", "right", 0.85],
  7904: ["Parallel Distributed Processing", "right", 2.4],
  7905: ["Learning representations by back-propagating errors", "right", 2.4],
  7914: ["Learning Internal Representations by Error Propagation", "right", 0.85],
  7984: ["Explainable Artificial Intelligence (XAI)", "right", 2.4],
  8024: ["EXPERT SYSTEMS WITH APPLICATIONS", "right", 0.85],
  8068: ["Detecting faces in images", "right", 2.4],
  8097: ["Gradient-based learning applied to document recognition", "right", 2.4],
  8133: ["A Decision-Theoretic Generalization of On-Line Learning and an Application to Boosting", "right", 2.4],
  8138: ["Data Mining", "right", 2.4],
  8162: ["Support-Vector Networks", "right", 0.85],
  8170: ["LIBSVM", "right", 2.4],
  8191: ["Neural networks", "right", 0],
  8195: ["Classification and Regression Trees.", "right", 2.4],
  8345: ["Histograms of Oriented Gradients for Human Detection", "right", 2.4],
  8346: ["SIFT", "bottom", 0],
  8348: ["Normalized cuts and image segmentation", "right", 2.4],
  8385: ["Image Super-Resolution Using Deep Convolutional Networks", "right", 2.4],
  8388: ["Learning Multiple Layers of Features from Tiny Images", "right", 2.4],
  8392: ["ImageNet", "right", 0],
  8394: ["Backpropagation Applied to Handwritten Zip Code Recognition", "right", 2.4],
  8403: ["The Pascal Visual Object Classes (VOC) Challenge", "right", 0.85],
  8409: ["Microsoft COCO", "right", 2.4],
  8416: ["Neural networks for pattern recognition", "right", 2.4],
  8470: ["NTIRE 2017 Challenge on Single Image Super-Resolution: Methods and Results", "right", 0.85],
  8617: ["Self-Training With Noisy Student Improves ImageNet Classification", "right", 2.4],
  8621: ["Recent advances and applications of machine learning in solid-state materials science", "right", 2.4],
  8660: ["Deep Learning for Generic Object Detection", "right", 2.4],
  8697: ["Geometric Deep Learning", "right", 2.4],
  8710: ["Places: A 10 Million Image Database for Scene Recognition", "right", 2.4],
  8758: ["Segment Anything", "right", 2.4],
  8763: ["ShuffleNet", "right", 2.4],
  8774: ["Aggregated Residual Transformations for Deep Neural Networks", "right", 2.4],
  8792: ["FPN", "left", 0],
};

export function buildHeroGraph(packedNodes, packedEdges, ids) {
  if (packedNodes.length % 3 !== 0) {
    throw new Error(`Hero node buffer length ${packedNodes.length} is not a multiple of 3`);
  }
  if (packedEdges.length % 2 !== 0) {
    throw new Error(`Hero edge buffer length ${packedEdges.length} is not a multiple of 2`);
  }
  const count = packedNodes.length / 3;
  if (ids && ids.length !== count) {
    throw new Error(`Hero node id list length ${ids.length} does not match ${count} nodes`);
  }
  const knownIds = ids ? new Set(ids) : null;
  const nodes = new Array(count);
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const x = packedNodes[offset];
    const y = packedNodes[offset + 1];
    const nodeId = ids ? ids[index] : index;
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(`Hero node ${nodeId} has an invalid coordinate`);
    }
    const label = LABELS[nodeId];
    nodes[index] = {
      id: String(nodeId),
      x: Math.round(x * LAYOUT_SCALE),
      y: Math.round(y * LAYOUT_SCALE),
      data: label
        ? {
            cluster: packedNodes[offset + 2],
            label: label[0],
            labelPlacement: label[1],
            labelMinZoom: label[2],
          }
        : { cluster: packedNodes[offset + 2] },
    };
  }
  const edgeCount = packedEdges.length / 2;
  const graphEdges = new Array(edgeCount);
  for (let index = 0; index < edgeCount; index += 1) {
    const offset = index * 2;
    const source = packedEdges[offset];
    const target = packedEdges[offset + 1];
    const outside = knownIds
      ? !knownIds.has(source) || !knownIds.has(target)
      : source < 0 || target < 0 || source >= count || target >= count;
    if (outside) throw new Error(`Hero edge ${index} points outside the node list`);
    graphEdges[index] = { source: String(source), target: String(target) };
  }
  return { nodes, edges: graphEdges };
}
