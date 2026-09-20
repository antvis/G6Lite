# Build G6Lite graphs with AI (/en/docs/ai)





<div className="ai-entry-hero not-prose">
  <span>
    AI for graph visualization
  </span>

  <h2>
    Turn intent into a graph you can verify
  </h2>

  <div className="ai-entry-description">
    The G6Lite Skill helps an AI agent identify data scale, layout, interaction, and browser
    boundaries before it generates an implementation through the current package-root API.
  </div>

  <div className="ai-entry-actions">
    <a href="https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph">
      View the G6Lite Skill
    </a>

    <a className="is-secondary" href="https://sive.antv.antgroup.com/qa?message=Use%20G6Lite%20to%20create%20a%20relationship%20graph.%20First%20confirm%20the%20data%20scale%2C%20layout%2C%20interactions%2C%20and%20compatibility%20requirements%2C%20then%20provide%20a%20package-root%20API%20example.">
      Start in Sive
    </a>
  </div>
</div>

## Two ways to use it [#two-ways-to-use-it]

<Cards>
  <Card title="Local agent + G6Lite Skill" href="https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph">
    Keep implementation aligned with G6Lite's real API, capability boundary, and performance paths.
  </Card>

  <Card title="Ask Sive online" href="https://sive.antv.antgroup.com/qa?message=Use%20G6Lite%20to%20create%20a%20relationship%20graph.%20First%20confirm%20the%20data%20scale%2C%20layout%2C%20interactions%2C%20and%20compatibility%20requirements%2C%20then%20provide%20a%20package-root%20API%20example.">
    Start an online question with G6Lite context. Answers depend on Sive's current knowledge state.
  </Card>

  <Card title="Understand the architecture" href="/en/docs/concepts/architecture">
    See how data, layout, scheduling, WebGL rendering, Canvas information layers, and extensions
    work together.
  </Card>
</Cards>

## Use the Skill locally [#use-the-skill-locally]

Provide the GitHub [`skills/antv-g6lite-graph`](https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph)
directory as a Skill source to a compatible agent, then invoke it explicitly:

```text
Use $antv-g6lite-graph to build a force-directed dependency graph
with hover highlighting and node dragging.
```

You can also ask an agent to install it directly from GitHub:

```text
Install the skill from
https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph
```

The Skill keeps the agent focused on these constraints:

* Import only from the `@antv/g6-lite` package root, never `src/` or `dist/` internals.
* Use ESM and a real browser lifecycle with DOM, Canvas, and WebGL.
* Generate only the node, edge, layout, Behavior, Combo, and extension capabilities G6Lite supports.
* Distinguish G6Lite from G6 v5 instead of copying plugin, event, or element configuration.
* For large graphs, examine layout, label density, incremental updates, DPR, GPU, and real devices.

## Good agent tasks [#good-agent-tasks]

| Task                        | Include in the prompt                                            |
| --------------------------- | ---------------------------------------------------------------- |
| Create a relationship graph | Data fields, node/edge count, layout, container size             |
| Add interactions            | Selection, drag, tooltip, highlight, brush, or lasso             |
| Migrate from G6 v5          | List capability differences and unsupported needs before editing |
| Diagnose a blank canvas     | Container size, endpoints, WebGL, lifecycle, and version         |
| Optimize a large graph      | First render, layout, labels, state patches, memory, and devices |
| Create an extension         | Category, lifecycle, public ExtensionContext, and cleanup        |

## Recommended workflow [#recommended-workflow]

<div className="ai-workflow not-prose">
  <ol>
    <li>
      <strong>
        Clarify input
      </strong>

      <span>
        Confirm data, scale, coordinates, layout, interactions, and runtime.
      </span>
    </li>

    <li>
      <strong>
        Render the minimum
      </strong>

      <span>
        Prove a visible, disposable graph through package-root APIs.
      </span>
    </li>

    <li>
      <strong>
        Add layers
      </strong>

      <span>
        Introduce styling, layout, behaviors, states, Combo, and extensions in sequence.
      </span>
    </li>

    <li>
      <strong>
        Validate for real
      </strong>

      <span>
        Check the target browser, DPR, GPU, and container dimensions.
      </span>
    </li>
  </ol>
</div>

AI-generated code still needs type checking, browser validation, and product-data review. Do not treat agent output as a production result by itself.

## The engine an agent should understand [#the-engine-an-agent-should-understand]

<ArchitectureDiagram locale="en" />

The diagram shows stable responsibilities only. See [Technical architecture](/en/docs/concepts/architecture) for data flow, update paths, and extension boundaries.

## Continue learning [#continue-learning]

<Cards>
  <Card title="Install and render a graph" href="/en/docs/getting-started/quick-start" />

  <Card title="Technical architecture" href="/en/docs/concepts/architecture" />

  <Card title="Examples" href="/en/docs/examples" />

  <Card title="API reference" href="/en/docs/api" />

  <Card title="Performance tuning" href="/en/docs/metrics/performance-tuning" />

  <Card title="Migrate from G6 v5" href="/en/docs/compatibility/g6-v5-migration" />
</Cards>
