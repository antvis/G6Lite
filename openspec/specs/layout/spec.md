# Layout Specification

## Purpose

Provide layout capabilities by wrapping and forwarding AntV Layout so that all layout algorithms supported by [@antv/layout](https://github.com/antvis/layout) can be used in G6Lite via a consistent config-driven API.

## Requirements

### Requirement: Layout as config

The system SHALL accept a `layout` option on the Graph config with at least `type` (e.g. `circular`, `force`, `dagre`) and type-specific options (e.g. `center`, `radius` for circular).

#### Scenario: Circular layout via config

- GIVEN `layout: { type: 'circular', center: [200, 200], radius: 150 }`
- WHEN the graph is created and rendered
- THEN node positions SHALL be computed using the circular layout with the given parameters

### Requirement: Alignment with AntV Layout

The system SHALL support all layout types provided by AntV Layout; the API SHALL be a thin wrapper so that options passed in `layout` correspond to the underlying layout library (e.g. CircularLayout options).

#### Scenario: Using layout equivalent to AntV CircularLayout

- GIVEN config that would be equivalent to `new CircularLayout({ center: [200, 200], radius: 150 })`
- WHEN the same options are passed in `layout: { type: 'circular', center: [200, 200], radius: 150 }`
- THEN behavior SHALL match the AntV Layout implementation for that algorithm

### Requirement: Layout execution

The system SHALL run the configured layout on the graph data (nodes/edges) and SHALL apply the resulting positions so that the graph renders with the computed layout.
