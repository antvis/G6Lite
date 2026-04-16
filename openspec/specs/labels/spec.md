# Labels Specification

## Purpose

Support displaying labels for nodes and edges while keeping the core rendering WebGL-friendly. Initial implementation MAY use HTML overlay rendering synchronized with the WebGL camera.

## Requirements

### Requirement: Node label config

The system SHALL support configuring node labels via the graph options.

- Node labels MAY be derived from `node.name`
- Node labels MAY be derived via a formatter function

#### Scenario: Node label from name

- GIVEN graph data where nodes include `name`
- AND `node` config does not override label behavior
- WHEN the graph is rendered
- THEN each visible node SHALL display its `name` as a label near the node position

#### Scenario: Node label via formatter

- GIVEN a graph config with `node: { label: (node) => \`Node \${node.id}\` }`
- WHEN the graph is rendered
- THEN each node SHALL display the string returned by the label formatter

### Requirement: Edge label config

The system SHALL support configuring edge labels via the graph options.

- Edge labels MAY be derived from a `label` field on the edge data
- Edge labels MAY be derived via a formatter function

#### Scenario: Edge label from data

- GIVEN edges with `data: { weight: number }`
- AND `edge` config specifies `label: (edge) => String(edge.data?.weight ?? '')`
- WHEN the graph is rendered
- THEN each edge SHALL display its label at (or near) the midpoint of the edge

### Requirement: Label rendering and camera sync

Label rendering SHALL be synchronized with the camera so that:

- WHEN the camera zooms or pans
- THEN node and edge labels SHALL remain anchored to their corresponding primitives

An HTML overlay (e.g. absolutely positioned elements on top of the canvas) MAY be used as the initial implementation, as long as:

- label positions are recomputed when the camera or viewport changes
- labels are batched/updated efficiently for large graphs (e.g. 5000 nodes)

