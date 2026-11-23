# G6Lite AI Guide (/en/docs/ai)



<span id="two-ways-to-use-it" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="the-engine-an-agent-should-understand" style="{ display: 'block', scrollMarginTop: '8rem' }" />

## AI Skill [#ai-skill]

G6Lite provides an [AI Skill](https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph) (`antv-g6lite-graph`) that helps you build graphs in your project, add interactions like dragging and zooming to existing graphs, and troubleshoot rendering issues.

<span id="use-the-skill-locally" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### Install and use the Skill [#install-and-use-the-skill]

Run this command in your project directory to install the Skill for a coding assistant that supports Skills.

```bash
npx skills add antvis/G6Lite --skill antv-g6lite-graph
```

<span id="recommended-workflow" style="{ display: 'block', scrollMarginTop: '8rem' }" />

Open the project in your coding assistant and ask it to use `antv-g6lite-graph`. For a new graph, share sample nodes and edges along with the layout and interactions you want. For an existing graph, include the component path and any behavior to preserve. For a bug, include the error and steps to reproduce it.

<span id="good-agent-tasks" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### Example prompt [#example-prompt]

```text
Use the G6Lite Skill (antv-g6lite-graph) to build a React + TypeScript component for the version of @antv/g6-lite installed in this project.
- Start with three nodes (A, B, C) and two edges (A→B, A→C).
- Arrange the nodes in a circle, show their IDs, and enable zooming, panning, and node dragging.
- Add an “Add node” button that inserts node D and edge B→D while keeping the current zoom and position.
- Create the graph in the browser. Clean up the canvas and event listeners when the component unmounts.
Provide the full component and instructions to run it.
```

## Sive Online Q\&A [#sive-online-qa]

Open [Sive online Q\&A](https://sive.antv.antgroup.com/qa) to ask how an API works or get a short example. For project-specific questions, include your G6Lite version, framework, and the relevant code.

Try one of these questions.

* “How do I enable node dragging in G6Lite? Show the smallest configuration that works.”
* “How do I keep the current zoom and position when updating nodes and edges with `setData()`? Show an example.”
* “Where should I call `destroy()` when leaving a page in React? How do I handle a render that is still in progress?”

<span id="continue-learning" style="{ display: 'block', scrollMarginTop: '8rem' }" />

Check the example against the reference for [interaction options](/en/docs/api/options#options-behaviors), [setData()](/en/docs/api/graph#graph-data-mutations-setdata), or [destroy()](/en/docs/api/graph#graph-lifecycle-destroy), then try the relevant code in your project.
