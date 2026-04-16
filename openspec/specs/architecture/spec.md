# Architecture Specification

## Purpose

Define the internal architecture of G6Lite, including the rendering pipeline, WebGL program abstraction, hit-testing strategy, performance optimization patterns, state management, and label system. This spec captures the core design decisions that enable G6Lite to achieve high-performance rendering of 100K-1M node graphs.

The architecture draws key patterns from Sigma.js (WebGL program abstraction, framebuffer picking, LabelGrid) and G6 (state management, style resolution pipeline), simplified to match G6Lite's minimalist philosophy.

## Requirements

### Requirement: Module structure

The system SHALL organize source code into the following modules with flat directory structure:

- `graph.ts` — Public API and lifecycle orchestration
- `types.ts` — All TypeScript type definitions
- `theme.ts` — Theme token resolution
- `renderer/` — WebGL rendering engine, camera, picking, labels, programs
- `layout/` — @antv/layout wrapper
- `behaviors/` — User interaction handlers

### Requirement: Data flow pipeline

The system SHALL process data through the following pipeline:

1. `Graph.render()` invokes layout to compute node positions
2. `Renderer.setData()` resolves styles and writes vertex data into Float32Array buffers via Program instances
3. `Renderer.scheduleRender()` coalesces updates into a single `requestAnimationFrame`
4. Each frame renders: picking pass (to framebuffer) -> edge programs -> node programs -> label layer (Canvas 2D)

#### Scenario: Render pipeline execution

- GIVEN a graph with data and layout configuration
- WHEN `graph.render()` is called
- THEN the system SHALL run layout, process data into GPU buffers, and schedule a WebGL render frame
- AND nodes SHALL appear on top of edges (z-order)

### Requirement: WebGL Program abstraction

The system SHALL provide an abstract `Program` base class that encapsulates:

- Shader compilation and linking
- Vertex buffer allocation and management (`reallocate`)
- Per-item data writing (`process`)
- Uniform setting (`setUniforms`)
- Draw call execution (`render`)

Each visual element type (node circle, node rect, edge line, edge rect, edge arc) SHALL be implemented as a concrete `Program` subclass with its own shaders and attribute layout.

#### Scenario: Adding a new node type

- GIVEN the Program base class exists
- WHEN a developer creates a new Program subclass with shaders and attribute definitions
- THEN the renderer SHALL be able to use it without modification to the core render loop

### Requirement: Program types

The system SHALL provide the following built-in programs:

| Program | Primitive | Vertices/Item | Description |
|---------|-----------|---------------|-------------|
| NodeCircle | GL_TRIANGLES (instanced) | 3 | Circle via SDF discard in fragment shader |
| NodeRect | GL_TRIANGLES (instanced) | 6 | Rectangle via two triangles, optional rounded corners |
| EdgeLine | GL_LINES | 2 | Fast thin edges (1px), default for `lineWidth <= 1` |
| EdgeRect | GL_TRIANGLES (instanced) | 6 | Variable-thickness rectangle edges |
| EdgeArc | GL_TRIANGLE_STRIP | ~40 | Quadratic bezier curved edges |

#### Scenario: Automatic program selection for edges

- GIVEN an edge configuration with `lineWidth > 1`
- WHEN the renderer processes the edge
- THEN it SHALL use EdgeRect program instead of EdgeLine

### Requirement: Instanced rendering

The system SHALL use the `ANGLE_instanced_arrays` WebGL extension for instanced rendering where applicable (NodeCircle, NodeRect, EdgeRect). Per-instance data SHALL be written once per item, and constant vertex data (e.g., triangle angles, quad corners) SHALL be shared via constant attributes.

If the extension is unavailable, the system SHALL fall back to non-instanced rendering.

### Requirement: Framebuffer picking

The system SHALL implement O(1) hit-testing via framebuffer picking, replacing the current O(n) distance-based approach.

- Each node and edge SHALL be assigned a unique index encoded as RGB color (24-bit, supporting up to 16M items)
- A downscaled off-screen framebuffer (canvas_size / 2) SHALL be maintained for picking
- All shaders SHALL support a `PICKING_MODE` variant via `#ifdef` that outputs encoded IDs instead of visual colors
- `pickAt(screenX, screenY)` SHALL read one pixel from the picking framebuffer and return the item ID or null

#### Scenario: Hover detection at 100K nodes

- GIVEN a graph with 100,000 nodes rendered
- WHEN the user moves the mouse over the canvas
- THEN the system SHALL identify the node under the cursor in constant time (single `readPixels` call)

### Requirement: Render scheduling

The system SHALL coalesce multiple state changes into a single render frame using `requestAnimationFrame`.

```typescript
scheduleRender(): void {
  if (!this.renderFrame) {
    this.renderFrame = requestAnimationFrame(() => {
      this.renderFrame = null;
      this.render();
    });
  }
}
```

All state mutations (camera changes, highlight changes, data updates) SHALL call `scheduleRender()` instead of rendering immediately.

### Requirement: Process/render separation

The system SHALL separate data processing (writing to Float32Array buffers) from rendering (issuing WebGL draw calls).

- A `needToProcess` flag SHALL track whether buffers need to be rebuilt
- Camera-only changes SHALL NOT trigger reprocessing — only uniform updates and draw calls
- Data or style changes SHALL set `needToProcess = true`

#### Scenario: Camera pan without reprocessing

