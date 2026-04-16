# Project Requirements Specification

## Purpose

Define non-functional and structural requirements for the G6Lite codebase: language, directory layout, tooling, and goals for performance and bundle size.

## Requirements

### Requirement: TypeScript

The system SHALL be developed in TypeScript; source code SHALL live under the `src` directory.

### Requirement: Playground

The system SHALL provide a `playground` directory with a Vite-based setup that allows running and debugging the full feature flow (rendering, layout, behaviors, theme) via demos.

### Requirement: Directory structure

The system SHALL organize code by technical concept in a flat or shallow directory structure; each concept SHALL live in a clear, minimal directory.

### Requirement: Dependencies

The system SHALL minimize third-party dependencies; code SHALL be concise and dependencies SHALL be kept as few as possible.

### Requirement: Performance and bundle size

The system SHALL prioritize runtime performance and minimal bundle size; design and implementation choices SHALL be evaluated against these goals.
