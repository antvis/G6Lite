# Theme Specification

## Purpose

Provide a simple theming mechanism with common tokens (e.g. colors, line widths) and built-in `light` and `dark` themes, with optional token overrides.

## Requirements

### Requirement: Theme option

The system SHALL accept a `theme` option that is either a string (`'light'` or `'dark'`) or an object with `type` and optional token overrides.

#### Scenario: String theme

- GIVEN `theme: 'light'` or `theme: 'dark'`
- WHEN the graph is rendered
- THEN the graph SHALL use the corresponding built-in theme tokens

#### Scenario: Theme with overrides

- GIVEN `theme: { type: 'light', edgeLineWidth: 2, ... }`
- WHEN the graph is rendered
- THEN the graph SHALL use the built-in theme for `type` and SHALL override any specified tokens (e.g. `edgeLineWidth`)

### Requirement: Built-in themes

The system SHALL ship with at least two themes: `light` and `dark`, each defining a consistent set of tokens for node and edge styling.

### Requirement: Token override

The system SHALL allow theme token overrides (e.g. `edgeLineWidth`, colors) when `theme` is an object; overrides SHALL take precedence over the base theme.
