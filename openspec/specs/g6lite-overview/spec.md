# G6Lite Overview Specification

## Purpose

Define the product positioning and scope of G6Lite. G6Lite is a high-performance graph analysis engine based on WebGL (and WebGPU where applicable), designed exclusively for large-scale graph data analysis and visualization. It does not target rich node/edge styling or custom UI elements; those use cases belong to X6.

**Positioning statement**: G6Lite is a high-performance graph analysis engine based on WebGL, designed for large-scale graph data analysis.

## Requirements

### Requirement: Technology scope

The system SHALL be built only on WebGL and WebGPU for rendering and computation.

### Requirement: Out-of-scope

The system SHALL NOT support rich custom node shapes (e.g. HTML/React/Vue nodes), arbitrary visual customization, or diagram-editor-style features; such needs SHALL be directed to X6.

### Requirement: Primary use case

The system SHALL target ultra-large-scale graph data analysis and visualization as the primary use case.
