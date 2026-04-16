# Graph Rendering Specification

## Purpose

Define how the graph is instantiated, configured with data, and how nodes and edges are rendered using WebGL-friendly options.

## Requirements

### Requirement: Graph constructor and container

The system SHALL provide a `Graph` class that accepts a configuration object including at least `container`, `data`, `node`, `edge`, `layout`, `behaviors`, and `theme`, and SHALL expose a `render()` method.

#### Scenario: Minimal graph creation and render

- GIVEN a valid container selector (e.g. `'container'`)
- AND `data` with `nodes` and `edges` arrays (possibly empty)
- WHEN the user instantiates `new Graph({ container, data, ... })` and calls `graph.render()`
- THEN the graph SHALL render in the given container

### Requirement: Data format

The system SHALL accept graph data in the form `{ nodes: [], edges: [] }`. Each node SHALL have at least `id` and MAY have `name` and `data` (extended payload). Each edge SHALL have at least `source` and `target` (node ids) and MAY have `data` (extended payload).

#### Scenario: Data with extended fields

- GIVEN nodes with `id`, `name`, and `data` (e.g. `cluster`)
- AND edges with `source`, `target`, and `data`
- WHEN the data is passed via the `data` option and `render()` is called
- THEN the graph SHALL render all nodes and edges and SHALL make extended data available for style functions

### Requirement: Node style configuration

The system SHALL support a `node` config with `type` (e.g. `rect`, `circle`) and `style` (e.g. `fill` as function or value). Style options SHALL be limited to what is feasible and performant in WebGL.

#### Scenario: Node type and function-based fill

- GIVEN `node: { type: 'rect', style: { fill: (d) => 'red' } }`
- WHEN the graph is rendered
- THEN each node SHALL be drawn as the specified type with fill derived from the function

### Requirement: Edge style configuration

The system SHALL support an `edge` config with `type` (e.g. `line`, `arc`) and `style` (e.g. `fill`, `lineWidth` as function or value). Style options SHALL be limited to WebGL-capable properties.

#### Scenario: Edge type and function-based style

- GIVEN `edge: { type: 'line', style: { fill: (node) => 'red', lineWidth: (node1, node2, edge) => 3 } }`
- WHEN the graph is rendered
- THEN each edge SHALL be drawn with the specified type and styles

### Requirement: WebGL-only styling

The system SHALL only expose node and edge style options that can be implemented efficiently in WebGL; the set of options SHALL be documented and MAY be extended in line with WebGL capabilities.
