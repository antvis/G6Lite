# Large Demo (5000 Nodes) Specification

## Purpose

Provide a playground demo that stresses the renderer with approximately 5000 nodes and corresponding edges, including node and edge labels, to validate performance and API usability.

## Requirements

### Requirement: Demo data scale

The large demo SHALL generate graph data with:

- approximately 5000 nodes
- O(N) to O(N log N) edges (not fully dense), suitable for interactive rendering

#### Scenario: 5000-node demo generation

- GIVEN the large demo entry in the playground
- WHEN the demo is loaded
- THEN it SHALL generate around 5000 nodes and a reasonable number of edges (e.g. each node connects to a small, fixed number of neighbors)

### Requirement: Labels enabled in large demo

The large demo SHALL enable both node and edge labels using the label configuration capabilities.

#### Scenario: Node and edge labels present

- GIVEN the large demo is running
- WHEN the graph is rendered
- THEN node labels SHALL be visible (e.g. `id` or cluster information)
- AND edge labels SHALL be visible (e.g. weight or index)

### Requirement: Performance baseline

The large demo SHALL be usable on a modern laptop (e.g. 2024 MacBook) in a desktop browser:

- initial render time SHOULD be within a few seconds
- pan/zoom interactions SHOULD remain responsive enough for inspection

This requirement is indicative and MAY be refined with empirical measurements.

