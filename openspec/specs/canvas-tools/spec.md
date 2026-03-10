# Canvas Tools Specification

## Purpose

Provide optional, high-level canvas tools (UI controls) for zooming and view reset on top of the existing camera and behaviors. These tools SHALL be implemented in the playground first and MAY be promoted into reusable helpers in the library.

## Requirements

### Requirement: Basic canvas tools

The system SHALL support four basic canvas tools operating on the graph camera:

- zoom in
- zoom out
- fullscreen (fit to content)
- reset (restore initial camera)

These tools MAY be exposed as convenience functions or as part of the playground UI.

#### Scenario: Zoom in/out buttons in playground

- GIVEN a rendered graph in the playground
- AND visible buttons "＋" (zoom in) and "－" (zoom out)
- WHEN the user clicks "＋"
- THEN the camera zoom SHALL increase by a fixed factor (e.g. 1.2x) and the graph SHALL re-render
- WHEN the user clicks "－"
- THEN the camera zoom SHALL decrease by a fixed factor (e.g. 1 / 1.2) with sensible min/max bounds and the graph SHALL re-render

### Requirement: Fullscreen (fit to content)

The system SHALL provide a "fullscreen" tool that adjusts the camera so that all nodes are visible within the current canvas viewport with a small margin.

#### Scenario: Fit view to all nodes

- GIVEN a graph with nodes laid out in 2D space
- AND the camera is currently panned/zoomed arbitrarily
- WHEN the user clicks the "fullscreen" button
- THEN the camera center and zoom SHALL be updated so that all nodes fit within the canvas, with at least a small padding (e.g. 5–10%)

### Requirement: Reset view

The system SHALL provide a "reset" tool that restores the camera to its initial state for the current render (e.g. center and zoom as first computed when the graph finished layout and initial fit).

#### Scenario: Reset to initial view

- GIVEN the user has zoomed and panned the canvas
- WHEN the user clicks the "reset" button
- THEN the camera SHALL be restored to the same center and zoom as immediately after the initial render

### Requirement: Non-intrusive API

The canvas tools SHALL be implemented in a way that does not break existing graphs that use only behaviors. For example:

- tools MAY live in the playground and operate via public renderer/Graph APIs
- OR tools MAY be exposed as helper functions that accept a `Graph` instance