- GIVEN a graph with 500K nodes already processed into buffers
- WHEN the user drags the canvas (camera pan)
- THEN the system SHALL only update the camera uniform matrix and re-issue draw calls
- AND SHALL NOT re-process node/edge data into buffers

### Requirement: Viewport culling

During the process step, the system SHALL compute the visible bounding box in graph coordinates from the current camera state. Nodes outside this bounding box (expanded by max node size) SHALL be skipped (zero-filled in buffer). Edges with both endpoints outside the viewport SHALL also be skipped.

### Requirement: Level of Detail (LOD)

The system SHALL implement LOD to reduce rendering load at high zoom-out levels:

- Nodes with `nodeSize * zoom < 0.5px` SHALL be skipped
- Edges connecting two skipped nodes SHALL also be skipped
- At extreme zoom-out, the system MAY hide all edges

### Requirement: Hide edges on move

The system SHALL support hiding edges during camera interaction (drag/zoom) to maintain interactive frame rates. Edges SHALL be re-rendered after interaction stops (100ms debounce).

### Requirement: Style system

Node and edge styles SHALL support both static values and function callbacks. Style resolution SHALL follow this priority order (highest first):

1. State-specific style overrides (highlight, select, dim)
2. User configuration style (with function callback evaluation)
3. Theme tokens
4. Hard-coded defaults

Style functions SHALL be evaluated during the process step and results baked into GPU buffers.

#### Scenario: Function-based node coloring with state override

- GIVEN `node.style.fill = (d) => d.data.cluster === 'a' ? 'red' : 'blue'`
- AND `node.state.highlight = { fill: '#FF5733' }`
- WHEN a node in cluster 'a' is highlighted
- THEN the node SHALL render with fill `#FF5733` (state override takes precedence)

### Requirement: State management

The system SHALL support multiple simultaneous states per element. Built-in states SHALL include:

- `highlight` — applied on hover (via behavior)
- `select` — applied on click (via behavior)
- `dim` — automatically applied to all non-highlighted/non-selected items when any items are highlighted/selected

State changes SHALL trigger buffer reprocessing and re-render.

#### Scenario: Dim state auto-application

- GIVEN 100 nodes, none highlighted
- WHEN the user hovers over node A
- THEN node A and its adjacent nodes/edges SHALL receive the `highlight` state
- AND all other nodes/edges SHALL receive the `dim` state

### Requirement: Label system

The system SHALL render text labels using a Canvas 2D overlay (not WebGL), positioned above the WebGL canvas with `pointer-events: none`.

A LabelGrid spatial index SHALL divide the viewport into cells (~120x120px) and display labels only for the largest node per cell, ensuring O(cells) label rendering instead of O(n).

Labels SHALL be hidden during camera interaction (`hideLabelsOnMove`).

#### Scenario: Label culling at scale

- GIVEN a graph with 100K nodes
- WHEN rendered with label configuration
- THEN only a few hundred labels SHALL be visible (one per grid cell for qualifying nodes)
- AND interactive frame rate SHALL not be affected by label rendering

### Requirement: Camera with animation

The system SHALL provide a `CameraController` that supports:

- Smooth animated transitions via `animateTo(target, duration)`
- `fitView(padding?)` to fit all nodes in the viewport
- Configurable `minZoom` / `maxZoom` constraints
- Zoom-to-cursor-position for natural interaction

#### Scenario: Animated fitView

- GIVEN a graph rendered with nodes spread across a large area
- WHEN `fitView()` is called
- THEN the camera SHALL animate smoothly to a state where all nodes are visible with padding

### Requirement: Shader format

Shader source code SHALL be stored as TypeScript string exports (`.ts` files), not as `.glsl` files, to avoid build-tool dependencies and ensure the project is compilable with plain `tsc`.

### Requirement: Single GL context

The system SHALL use a single WebGL context with framebuffer switching (for picking), rather than multiple canvas elements, to minimize DOM complexity and resource usage.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| WebGL version | WebGL 1 + ANGLE_instanced_arrays | Broadest browser compatibility; WebGL 2 as future upgrade path |
| GL context strategy | Single context + framebuffer | Simpler than Sigma's multi-canvas; fewer DOM elements |
| Shader storage | .ts string exports | No GLSL loader dependency; pure tsc build |
| Program extensibility | Direct map in Renderer | Avoids G6's registry complexity; sufficient for G6Lite's scope |
| Style evaluation | Baked into buffer at process time | Render is pure draw calls + uniform updates; minimal per-frame cost |
| Text rendering | Canvas 2D overlay | Proven approach from Sigma.js; avoids SDF font complexity |

## Implementation Phases

### Phase 1: Program abstraction + NodeCircle (foundation refactor)

Create `Program` base class, `NodeCircle` and `EdgeLine` programs. Refactor `renderer.ts` to use program dispatch. Add `scheduleRender()` and `needToProcess`.

### Phase 2: Framebuffer picking

Implement `picking.ts`. Add `#ifdef PICKING_MODE` to all shaders. Replace O(n) hit-test methods with `pickAt()`.

### Phase 3: New node/edge programs

Implement `NodeRect`, `EdgeRect`, `EdgeArc`. Extend style resolution for width/height and auto-program-selection.

### Phase 4: Performance optimizations

Viewport culling, LOD, hideEdgesOnMove, instanced rendering verification. Target: 100K nodes at 60fps, 500K at 30fps.

### Phase 5: Labels + Camera + States

Canvas 2D label layer with LabelGrid. CameraController with animation/constraints. General state management + clickSelect behavior.
