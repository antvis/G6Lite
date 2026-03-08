# Behaviors Specification

## Purpose

Define built-in interactions (behaviors) for the graph, expressed as a list of behavior names or configs, similar to G6. Initial set focuses on canvas manipulation and hover-based highlighting.

## Requirements

### Requirement: Behaviors configuration

The system SHALL accept a `behaviors` option as an array of strings (e.g. `['zoom-canvas', 'drag-canvas']`) or of behavior config objects, and SHALL register and enable those behaviors on the graph.

#### Scenario: Enable zoom and drag canvas

- GIVEN `behaviors: ['zoom-canvas', 'drag-canvas']`
- WHEN the graph is rendered
- THEN the user SHALL be able to zoom the canvas and drag the canvas

### Requirement: zoom-canvas

The system SHALL provide a built-in behavior `zoom-canvas` that allows the user to zoom the canvas (e.g. wheel or pinch).

### Requirement: drag-canvas

The system SHALL provide a built-in behavior `drag-canvas` that allows the user to drag the canvas to pan the view.

### Requirement: highlight-edge

The system SHALL provide a built-in behavior (e.g. `highlight-edge`) such that when the user hovers over an edge, that edge and its source and target nodes are highlighted.

### Requirement: highlight-node

The system SHALL provide a built-in behavior (e.g. `highlight-node`) such that when the user hovers over a node, that node and its adjacent nodes and edges (one hop) are highlighted.

### Requirement: Extensibility

The system MAY allow additional built-in or custom behaviors to be added in the future; the initial release SHALL at least support the four behaviors above.
