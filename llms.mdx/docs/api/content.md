# API 参考 (/docs/api)



# @antv/g6-lite [#antvg6-lite]

## Classes [#classes]

### EventEmitter [#eventemitter]

Defined in: [events.ts:28](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/events.ts#L28)

@antv/g6-lite
A high-performance graph analysis engine based on WebGL, designed for large-scale graph data analysis.

Public API surface is being re-baselined during the 0.1.0 beta period.
Engine internals are excluded from the package root and published API
declarations; consume supported APIs only through this entry point.

#### Constructors [#constructors]

##### Constructor [#constructor]

```ts
new EventEmitter(): EventEmitter;
```

###### Returns [#returns]

[`EventEmitter`](#eventemitter)

#### Methods [#methods]

##### on() [#on]

```ts
on<Args>(event: string, handler: Handler<Args>): void;
```

Defined in: [events.ts:31](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/events.ts#L31)

###### Type Parameters [#type-parameters]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

###### Parameters [#parameters]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `event`   | `string`                       |
| `handler` | [`Handler`](#handler)\<`Args`> |

###### Returns [#returns-1]

`void`

##### off() [#off]

```ts
off<Args>(event: string, handler: Handler<Args>): void;
```

Defined in: [events.ts:35](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/events.ts#L35)

###### Type Parameters [#type-parameters-1]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

###### Parameters [#parameters-1]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `event`   | `string`                       |
| `handler` | [`Handler`](#handler)\<`Args`> |

###### Returns [#returns-2]

`void`

##### once() [#once]

```ts
once<Args>(event: string, handler: Handler<Args>): void;
```

Defined in: [events.ts:39](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/events.ts#L39)

###### Type Parameters [#type-parameters-2]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

###### Parameters [#parameters-2]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `event`   | `string`                       |
| `handler` | [`Handler`](#handler)\<`Args`> |

###### Returns [#returns-3]

`void`

##### emit() [#emit]

```ts
emit<Args>(event: string, ...args: Args): void;
```

Defined in: [events.ts:43](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/events.ts#L43)

###### Type Parameters [#type-parameters-3]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

###### Parameters [#parameters-3]

| Parameter | Type     |
| --------- | -------- |
| `event`   | `string` |
| ...`args` | `Args`   |

###### Returns [#returns-4]

`void`

##### removeAllListeners() [#removealllisteners]

```ts
removeAllListeners(event?: string): void;
```

Defined in: [events.ts:47](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/events.ts#L47)

###### Parameters [#parameters-4]

| Parameter | Type     |
| --------- | -------- |
| `event?`  | `string` |

###### Returns [#returns-5]

`void`

***

### ~~`abstract` BaseNode~~ [#abstract-basenode]

Defined in: [extensions/node.ts:39](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L39)

#### Deprecated [#deprecated]

Define a NodeExtension object or factory and register it with register('node', ...).

#### Extended by [#extended-by]

* [`BreathingNode`](#breathingnode)

#### Implements [#implements]

* [`NodeExtension`](#nodeextension)

#### Constructors [#constructors-1]

##### Constructor [#constructor-1]

```ts
new BaseNode(): BaseNode;
```

###### Returns [#returns-6]

[`BaseNode`](#abstract-basenode)

#### Properties [#properties]

##### ~~base~~ [#base]

```ts
base: "circle" | "rect" = 'circle';
```

Defined in: [extensions/node.ts:40](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L40)

###### Implementation of [#implementation-of]

[`NodeExtension`](#nodeextension).[`base`](#base-1)

##### ~~style?~~ [#style]

```ts
optional style?: Partial<NodeStyleConfig>;
```

Defined in: [extensions/node.ts:41](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L41)

###### Implementation of [#implementation-of-1]

[`NodeExtension`](#nodeextension).[`style`](#style-1)

##### ~~stateStyles?~~ [#statestyles]

```ts
optional stateStyles?: Partial<Record<string, NodeStateStyleOverride>>;
```

Defined in: [extensions/node.ts:42](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L42)

###### Implementation of [#implementation-of-2]

[`NodeExtension`](#nodeextension).[`stateStyles`](#statestyles-1)

#### Methods [#methods-1]

##### ~~getStyle()?~~ [#getstyle]

```ts
optional getStyle(_node: GraphNode): Partial<NodeStyleConfig>;
```

Defined in: [extensions/node.ts:44](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L44)

###### Parameters [#parameters-5]

| Parameter | Type                      |
| --------- | ------------------------- |
| `_node`   | [`GraphNode`](#graphnode) |

###### Returns [#returns-7]

`Partial`\<[`NodeStyleConfig`](#nodestyleconfig)>

###### Implementation of [#implementation-of-3]

[`NodeExtension`](#nodeextension).[`getStyle`](#getstyle-1)

##### ~~getBoundaryAnchor()?~~ [#getboundaryanchor]

```ts
optional getBoundaryAnchor(_params: NodeBoundaryAnchorParams): {
  x: number;
  y: number;
};
```

Defined in: [extensions/node.ts:45](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L45)

Returns a screen-space offset from the node center to its visual boundary.

###### Parameters [#parameters-6]

| Parameter | Type                                                    |
| --------- | ------------------------------------------------------- |
| `_params` | [`NodeBoundaryAnchorParams`](#nodeboundaryanchorparams) |

###### Returns [#returns-8]

```ts
{
  x: number;
  y: number;
}
```

###### ~~x~~ [#x]

```ts
x: number;
```

###### ~~y~~ [#y]

```ts
y: number;
```

###### Implementation of [#implementation-of-4]

[`NodeExtension`](#nodeextension).[`getBoundaryAnchor`](#getboundaryanchor)

##### ~~drawOverlay()?~~ [#drawoverlay]

```ts
optional drawOverlay(_ctx: CanvasRenderingContext2D, _params: NodeOverlayDrawParams): boolean | void;
```

Defined in: [extensions/node.ts:46](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L46)

###### Parameters [#parameters-7]

| Parameter | Type                                              |
| --------- | ------------------------------------------------- |
| `_ctx`    | `CanvasRenderingContext2D`                        |
| `_params` | [`NodeOverlayDrawParams`](#nodeoverlaydrawparams) |

###### Returns [#returns-9]

`boolean` | `void`

###### Implementation of [#implementation-of-5]

[`NodeExtension`](#nodeextension).[`drawOverlay`](#drawoverlay)

***

### ~~BreathingNode~~ [#breathingnode]

Defined in: [extensions/node.ts:127](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L127)

#### Deprecated [#deprecated-1]

Use the built-in `breathing-node` type or a NodeExtension object.
This class remains only for beta compatibility.

#### Extends [#extends]

* [`BaseNode`](#abstract-basenode)

#### Constructors [#constructors-2]

##### Constructor [#constructor-2]

```ts
new BreathingNode(): BreathingNode;
```

###### Returns [#returns-10]

[`BreathingNode`](#breathingnode)

###### Inherited from [#inherited-from]

[`BaseNode`](#abstract-basenode).[`constructor`](#constructor-1)

#### Properties [#properties-1]

##### ~~style?~~ [#style-1]

```ts
optional style?: Partial<NodeStyleConfig>;
```

Defined in: [extensions/node.ts:41](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L41)

###### Inherited from [#inherited-from-1]

[`BaseNode`](#abstract-basenode).[`style`](#style-2)

##### ~~base~~ [#base-1]

```ts
base: "circle" = breathingNodeExtension.base;
```

Defined in: [extensions/node.ts:128](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L128)

###### Overrides [#overrides]

[`BaseNode`](#abstract-basenode).[`base`](#base-2)

##### ~~stateStyles~~ [#statestyles-1]

```ts
stateStyles: Partial<Record<string, NodeStateStyleOverride>> = breathingNodeStateStyles;
```

Defined in: [extensions/node.ts:129](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L129)

###### Overrides [#overrides-1]

[`BaseNode`](#abstract-basenode).[`stateStyles`](#statestyles-2)

##### ~~drawOverlay~~ [#drawoverlay-1]

```ts
drawOverlay: (ctx: CanvasRenderingContext2D, params: NodeOverlayDrawParams) => boolean = drawBreathingNodeOverlay;
```

Defined in: [extensions/node.ts:130](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L130)

###### Parameters [#parameters-8]

| Parameter | Type                                              |
| --------- | ------------------------------------------------- |
| `ctx`     | `CanvasRenderingContext2D`                        |
| `params`  | [`NodeOverlayDrawParams`](#nodeoverlaydrawparams) |

###### Returns [#returns-11]

`boolean`

###### Overrides [#overrides-2]

[`BaseNode`](#abstract-basenode).[`drawOverlay`](#drawoverlay-1)

#### Methods [#methods-2]

##### ~~getStyle()?~~ [#getstyle-1]

```ts
optional getStyle(_node: GraphNode): Partial<NodeStyleConfig>;
```

Defined in: [extensions/node.ts:44](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L44)

###### Parameters [#parameters-9]

| Parameter | Type                      |
| --------- | ------------------------- |
| `_node`   | [`GraphNode`](#graphnode) |

###### Returns [#returns-12]

`Partial`\<[`NodeStyleConfig`](#nodestyleconfig)>

###### Inherited from [#inherited-from-2]

[`BaseNode`](#abstract-basenode).[`getStyle`](#getstyle-2)

##### ~~getBoundaryAnchor()?~~ [#getboundaryanchor-1]

```ts
optional getBoundaryAnchor(_params: NodeBoundaryAnchorParams): {
  x: number;
  y: number;
};
```

Defined in: [extensions/node.ts:45](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L45)

Returns a screen-space offset from the node center to its visual boundary.

###### Parameters [#parameters-10]

| Parameter | Type                                                    |
| --------- | ------------------------------------------------------- |
| `_params` | [`NodeBoundaryAnchorParams`](#nodeboundaryanchorparams) |

###### Returns [#returns-13]

```ts
{
  x: number;
  y: number;
}
```

###### ~~x~~ [#x-1]

```ts
x: number;
```

###### ~~y~~ [#y-1]

```ts
y: number;
```

###### Inherited from [#inherited-from-3]

[`BaseNode`](#abstract-basenode).[`getBoundaryAnchor`](#getboundaryanchor-1)

***

### Graph [#graph]

Defined in: [graph.ts:75](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L75)

#### Constructors [#constructors-3]

##### Constructor [#constructor-3]

```ts
new Graph(options: GraphOptions): Graph;
```

Defined in: [graph.ts:102](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L102)

###### Parameters [#parameters-11]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `options` | [`GraphOptions`](#graphoptions) |

###### Returns [#returns-14]

[`Graph`](#graph-1)

#### Accessors [#accessors]

##### destroyed [#destroyed]

###### Get Signature [#get-signature]

```ts
get destroyed(): boolean;
```

Defined in: [graph.ts:109](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L109)

###### Returns [#returns-15]

`boolean`

#### Methods [#methods-3]

##### ~~isDestroyed()~~ [#isdestroyed]

```ts
isDestroyed(): boolean;
```

Defined in: [graph.ts:114](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L114)

###### Returns [#returns-16]

`boolean`

###### Deprecated [#deprecated-2]

Use the `destroyed` property.

##### render() [#render]

```ts
render(): Promise<void>;
```

Defined in: [graph.ts:118](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L118)

###### Returns [#returns-17]

`Promise`\<`void`>

##### destroy() [#destroy]

```ts
destroy(): void;
```

Defined in: [graph.ts:166](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L166)

###### Returns [#returns-18]

`void`

##### getData() [#getdata]

```ts
getData(): GraphData;
```

Defined in: [graph.ts:185](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L185)

###### Returns [#returns-19]

[`GraphData`](#graphdata)

##### ~~toData()~~ [#todata]

```ts
toData(): GraphData;
```

Defined in: [graph.ts:190](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L190)

###### Returns [#returns-20]

[`GraphData`](#graphdata)

###### Deprecated [#deprecated-3]

Use getData().

##### setData() [#setdata]

```ts
setData(data: GraphData, options?: SetDataOptions): Promise<void>;
```

Defined in: [graph.ts:197](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L197)

Replace all graph data at runtime. Runs layout if configured, then triggers full re-render.

###### Parameters [#parameters-12]

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `data`    | [`GraphData`](#graphdata)           |
| `options` | [`SetDataOptions`](#setdataoptions) |

###### Returns [#returns-21]

`Promise`\<`void`>

##### updateOptions() [#updateoptions]

```ts
updateOptions(opts: Partial<Pick<GraphOptions, "node" | "edge" | "label" | "theme">>): void;
```

Defined in: [graph.ts:221](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L221)

Update node, edge, label, and theme visual options, then fully re-process styles.

###### Parameters [#parameters-13]

| Parameter | Type                                                                                                 |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `opts`    | `Partial`\<`Pick`\<[`GraphOptions`](#graphoptions), `"node"` \| `"edge"` \| `"label"` \| `"theme"`>> |

###### Returns [#returns-22]

`void`

##### refresh() [#refresh]

```ts
refresh(): void;
```

Defined in: [graph.ts:263](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L263)

Force a full re-render. Use sparingly — the scheduler handles this automatically.

###### Returns [#returns-23]

`void`

##### getNodes() [#getnodes]

```ts
getNodes(): readonly NodeModel[];
```

Defined in: [graph.ts:272](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L272)

Get all read-only normalized node views.

###### Returns [#returns-24]

readonly [`NodeModel`](#nodemodel)\[]

##### getNodeData() [#getnodedata]

```ts
getNodeData(id: string): NodeModel | undefined;
```

Defined in: [graph.ts:277](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L277)

Get a read-only normalized node model by ID. O(1) lookup.

###### Parameters [#parameters-14]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-25]

[`NodeModel`](#nodemodel) | `undefined`

##### getEdges() [#getedges]

```ts
getEdges(): readonly EdgeModel[];
```

Defined in: [graph.ts:282](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L282)

Get all read-only normalized edge views.

###### Returns [#returns-26]

readonly [`EdgeModel`](#edgemodel)\[]

##### getEdgeData() [#getedgedata]

```ts
getEdgeData(id: string): EdgeModel | undefined;
```

Defined in: [graph.ts:287](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L287)

Get a read-only normalized edge model by ID. O(1) lookup.

###### Parameters [#parameters-15]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-27]

[`EdgeModel`](#edgemodel) | `undefined`

##### getComboData() [#getcombodata]

```ts
getComboData(id: string): ComboModel | undefined;
```

Defined in: [graph.ts:292](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L292)

Get a read-only normalized combo model by ID.

###### Parameters [#parameters-16]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-28]

[`ComboModel`](#combomodel) | `undefined`

##### getElementData() [#getelementdata]

```ts
getElementData(id: string): ElementModel | undefined;
```

Defined in: [graph.ts:297](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L297)

Get a read-only normalized element model by ID.

###### Parameters [#parameters-17]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-29]

[`ElementModel`](#elementmodel) | `undefined`

##### getNodeCount() [#getnodecount]

```ts
getNodeCount(): number;
```

Defined in: [graph.ts:306](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L306)

Get the total number of nodes.

###### Returns [#returns-30]

`number`

##### getEdgeCount() [#getedgecount]

```ts
getEdgeCount(): number;
```

Defined in: [graph.ts:313](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L313)

Get the total number of edges.

###### Returns [#returns-31]

`number`

##### hasNode() [#hasnode]

```ts
hasNode(id: string): boolean;
```

Defined in: [graph.ts:320](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L320)

Check if a node exists in the graph.

###### Parameters [#parameters-18]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-32]

`boolean`

##### hasEdge() [#hasedge]

```ts
hasEdge(id: string): boolean;
```

Defined in: [graph.ts:324](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L324)

###### Parameters [#parameters-19]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-33]

`boolean`

##### hasElement() [#haselement]

```ts
hasElement(id: string): boolean;
```

Defined in: [graph.ts:328](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L328)

###### Parameters [#parameters-20]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-34]

`boolean`

##### getElementPosition() [#getelementposition]

```ts
getElementPosition(id: string): 
  | {
  x: number;
  y: number;
}
  | null;
```

Defined in: [graph.ts:335](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L335)

Get the position of a node or Combo. Edges do not have a single position.

###### Parameters [#parameters-21]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-35]

\| \{
`x`: `number`;
`y`: `number`;
}
\| `null`

##### ~~getNodePosition()~~ [#getnodeposition]

```ts
getNodePosition(id: string): 
  | {
  x: number;
  y: number;
}
  | null;
```

Defined in: [graph.ts:343](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L343)

###### Parameters [#parameters-22]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-36]

\| \{
`x`: `number`;
`y`: `number`;
}
\| `null`

###### Deprecated [#deprecated-4]

Use getElementPosition().

##### getNeighborNodes() [#getneighbornodes]

```ts
getNeighborNodes(nodeId: string): string[];
```

Defined in: [graph.ts:352](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L352)

Get all neighbor node IDs of a given node.

###### Parameters [#parameters-23]

| Parameter | Type     |
| --------- | -------- |
| `nodeId`  | `string` |

###### Returns [#returns-37]

`string`\[]

##### getAdjacentEdges() [#getadjacentedges]

```ts
getAdjacentEdges(nodeId: string): {
  id: string;
  source: string;
  target: string;
}[];
```

Defined in: [graph.ts:360](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L360)

Get all edges connected to a given node.

###### Parameters [#parameters-24]

| Parameter | Type     |
| --------- | -------- |
| `nodeId`  | `string` |

###### Returns [#returns-38]

\{
`id`: `string`;
`source`: `string`;
`target`: `string`;
}\[]

##### addNode() [#addnode]

```ts
addNode(node: {
  id: string;
  x: number;
  y: number;
  data?: Record<string, unknown>;
}): void;
```

Defined in: [graph.ts:373](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L373)

Add a single node. Triggers partial process on next frame.
The node must have a unique id and x,y coordinates.

###### Parameters [#parameters-25]

| Parameter    | Type                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| `node`       | \{ `id`: `string`; `x`: `number`; `y`: `number`; `data?`: `Record`\<`string`, `unknown`>; } |
| `node.id`    | `string`                                                                                    |
| `node.x`     | `number`                                                                                    |
| `node.y`     | `number`                                                                                    |
| `node.data?` | `Record`\<`string`, `unknown`>                                                              |

###### Returns [#returns-39]

`void`

##### addNodes() [#addnodes]

```ts
addNodes(nodes: {
  id: string;
  x: number;
  y: number;
  data?: Record<string, unknown>;
}[]): void;
```

Defined in: [graph.ts:385](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L385)

Add multiple nodes in one batch. More efficient than calling addNode repeatedly
because it triggers a single render.

###### Parameters [#parameters-26]

| Parameter | Type                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------- |
| `nodes`   | \{ `id`: `string`; `x`: `number`; `y`: `number`; `data?`: `Record`\<`string`, `unknown`>; }\[] |

###### Returns [#returns-40]

`void`

##### updateNodePosition() [#updatenodeposition]

```ts
updateNodePosition(
   id: string, 
   x: number, 
   y: number): void;
```

Defined in: [graph.ts:402](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L402)

Update a node's position. Triggers position patch on next frame —
much cheaper than full process since it only patches the position floats
in the GPU buffer.

###### Parameters [#parameters-27]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |
| `x`       | `number` |
| `y`       | `number` |

###### Returns [#returns-41]

`void`

##### updateNodePositions() [#updatenodepositions]

```ts
updateNodePositions(updates: NodePositionUpdate[]): void;
```

Defined in: [graph.ts:410](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L410)

###### Parameters [#parameters-28]

| Parameter | Type                                           |
| --------- | ---------------------------------------------- |
| `updates` | [`NodePositionUpdate`](#nodepositionupdate)\[] |

###### Returns [#returns-42]

`void`

##### updateNodeData() [#updatenodedata]

###### Call Signature [#call-signature]

```ts
updateNodeData(id: string, data: Record<string, unknown>): void;
```

Defined in: [graph.ts:424](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L424)

Update a node's custom data. May affect style if the style function depends on data.
Triggers partial process on next frame.

###### Parameters [#parameters-29]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `id`      | `string`                       |
| `data`    | `Record`\<`string`, `unknown`> |

###### Returns [#returns-43]

`void`

###### Call Signature [#call-signature-1]

```ts
updateNodeData(updates: NodeDataUpdate[]): void;
```

Defined in: [graph.ts:426](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L426)

Update a node's custom data. May affect style if the style function depends on data.
Triggers partial process on next frame.

###### Parameters [#parameters-30]

| Parameter | Type                                   |
| --------- | -------------------------------------- |
| `updates` | [`NodeDataUpdate`](#nodedataupdate)\[] |

###### Returns [#returns-44]

`void`

##### removeNode() [#removenode]

```ts
removeNode(id: string): void;
```

Defined in: [graph.ts:443](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L443)

Remove a node and all its connected edges. Triggers partial process on next frame.

###### Parameters [#parameters-31]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-45]

`void`

##### removeNodes() [#removenodes]

```ts
removeNodes(ids: string[]): void;
```

Defined in: [graph.ts:455](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L455)

Remove multiple nodes and their connected edges in one batch.

###### Parameters [#parameters-32]

| Parameter | Type        |
| --------- | ----------- |
| `ids`     | `string`\[] |

###### Returns [#returns-46]

`void`

##### addEdge() [#addedge]

```ts
addEdge(edge: {
  id?: string;
  source: string;
  target: string;
  data?: Record<string, unknown>;
  states?: ElementState[];
}): string;
```

Defined in: [graph.ts:469](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L469)

Add an edge between two existing nodes. Returns the auto-generated edge ID.

###### Parameters [#parameters-33]

| Parameter      | Type                                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `edge`         | \{ `id?`: `string`; `source`: `string`; `target`: `string`; `data?`: `Record`\<`string`, `unknown`>; `states?`: [`ElementState`](#elementstate)\[]; } |
| `edge.id?`     | `string`                                                                                                                                              |
| `edge.source`  | `string`                                                                                                                                              |
| `edge.target`  | `string`                                                                                                                                              |
| `edge.data?`   | `Record`\<`string`, `unknown`>                                                                                                                        |
| `edge.states?` | [`ElementState`](#elementstate)\[]                                                                                                                    |

###### Returns [#returns-47]

`string`

##### addEdges() [#addedges]

```ts
addEdges(edges: {
  id?: string;
  source: string;
  target: string;
  data?: Record<string, unknown>;
  states?: ElementState[];
}[]): string[];
```

Defined in: [graph.ts:493](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L493)

Add multiple edges in one batch. Returns the auto-generated edge IDs.

###### Parameters [#parameters-34]

| Parameter | Type                                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `edges`   | \{ `id?`: `string`; `source`: `string`; `target`: `string`; `data?`: `Record`\<`string`, `unknown`>; `states?`: [`ElementState`](#elementstate)\[]; }\[] |

###### Returns [#returns-48]

`string`\[]

##### updateEdgeData() [#updateedgedata]

###### Call Signature [#call-signature-2]

```ts
updateEdgeData(id: string, data: Record<string, unknown>): void;
```

Defined in: [graph.ts:518](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L518)

###### Parameters [#parameters-35]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `id`      | `string`                       |
| `data`    | `Record`\<`string`, `unknown`> |

###### Returns [#returns-49]

`void`

###### Call Signature [#call-signature-3]

```ts
updateEdgeData(updates: EdgeDataUpdate[]): void;
```

Defined in: [graph.ts:520](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L520)

###### Parameters [#parameters-36]

| Parameter | Type                                   |
| --------- | -------------------------------------- |
| `updates` | [`EdgeDataUpdate`](#edgedataupdate)\[] |

###### Returns [#returns-50]

`void`

##### removeEdge() [#removeedge]

```ts
removeEdge(id: string): void;
```

Defined in: [graph.ts:538](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L538)

Remove an edge by its auto-generated ID.

###### Parameters [#parameters-37]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-51]

`void`

##### removeEdges() [#removeedges]

```ts
removeEdges(ids: string[]): void;
```

Defined in: [graph.ts:550](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L550)

Remove multiple edges by their IDs.

###### Parameters [#parameters-38]

| Parameter | Type        |
| --------- | ----------- |
| `ids`     | `string`\[] |

###### Returns [#returns-52]

`void`

##### setItemState() [#setitemstate]

```ts
setItemState(
   id: string, 
   state: ElementState, 
   value: boolean): void;
```

Defined in: [graph.ts:564](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L564)

Set or clear one state on a node, edge, or Combo.

###### Parameters [#parameters-39]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `id`      | `string`                        |
| `state`   | [`ElementState`](#elementstate) |
| `value`   | `boolean`                       |

###### Returns [#returns-53]

`void`

##### clearItemStates() [#clearitemstates]

```ts
clearItemStates(id: string): void;
```

Defined in: [graph.ts:584](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L584)

Clear all states on a node, edge, or Combo.

###### Parameters [#parameters-40]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-54]

`void`

##### batchSetState() [#batchsetstate]

```ts
batchSetState(items: {
  id: string;
  state: ElementState;
  value: boolean;
}[]): void;
```

Defined in: [graph.ts:606](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L606)

Set states on multiple items in a single batch, triggering only one render.

###### Parameters [#parameters-41]

| Parameter | Type                                                                                  |
| --------- | ------------------------------------------------------------------------------------- |
| `items`   | \{ `id`: `string`; `state`: [`ElementState`](#elementstate); `value`: `boolean`; }\[] |

###### Returns [#returns-55]

`void`

##### setElementStates() [#setelementstates]

###### Call Signature [#call-signature-4]

```ts
setElementStates(id: string, states: ElementState[]): void;
```

Defined in: [graph.ts:630](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L630)

Replace the complete state set of one or more nodes, edges, or Combos.

###### Parameters [#parameters-42]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `id`      | `string`                           |
| `states`  | [`ElementState`](#elementstate)\[] |

###### Returns [#returns-56]

`void`

###### Call Signature [#call-signature-5]

```ts
setElementStates(stateMap: Record<string, ElementState[]>): void;
```

Defined in: [graph.ts:632](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L632)

Replace the complete state set of one or more nodes, edges, or Combos.

###### Parameters [#parameters-43]

| Parameter  | Type                                                    |
| ---------- | ------------------------------------------------------- |
| `stateMap` | `Record`\<`string`, [`ElementState`](#elementstate)\[]> |

###### Returns [#returns-57]

`void`

##### getItemStates() [#getitemstates]

```ts
getItemStates(id: string): ElementState[];
```

Defined in: [graph.ts:663](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L663)

Get all active states on a node, edge, or Combo.

###### Parameters [#parameters-44]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-58]

[`ElementState`](#elementstate)\[]

##### findNodesByState() [#findnodesbystate]

```ts
findNodesByState(state: ElementState): string[];
```

Defined in: [graph.ts:678](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L678)

Find all node IDs that have the given state.
Example: graph.findNodesByState('selected') → \['node1', 'node3']

###### Parameters [#parameters-45]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `state`   | [`ElementState`](#elementstate) |

###### Returns [#returns-59]

`string`\[]

##### findEdgesByState() [#findedgesbystate]

```ts
findEdgesByState(state: ElementState): string[];
```

Defined in: [graph.ts:687](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L687)

Find all edge IDs that have the given state.
Example: graph.findEdgesByState('active') → \['e0', 'e5']

###### Parameters [#parameters-46]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `state`   | [`ElementState`](#elementstate) |

###### Returns [#returns-60]

`string`\[]

##### findCombosByState() [#findcombosbystate]

```ts
findCombosByState(state: ElementState): string[];
```

Defined in: [graph.ts:695](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L695)

Find all combo IDs that have the given state.

###### Parameters [#parameters-47]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `state`   | [`ElementState`](#elementstate) |

###### Returns [#returns-61]

`string`\[]

##### hideItem() [#hideitem]

```ts
hideItem(id: string): void;
```

Defined in: [graph.ts:701](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L701)

Hide a node, edge, or Combo through the `hidden` state.

###### Parameters [#parameters-48]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-62]

`void`

##### showItem() [#showitem]

```ts
showItem(id: string): void;
```

Defined in: [graph.ts:706](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L706)

Show a previously hidden node, edge, or Combo.

###### Parameters [#parameters-49]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-63]

`void`

##### focusItem() [#focusitem]

```ts
focusItem(id: string | string[], padding?: number): void;
```

Defined in: [graph.ts:714](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L714)

Center the viewport on one or more nodes. The current zoom is preserved when
the targets fit; otherwise the viewport zooms out just enough to honor padding.

###### Parameters [#parameters-50]

| Parameter | Type                    | Default value |
| --------- | ----------------------- | ------------- |
| `id`      | `string` \| `string`\[] | `undefined`   |
| `padding` | `number`                | `20`          |

###### Returns [#returns-64]

`void`

##### createCombo() [#createcombo]

```ts
createCombo(combo: ComboData, childNodeIds?: string[]): void;
```

Defined in: [graph.ts:756](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L756)

###### Parameters [#parameters-51]

| Parameter       | Type                      |
| --------------- | ------------------------- |
| `combo`         | [`ComboData`](#combodata) |
| `childNodeIds?` | `string`\[]               |

###### Returns [#returns-65]

`void`

##### removeCombo() [#removecombo]

```ts
removeCombo(comboId: string): void;
```

Defined in: [graph.ts:774](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L774)

###### Parameters [#parameters-52]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-66]

`void`

##### addToCombo() [#addtocombo]

```ts
addToCombo(nodeId: string, comboId: string): void;
```

Defined in: [graph.ts:785](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L785)

###### Parameters [#parameters-53]

| Parameter | Type     |
| --------- | -------- |
| `nodeId`  | `string` |
| `comboId` | `string` |

###### Returns [#returns-67]

`void`

##### removeFromCombo() [#removefromcombo]

```ts
removeFromCombo(nodeId: string): void;
```

Defined in: [graph.ts:797](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L797)

###### Parameters [#parameters-54]

| Parameter | Type     |
| --------- | -------- |
| `nodeId`  | `string` |

###### Returns [#returns-68]

`void`

##### getComboChildren() [#getcombochildren]

```ts
getComboChildren(id: string): {
  nodes: string[];
  combos: string[];
};
```

Defined in: [graph.ts:808](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L808)

###### Parameters [#parameters-55]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-69]

```ts
{
  nodes: string[];
  combos: string[];
}
```

###### nodes [#nodes]

```ts
nodes: string[];
```

###### combos [#combos]

```ts
combos: string[];
```

##### getNodeCombo() [#getnodecombo]

```ts
getNodeCombo(nodeId: string): string | undefined;
```

Defined in: [graph.ts:817](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L817)

###### Parameters [#parameters-56]

| Parameter | Type     |
| --------- | -------- |
| `nodeId`  | `string` |

###### Returns [#returns-70]

`string` | `undefined`

##### collapseCombo() [#collapsecombo]

```ts
collapseCombo(comboId: string): void;
```

Defined in: [graph.ts:821](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L821)

###### Parameters [#parameters-57]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-71]

`void`

##### expandCombo() [#expandcombo]

```ts
expandCombo(comboId: string): void;
```

Defined in: [graph.ts:835](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L835)

###### Parameters [#parameters-58]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-72]

`void`

##### toggleCombo() [#togglecombo]

```ts
toggleCombo(comboId: string): void;
```

Defined in: [graph.ts:849](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L849)

###### Parameters [#parameters-59]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-73]

`void`

##### ~~setComboState()~~ [#setcombostate]

```ts
setComboState(
   comboId: string, 
   state: ElementState, 
   value: boolean): void;
```

Defined in: [graph.ts:861](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L861)

###### Parameters [#parameters-60]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `comboId` | `string`                        |
| `state`   | [`ElementState`](#elementstate) |
| `value`   | `boolean`                       |

###### Returns [#returns-74]

`void`

###### Deprecated [#deprecated-5]

Use setItemState(), which supports Combos.

##### ~~clearComboStates()~~ [#clearcombostates]

```ts
clearComboStates(comboId: string): void;
```

Defined in: [graph.ts:868](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L868)

###### Parameters [#parameters-61]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-75]

`void`

###### Deprecated [#deprecated-6]

Use clearItemStates(), which supports Combos.

##### ~~getComboStates()~~ [#getcombostates]

```ts
getComboStates(comboId: string): ElementState[];
```

Defined in: [graph.ts:875](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L875)

###### Parameters [#parameters-62]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-76]

[`ElementState`](#elementstate)\[]

###### Deprecated [#deprecated-7]

Use getItemStates(), which supports Combos.

##### setLayout() [#setlayout]

```ts
setLayout(config: LayoutConfig): void;
```

Defined in: [graph.ts:885](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L885)

Set the layout configuration. Does not execute layout — call layout() after.

###### Parameters [#parameters-63]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `config`  | [`LayoutConfig`](#layoutconfig) |

###### Returns [#returns-77]

`void`

##### layout() [#layout]

```ts
layout(): Promise<void>;
```

Defined in: [graph.ts:893](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L893)

Execute the current layout algorithm and update node positions.

###### Returns [#returns-78]

`Promise`\<`void`>

##### cancelLayout() [#cancellayout]

```ts
cancelLayout(): void;
```

Defined in: [graph.ts:907](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L907)

###### Returns [#returns-79]

`void`

##### getCamera() [#getcamera]

```ts
getCamera(): Camera;
```

Defined in: [graph.ts:917](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L917)

Get a snapshot of the current camera. Use setCamera() to update it.

###### Returns [#returns-80]

[`Camera`](#camera-1)

##### setCamera() [#setcamera]

```ts
setCamera(partial: Partial<Camera>): void;
```

Defined in: [graph.ts:921](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L921)

###### Parameters [#parameters-64]

| Parameter | Type                              |
| --------- | --------------------------------- |
| `partial` | `Partial`\<[`Camera`](#camera-1)> |

###### Returns [#returns-81]

`void`

##### resetCamera() [#resetcamera]

```ts
resetCamera(): void;
```

Defined in: [graph.ts:928](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L928)

###### Returns [#returns-82]

`void`

##### setSize() [#setsize]

```ts
setSize(width: number, height: number): void;
```

Defined in: [graph.ts:934](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L934)

###### Parameters [#parameters-65]

| Parameter | Type     |
| --------- | -------- |
| `width`   | `number` |
| `height`  | `number` |

###### Returns [#returns-83]

`void`

##### getZoom() [#getzoom]

```ts
getZoom(): number;
```

Defined in: [graph.ts:939](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L939)

###### Returns [#returns-84]

`number`

##### zoomTo() [#zoomto]

```ts
zoomTo(zoom: number, options?: ZoomOptions): void;
```

Defined in: [graph.ts:943](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L943)

###### Parameters [#parameters-66]

| Parameter | Type                          |
| --------- | ----------------------------- |
| `zoom`    | `number`                      |
| `options` | [`ZoomOptions`](#zoomoptions) |

###### Returns [#returns-85]

`void`

##### zoomBy() [#zoomby]

```ts
zoomBy(ratio: number, options?: ZoomOptions): void;
```

Defined in: [graph.ts:965](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L965)

###### Parameters [#parameters-67]

| Parameter  | Type                          |
| ---------- | ----------------------------- |
| `ratio`    | `number`                      |
| `options?` | [`ZoomOptions`](#zoomoptions) |

###### Returns [#returns-86]

`void`

##### fitView() [#fitview]

```ts
fitView(options?: number | FitViewOptions): void;
```

Defined in: [graph.ts:970](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L970)

###### Parameters [#parameters-68]

| Parameter | Type                                            | Default value |
| --------- | ----------------------------------------------- | ------------- |
| `options` | `number` \| [`FitViewOptions`](#fitviewoptions) | `0.9`         |

###### Returns [#returns-87]

`void`

##### fitCenter() [#fitcenter]

```ts
fitCenter(): void;
```

Defined in: [graph.ts:1014](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L1014)

###### Returns [#returns-88]

`void`

##### screenToGraph() [#screentograph]

```ts
screenToGraph(screenX: number, screenY: number): {
  x: number;
  y: number;
};
```

Defined in: [graph.ts:1038](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L1038)

Convert client viewport CSS coordinates to graph coordinates.

###### Parameters [#parameters-69]

| Parameter | Type     |
| --------- | -------- |
| `screenX` | `number` |
| `screenY` | `number` |

###### Returns [#returns-89]

```ts
{
  x: number;
  y: number;
}
```

###### x [#x-2]

```ts
x: number;
```

###### y [#y-2]

```ts
y: number;
```

##### graphToScreen() [#graphtoscreen]

```ts
graphToScreen(graphX: number, graphY: number): {
  x: number;
  y: number;
};
```

Defined in: [graph.ts:1045](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L1045)

Convert graph coordinates to client viewport CSS coordinates.

###### Parameters [#parameters-70]

| Parameter | Type     |
| --------- | -------- |
| `graphX`  | `number` |
| `graphY`  | `number` |

###### Returns [#returns-90]

```ts
{
  x: number;
  y: number;
}
```

###### x [#x-3]

```ts
x: number;
```

###### y [#y-3]

```ts
y: number;
```

##### on() [#on-1]

###### Call Signature [#call-signature-6]

```ts
on<K>(event: K, handler: Handler<GraphEventMap[K]>): void;
```

Defined in: [graph.ts:1059](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L1059)

Subscribe to an event.

###### Type Parameters [#type-parameters-4]

| Type Parameter                                        |
| ----------------------------------------------------- |
| `K` *extends* keyof [`GraphEventMap`](#grapheventmap) |

###### Parameters [#parameters-71]

| Parameter | Type                                                            |
| --------- | --------------------------------------------------------------- |
| `event`   | `K`                                                             |
| `handler` | [`Handler`](#handler)\<[`GraphEventMap`](#grapheventmap)\[`K`]> |

###### Returns [#returns-91]

`void`

###### Call Signature [#call-signature-7]

```ts
on<Args>(event: string, handler: Handler<Args>): void;
```

Defined in: [graph.ts:1060](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L1060)

Subscribe to an event.

###### Type Parameters [#type-parameters-5]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

###### Parameters [#parameters-72]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `event`   | `string`                       |
| `handler` | [`Handler`](#handler)\<`Args`> |

###### Returns [#returns-92]

`void`

##### off() [#off-1]

###### Call Signature [#call-signature-8]

```ts
off<K>(event: K, handler: Handler<GraphEventMap[K]>): void;
```

Defined in: [graph.ts:1067](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L1067)

Unsubscribe from an event.

###### Type Parameters [#type-parameters-6]

| Type Parameter                                        |
| ----------------------------------------------------- |
| `K` *extends* keyof [`GraphEventMap`](#grapheventmap) |

###### Parameters [#parameters-73]

| Parameter | Type                                                            |
| --------- | --------------------------------------------------------------- |
| `event`   | `K`                                                             |
| `handler` | [`Handler`](#handler)\<[`GraphEventMap`](#grapheventmap)\[`K`]> |

###### Returns [#returns-93]

`void`

###### Call Signature [#call-signature-9]

```ts
off<Args>(event: string, handler: Handler<Args>): void;
```

Defined in: [graph.ts:1068](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L1068)

Unsubscribe from an event.

###### Type Parameters [#type-parameters-7]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

###### Parameters [#parameters-74]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `event`   | `string`                       |
| `handler` | [`Handler`](#handler)\<`Args`> |

###### Returns [#returns-94]

`void`

##### once() [#once-1]

###### Call Signature [#call-signature-10]

```ts
once<K>(event: K, handler: Handler<GraphEventMap[K]>): void;
```

Defined in: [graph.ts:1074](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L1074)

Subscribe to an event once.

###### Type Parameters [#type-parameters-8]

| Type Parameter                                        |
| ----------------------------------------------------- |
| `K` *extends* keyof [`GraphEventMap`](#grapheventmap) |

###### Parameters [#parameters-75]

| Parameter | Type                                                            |
| --------- | --------------------------------------------------------------- |
| `event`   | `K`                                                             |
| `handler` | [`Handler`](#handler)\<[`GraphEventMap`](#grapheventmap)\[`K`]> |

###### Returns [#returns-95]

`void`

###### Call Signature [#call-signature-11]

```ts
once<Args>(event: string, handler: Handler<Args>): void;
```

Defined in: [graph.ts:1075](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/graph.ts#L1075)

Subscribe to an event once.

###### Type Parameters [#type-parameters-9]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

###### Parameters [#parameters-76]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `event`   | `string`                       |
| `handler` | [`Handler`](#handler)\<`Args`> |

###### Returns [#returns-96]

`void`

## Interfaces [#interfaces]

### BrushSelectOptions [#brushselectoptions]

Defined in: [behaviors/brushSelect.ts:19](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/brushSelect.ts#L19)

#### Properties [#properties-2]

##### key? [#key]

```ts
optional key?: "shift" | "ctrl" | null;
```

Defined in: [behaviors/brushSelect.ts:21](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/brushSelect.ts#L21)

Modifier key to activate. null = always active. Default: null

##### throttleMs? [#throttlems]

```ts
optional throttleMs?: number;
```

Defined in: [behaviors/brushSelect.ts:23](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/brushSelect.ts#L23)

Throttle interval for real-time selection during drag (ms). Default: 100

***

### ClickSelectConfig [#clickselectconfig]

Defined in: [behaviors/clickSelect.ts:14](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/clickSelect.ts#L14)

#### Properties [#properties-3]

##### type [#type]

```ts
type: string;
```

Defined in: [behaviors/clickSelect.ts:15](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/clickSelect.ts#L15)

##### multiple? [#multiple]

```ts
optional multiple?: boolean;
```

Defined in: [behaviors/clickSelect.ts:16](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/clickSelect.ts#L16)

##### trigger? [#trigger]

```ts
optional trigger?: "shift" | "meta" | "ctrl";
```

Defined in: [behaviors/clickSelect.ts:17](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/clickSelect.ts#L17)

***

### DragCanvasOptions [#dragcanvasoptions]

Defined in: [behaviors/dragCanvas.ts:12](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/dragCanvas.ts#L12)

#### Properties [#properties-4]

##### ignoreModifierKeys? [#ignoremodifierkeys]

```ts
optional ignoreModifierKeys?: boolean;
```

Defined in: [behaviors/dragCanvas.ts:14](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/dragCanvas.ts#L14)

Keep modifier-key gestures available for brush/lasso selection. Default: true.

***

### HoverHighlightConfig [#hoverhighlightconfig]

Defined in: [behaviors/hoverHighlight.ts:16](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/hoverHighlight.ts#L16)

#### Properties [#properties-5]

##### type [#type-1]

```ts
type: string;
```

Defined in: [behaviors/hoverHighlight.ts:17](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/hoverHighlight.ts#L17)

##### degree? [#degree]

```ts
optional degree?: number;
```

Defined in: [behaviors/hoverHighlight.ts:18](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/hoverHighlight.ts#L18)

##### inactiveState? [#inactivestate]

```ts
optional inactiveState?: string;
```

Defined in: [behaviors/hoverHighlight.ts:19](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/hoverHighlight.ts#L19)

***

### BuiltInBehaviorOptionsMap [#builtinbehavioroptionsmap]

Defined in: [behaviors/index.ts:56](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L56)

Built-in behavior name to its supported object configuration.

#### Properties [#properties-6]

##### zoom-canvas [#zoom-canvas]

```ts
zoom-canvas: BehaviorConfig<"zoom-canvas", ZoomCanvasOptions>;
```

Defined in: [behaviors/index.ts:57](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L57)

##### drag-canvas [#drag-canvas]

```ts
drag-canvas: BehaviorConfig<"drag-canvas", DragCanvasOptions>;
```

Defined in: [behaviors/index.ts:58](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L58)

##### highlight-node [#highlight-node]

```ts
highlight-node: BehaviorConfig<"highlight-node">;
```

Defined in: [behaviors/index.ts:59](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L59)

##### highlight-edge [#highlight-edge]

```ts
highlight-edge: BehaviorConfig<"highlight-edge">;
```

Defined in: [behaviors/index.ts:60](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L60)

##### hover-highlight [#hover-highlight]

```ts
hover-highlight: BehaviorConfig<"hover-highlight", Omit<HoverHighlightConfig, "type">>;
```

Defined in: [behaviors/index.ts:61](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L61)

##### drag-node [#drag-node]

```ts
drag-node: BehaviorConfig<"drag-node">;
```

Defined in: [behaviors/index.ts:62](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L62)

##### click-select [#click-select]

```ts
click-select: BehaviorConfig<"click-select", Omit<ClickSelectConfig, "type">>;
```

Defined in: [behaviors/index.ts:63](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L63)

##### drag-edge [#drag-edge]

```ts
drag-edge: BehaviorConfig<"drag-edge">;
```

Defined in: [behaviors/index.ts:64](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L64)

##### brush-select [#brush-select]

```ts
brush-select: BehaviorConfig<"brush-select", BrushSelectOptions>;
```

Defined in: [behaviors/index.ts:65](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L65)

##### lasso-select [#lasso-select]

```ts
lasso-select: BehaviorConfig<"lasso-select", LassoSelectOptions>;
```

Defined in: [behaviors/index.ts:66](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L66)

##### tooltip [#tooltip]

```ts
tooltip: BehaviorConfig<"tooltip", TooltipOptions>;
```

Defined in: [behaviors/index.ts:67](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L67)

***

### LassoSelectOptions [#lassoselectoptions]

Defined in: [behaviors/lassoSelect.ts:19](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/lassoSelect.ts#L19)

#### Properties [#properties-7]

##### key? [#key-1]

```ts
optional key?: "shift" | "ctrl" | null;
```

Defined in: [behaviors/lassoSelect.ts:21](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/lassoSelect.ts#L21)

Modifier key to activate. Default: null (always active)

##### throttleMs? [#throttlems-1]

```ts
optional throttleMs?: number;
```

Defined in: [behaviors/lassoSelect.ts:23](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/lassoSelect.ts#L23)

Throttle interval for real-time selection during drag (ms). Default: 100

***

### TooltipContext [#tooltipcontext]

Defined in: [behaviors/tooltip.ts:23](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L23)

#### Properties [#properties-8]

##### itemType [#itemtype]

```ts
itemType: "node" | "edge";
```

Defined in: [behaviors/tooltip.ts:24](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L24)

##### nodeId? [#nodeid]

```ts
optional nodeId?: string;
```

Defined in: [behaviors/tooltip.ts:25](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L25)

##### edgeId? [#edgeid]

```ts
optional edgeId?: string;
```

Defined in: [behaviors/tooltip.ts:26](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L26)

##### edgeIndex? [#edgeindex]

```ts
optional edgeIndex?: number;
```

Defined in: [behaviors/tooltip.ts:27](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L27)

##### source? [#source]

```ts
optional source?: string;
```

Defined in: [behaviors/tooltip.ts:28](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L28)

##### target? [#target]

```ts
optional target?: string;
```

Defined in: [behaviors/tooltip.ts:29](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L29)

##### data? [#data]

```ts
optional data?: Record<string, unknown>;
```

Defined in: [behaviors/tooltip.ts:30](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L30)

##### event [#event]

```ts
event: MouseEvent;
```

Defined in: [behaviors/tooltip.ts:31](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L31)

***

### TooltipOptions [#tooltipoptions]

Defined in: [behaviors/tooltip.ts:34](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L34)

#### Properties [#properties-9]

##### trigger? [#trigger-1]

```ts
optional trigger?: "click" | "hover";
```

Defined in: [behaviors/tooltip.ts:36](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L36)

Trigger mode. Default: 'hover'.

##### getContent? [#getcontent]

```ts
optional getContent?: (ctx: TooltipContext) => string | HTMLElement;
```

Defined in: [behaviors/tooltip.ts:42](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L42)

Build the tooltip body. A custom string is treated as trusted HTML for
backward compatibility; escape untrusted values or return an HTMLElement
whose textContent you control.

###### Parameters [#parameters-77]

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `ctx`     | [`TooltipContext`](#tooltipcontext) |

###### Returns [#returns-97]

`string` | `HTMLElement`

##### enable? [#enable]

```ts
optional enable?: (ctx: TooltipContext) => boolean;
```

Defined in: [behaviors/tooltip.ts:44](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L44)

Gate display per element. Return false to suppress. Default: always show.

###### Parameters [#parameters-78]

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `ctx`     | [`TooltipContext`](#tooltipcontext) |

###### Returns [#returns-98]

`boolean`

##### offset? [#offset]

```ts
optional offset?: [number, number];
```

Defined in: [behaviors/tooltip.ts:46](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L46)

Pixel offset \[dx, dy] from the pointer. Default: \[10, 10].

##### delay? [#delay]

```ts
optional delay?: number;
```

Defined in: [behaviors/tooltip.ts:48](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L48)

Hover debounce in ms before show. Default: 80.

##### className? [#classname]

```ts
optional className?: string;
```

Defined in: [behaviors/tooltip.ts:50](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L50)

Overlay class name. Default: 'g6lite-tooltip'.

##### container? [#container]

```ts
optional container?: HTMLElement;
```

Defined in: [behaviors/tooltip.ts:52](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/tooltip.ts#L52)

DOM mount and collision boundary. Defaults to document.body.

***

### ZoomCanvasOptions [#zoomcanvasoptions]

Defined in: [behaviors/zoomCanvas.ts:7](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/zoomCanvas.ts#L7)

#### Properties [#properties-10]

##### sensitivity? [#sensitivity]

```ts
optional sensitivity?: number;
```

Defined in: [behaviors/zoomCanvas.ts:9](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/zoomCanvas.ts#L9)

Wheel/trackpad delta percentage multiplier. Defaults to 1.

##### minZoom? [#minzoom]

```ts
optional minZoom?: number;
```

Defined in: [behaviors/zoomCanvas.ts:11](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/zoomCanvas.ts#L11)

Minimum camera zoom. Defaults to 0.1.

##### maxZoom? [#maxzoom]

```ts
optional maxZoom?: number;
```

Defined in: [behaviors/zoomCanvas.ts:13](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/zoomCanvas.ts#L13)

Maximum camera zoom. Defaults to 20.

***

### ExtensionNodeData [#extensionnodedata]

Defined in: [extensions/contracts.ts:21](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L21)

Read-only node snapshot exposed to extensions.

#### Properties [#properties-11]

##### id [#id]

```ts
readonly id: string;
```

Defined in: [extensions/contracts.ts:22](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L22)

##### name? [#name]

```ts
readonly optional name?: string;
```

Defined in: [extensions/contracts.ts:23](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L23)

##### x [#x-4]

```ts
readonly x: number;
```

Defined in: [extensions/contracts.ts:24](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L24)

##### y [#y-4]

```ts
readonly y: number;
```

Defined in: [extensions/contracts.ts:25](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L25)

##### data? [#data-1]

```ts
readonly optional data?: Readonly<Record<string, unknown>>;
```

Defined in: [extensions/contracts.ts:26](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L26)

##### states [#states]

```ts
readonly states: readonly ElementState[];
```

Defined in: [extensions/contracts.ts:27](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L27)

***

### ExtensionEdgeData [#extensionedgedata]

Defined in: [extensions/contracts.ts:31](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L31)

Read-only edge snapshot exposed to extensions.

#### Properties [#properties-12]

##### id [#id-1]

```ts
readonly id: string;
```

Defined in: [extensions/contracts.ts:32](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L32)

##### source [#source-1]

```ts
readonly source: string;
```

Defined in: [extensions/contracts.ts:33](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L33)

##### target [#target-1]

```ts
readonly target: string;
```

Defined in: [extensions/contracts.ts:34](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L34)

##### data? [#data-2]

```ts
readonly optional data?: Readonly<Record<string, unknown>>;
```

Defined in: [extensions/contracts.ts:35](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L35)

##### states [#states-1]

```ts
readonly states: readonly ElementState[];
```

Defined in: [extensions/contracts.ts:36](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L36)

***

### ExtensionDataContext [#extensiondatacontext]

Defined in: [extensions/contracts.ts:39](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L39)

#### Methods [#methods-4]

##### getNode() [#getnode]

```ts
getNode(id: string): ExtensionNodeData | undefined;
```

Defined in: [extensions/contracts.ts:40](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L40)

###### Parameters [#parameters-79]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-99]

[`ExtensionNodeData`](#extensionnodedata) | `undefined`

##### getEdge() [#getedge]

```ts
getEdge(id: string): ExtensionEdgeData | undefined;
```

Defined in: [extensions/contracts.ts:41](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L41)

###### Parameters [#parameters-80]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-100]

[`ExtensionEdgeData`](#extensionedgedata) | `undefined`

##### getNodeIds() [#getnodeids]

```ts
getNodeIds(): string[];
```

Defined in: [extensions/contracts.ts:42](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L42)

###### Returns [#returns-101]

`string`\[]

##### getEdgeIds() [#getedgeids]

```ts
getEdgeIds(): string[];
```

Defined in: [extensions/contracts.ts:43](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L43)

###### Returns [#returns-102]

`string`\[]

##### updateNode() [#updatenode]

```ts
updateNode(id: string, data: Record<string, unknown>): void;
```

Defined in: [extensions/contracts.ts:44](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L44)

###### Parameters [#parameters-81]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `id`      | `string`                       |
| `data`    | `Record`\<`string`, `unknown`> |

###### Returns [#returns-103]

`void`

##### updateEdge() [#updateedge]

```ts
updateEdge(id: string, data: Record<string, unknown>): void;
```

Defined in: [extensions/contracts.ts:45](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L45)

###### Parameters [#parameters-82]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `id`      | `string`                       |
| `data`    | `Record`\<`string`, `unknown`> |

###### Returns [#returns-104]

`void`

***

### ExtensionStateContext [#extensionstatecontext]

Defined in: [extensions/contracts.ts:48](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L48)

#### Methods [#methods-5]

##### set() [#set]

```ts
set(id: string, states: ElementState[]): void;
```

Defined in: [extensions/contracts.ts:49](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L49)

###### Parameters [#parameters-83]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `id`      | `string`                           |
| `states`  | [`ElementState`](#elementstate)\[] |

###### Returns [#returns-105]

`void`

##### setAll() [#setall]

```ts
setAll(stateMap: Record<string, ElementState[]>): void;
```

Defined in: [extensions/contracts.ts:50](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L50)

###### Parameters [#parameters-84]

| Parameter  | Type                                                    |
| ---------- | ------------------------------------------------------- |
| `stateMap` | `Record`\<`string`, [`ElementState`](#elementstate)\[]> |

###### Returns [#returns-106]

`void`

##### get() [#get]

```ts
get(id: string): ElementState[];
```

Defined in: [extensions/contracts.ts:51](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L51)

###### Parameters [#parameters-85]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-107]

[`ElementState`](#elementstate)\[]

##### clear() [#clear]

```ts
clear(id: string): void;
```

Defined in: [extensions/contracts.ts:52](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L52)

###### Parameters [#parameters-86]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-108]

`void`

***

### ExtensionViewportContext [#extensionviewportcontext]

Defined in: [extensions/contracts.ts:55](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L55)

#### Methods [#methods-6]

##### screenToGraph() [#screentograph-1]

```ts
screenToGraph(point: {
  x: number;
  y: number;
}): {
  x: number;
  y: number;
};
```

Defined in: [extensions/contracts.ts:56](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L56)

###### Parameters [#parameters-87]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `point`   | \{ `x`: `number`; `y`: `number`; } |
| `point.x` | `number`                           |
| `point.y` | `number`                           |

###### Returns [#returns-109]

```ts
{
  x: number;
  y: number;
}
```

###### x [#x-5]

```ts
x: number;
```

###### y [#y-5]

```ts
y: number;
```

##### graphToScreen() [#graphtoscreen-1]

```ts
graphToScreen(point: {
  x: number;
  y: number;
}): {
  x: number;
  y: number;
};
```

Defined in: [extensions/contracts.ts:57](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L57)

###### Parameters [#parameters-88]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `point`   | \{ `x`: `number`; `y`: `number`; } |
| `point.x` | `number`                           |
| `point.y` | `number`                           |

###### Returns [#returns-110]

```ts
{
  x: number;
  y: number;
}
```

###### x [#x-6]

```ts
x: number;
```

###### y [#y-6]

```ts
y: number;
```

##### getZoom() [#getzoom-1]

```ts
getZoom(): number;
```

Defined in: [extensions/contracts.ts:58](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L58)

###### Returns [#returns-111]

`number`

***

### ExtensionContext [#extensioncontext]

Defined in: [extensions/contracts.ts:61](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L61)

#### Properties [#properties-13]

##### ~~graph~~ [#graph-1]

```ts
graph: Graph;
```

Defined in: [extensions/contracts.ts:63](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L63)

###### Deprecated [#deprecated-8]

Use data, state, viewport, and requestRender instead.

##### data [#data-3]

```ts
data: ExtensionDataContext;
```

Defined in: [extensions/contracts.ts:64](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L64)

##### state [#state]

```ts
state: ExtensionStateContext;
```

Defined in: [extensions/contracts.ts:65](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L65)

##### viewport [#viewport]

```ts
viewport: ExtensionViewportContext;
```

Defined in: [extensions/contracts.ts:66](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L66)

#### Methods [#methods-7]

##### requestRender() [#requestrender]

```ts
requestRender(): void;
```

Defined in: [extensions/contracts.ts:67](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L67)

###### Returns [#returns-112]

`void`

##### ~~screenToGraph()~~ [#screentograph-2]

```ts
screenToGraph(point: {
  x: number;
  y: number;
}): {
  x: number;
  y: number;
};
```

Defined in: [extensions/contracts.ts:69](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L69)

###### Parameters [#parameters-89]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `point`   | \{ `x`: `number`; `y`: `number`; } |
| `point.x` | `number`                           |
| `point.y` | `number`                           |

###### Returns [#returns-113]

```ts
{
  x: number;
  y: number;
}
```

###### ~~x~~ [#x-7]

```ts
x: number;
```

###### ~~y~~ [#y-7]

```ts
y: number;
```

###### Deprecated [#deprecated-9]

Use viewport.screenToGraph.

##### ~~graphToScreen()~~ [#graphtoscreen-2]

```ts
graphToScreen(point: {
  x: number;
  y: number;
}): {
  x: number;
  y: number;
};
```

Defined in: [extensions/contracts.ts:71](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L71)

###### Parameters [#parameters-90]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `point`   | \{ `x`: `number`; `y`: `number`; } |
| `point.x` | `number`                           |
| `point.y` | `number`                           |

###### Returns [#returns-114]

```ts
{
  x: number;
  y: number;
}
```

###### ~~x~~ [#x-8]

```ts
x: number;
```

###### ~~y~~ [#y-8]

```ts
y: number;
```

###### Deprecated [#deprecated-10]

Use viewport.graphToScreen.

##### ~~getZoom()~~ [#getzoom-2]

```ts
getZoom(): number;
```

Defined in: [extensions/contracts.ts:73](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L73)

###### Returns [#returns-115]

`number`

###### Deprecated [#deprecated-11]

Use viewport.getZoom.

##### isDestroyed() [#isdestroyed-1]

```ts
isDestroyed(): boolean;
```

Defined in: [extensions/contracts.ts:74](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L74)

###### Returns [#returns-116]

`boolean`

***

### Extension [#extension]

Defined in: [extensions/contracts.ts:77](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L77)

#### Extended by [#extended-by-1]

* [`BehaviorExtension`](#behaviorextension)
* [`LayoutExtension`](#layoutextension)
* [`PluginExtension`](#pluginextension)
* [`TransformExtension`](#transformextension)

#### Type Parameters [#type-parameters-10]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `TOptions`     | `Record`\<`string`, `unknown`> |

#### Methods [#methods-8]

##### init()? [#init]

```ts
optional init(context: ExtensionContext, options: Readonly<TOptions>): void;
```

Defined in: [extensions/contracts.ts:78](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L78)

###### Parameters [#parameters-91]

| Parameter | Type                                    |
| --------- | --------------------------------------- |
| `context` | [`ExtensionContext`](#extensioncontext) |
| `options` | `Readonly`\<`TOptions`>                 |

###### Returns [#returns-117]

`void`

##### destroy()? [#destroy-1]

```ts
optional destroy(): void;
```

Defined in: [extensions/contracts.ts:79](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L79)

###### Returns [#returns-118]

`void`

***

### LayoutExtension [#layoutextension]

Defined in: [extensions/contracts.ts:82](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L82)

#### Extends [#extends-1]

* [`Extension`](#extension)\<`TOptions`>

#### Type Parameters [#type-parameters-11]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `TOptions`     | `Record`\<`string`, `unknown`> |

#### Methods [#methods-9]

##### init()? [#init-1]

```ts
optional init(context: ExtensionContext, options: Readonly<TOptions>): void;
```

Defined in: [extensions/contracts.ts:78](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L78)

###### Parameters [#parameters-92]

| Parameter | Type                                    |
| --------- | --------------------------------------- |
| `context` | [`ExtensionContext`](#extensioncontext) |
| `options` | `Readonly`\<`TOptions`>                 |

###### Returns [#returns-119]

`void`

###### Inherited from [#inherited-from-4]

[`Extension`](#extension).[`init`](#init)

##### destroy()? [#destroy-2]

```ts
optional destroy(): void;
```

Defined in: [extensions/contracts.ts:79](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L79)

###### Returns [#returns-120]

`void`

###### Inherited from [#inherited-from-5]

[`Extension`](#extension).[`destroy`](#destroy)

##### execute() [#execute]

```ts
execute(data: GraphData, context: {
  width: number;
  height: number;
  signal?: AbortSignal;
  options: Readonly<TOptions>;
}): 
  | {
  nodes: GraphNode & {
     x: number;
     y: number;
  }[];
}
  | Promise<{
  nodes: GraphNode & {
     x: number;
     y: number;
  }[];
}>;
```

Defined in: [extensions/contracts.ts:83](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L83)

###### Parameters [#parameters-93]

| Parameter         | Type                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `data`            | [`GraphData`](#graphdata)                                                                                 |
| `context`         | \{ `width`: `number`; `height`: `number`; `signal?`: `AbortSignal`; `options`: `Readonly`\<`TOptions`>; } |
| `context.width`   | `number`                                                                                                  |
| `context.height`  | `number`                                                                                                  |
| `context.signal?` | `AbortSignal`                                                                                             |
| `context.options` | `Readonly`\<`TOptions`>                                                                                   |

###### Returns [#returns-121]

\| \{
`nodes`: [`GraphNode`](#graphnode) & \{
`x`: `number`;
`y`: `number`;
}\[];
}
\| `Promise`\<\{
`nodes`: [`GraphNode`](#graphnode) & \{
`x`: `number`;
`y`: `number`;
}\[];
}>

***

### BehaviorExtension [#behaviorextension]

Defined in: [extensions/contracts.ts:106](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L106)

#### Extends [#extends-2]

* [`Extension`](#extension)\<`TOptions`>

#### Type Parameters [#type-parameters-12]

| Type Parameter                                             | Default type                        |
| ---------------------------------------------------------- | ----------------------------------- |
| `TOptions` *extends* [`BehaviorOptions`](#behavioroptions) | [`BehaviorConfig`](#behaviorconfig) |
| `TEventMap` *extends* `object`                             | [`GraphEventMap`](#grapheventmap)   |

#### Methods [#methods-10]

##### init()? [#init-2]

```ts
optional init(context: ExtensionContext, options: Readonly<TOptions>): void;
```

Defined in: [extensions/contracts.ts:78](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L78)

###### Parameters [#parameters-94]

| Parameter | Type                                    |
| --------- | --------------------------------------- |
| `context` | [`ExtensionContext`](#extensioncontext) |
| `options` | `Readonly`\<`TOptions`>                 |

###### Returns [#returns-122]

`void`

###### Inherited from [#inherited-from-6]

[`Extension`](#extension).[`init`](#init)

##### destroy()? [#destroy-3]

```ts
optional destroy(): void;
```

Defined in: [extensions/contracts.ts:79](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L79)

###### Returns [#returns-123]

`void`

###### Inherited from [#inherited-from-7]

[`Extension`](#extension).[`destroy`](#destroy)

##### getEvents() [#getevents]

```ts
getEvents(): BehaviorEventHandlers<TEventMap>;
```

Defined in: [extensions/contracts.ts:110](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L110)

###### Returns [#returns-124]

[`BehaviorEventHandlers`](#behavioreventhandlers)\<`TEventMap`>

***

### TransformExtension [#transformextension]

Defined in: [extensions/contracts.ts:113](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L113)

#### Extends [#extends-3]

* [`Extension`](#extension)\<`TOptions`>

#### Type Parameters [#type-parameters-13]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `TOptions`     | `Record`\<`string`, `unknown`> |

#### Methods [#methods-11]

##### init()? [#init-3]

```ts
optional init(context: ExtensionContext, options: Readonly<TOptions>): void;
```

Defined in: [extensions/contracts.ts:78](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L78)

###### Parameters [#parameters-95]

| Parameter | Type                                    |
| --------- | --------------------------------------- |
| `context` | [`ExtensionContext`](#extensioncontext) |
| `options` | `Readonly`\<`TOptions`>                 |

###### Returns [#returns-125]

`void`

###### Inherited from [#inherited-from-8]

[`Extension`](#extension).[`init`](#init)

##### destroy()? [#destroy-4]

```ts
optional destroy(): void;
```

Defined in: [extensions/contracts.ts:79](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L79)

###### Returns [#returns-126]

`void`

###### Inherited from [#inherited-from-9]

[`Extension`](#extension).[`destroy`](#destroy)

##### update()? [#update]

```ts
optional update(options: Readonly<Partial<TOptions>>): void;
```

Defined in: [extensions/contracts.ts:116](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L116)

###### Parameters [#parameters-96]

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `options` | `Readonly`\<`Partial`\<`TOptions`>> |

###### Returns [#returns-127]

`void`

##### beforeRender()? [#beforerender]

```ts
optional beforeRender(data: GraphData): GraphData;
```

Defined in: [extensions/contracts.ts:117](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L117)

###### Parameters [#parameters-97]

| Parameter | Type                      |
| --------- | ------------------------- |
| `data`    | [`GraphData`](#graphdata) |

###### Returns [#returns-128]

[`GraphData`](#graphdata)

***

### PluginExtension [#pluginextension]

Defined in: [extensions/contracts.ts:120](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L120)

#### Extends [#extends-4]

* [`Extension`](#extension)\<`TOptions`>

#### Type Parameters [#type-parameters-14]

| Type Parameter                                         | Default type                    |
| ------------------------------------------------------ | ------------------------------- |
| `TOptions` *extends* [`PluginOptions`](#pluginoptions) | [`PluginOption`](#pluginoption) |

#### Methods [#methods-12]

##### init()? [#init-4]

```ts
optional init(context: ExtensionContext, options: Readonly<TOptions>): void;
```

Defined in: [extensions/contracts.ts:78](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L78)

###### Parameters [#parameters-98]

| Parameter | Type                                    |
| --------- | --------------------------------------- |
| `context` | [`ExtensionContext`](#extensioncontext) |
| `options` | `Readonly`\<`TOptions`>                 |

###### Returns [#returns-129]

`void`

###### Inherited from [#inherited-from-10]

[`Extension`](#extension).[`init`](#init)

##### destroy()? [#destroy-5]

```ts
optional destroy(): void;
```

Defined in: [extensions/contracts.ts:79](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L79)

###### Returns [#returns-130]

`void`

###### Inherited from [#inherited-from-11]

[`Extension`](#extension).[`destroy`](#destroy)

##### mount()? [#mount]

```ts
optional mount(container: HTMLElement): void;
```

Defined in: [extensions/contracts.ts:123](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L123)

###### Parameters [#parameters-99]

| Parameter   | Type          |
| ----------- | ------------- |
| `container` | `HTMLElement` |

###### Returns [#returns-131]

`void`

***

### EdgeExtension [#edgeextension]

Defined in: [extensions/contracts.ts:127](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L127)

Immutable edge rendering descriptor; Graph owns all runtime state.

#### Properties [#properties-14]

##### base? [#base-2]

```ts
optional base?: "line" | "arc" | "polyline" | "cubic";
```

Defined in: [extensions/contracts.ts:128](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L128)

##### style? [#style-2]

```ts
optional style?: Partial<{
  stroke?: EdgeStyleValue<string>;
  lineWidth?: EdgeStyleValue<number>;
  curvature?: EdgeStyleValue<number>;
  curveOffset?: EdgeStyleValue<number>;
  endArrow?: EdgeStyleValue<boolean>;
  startArrow?: EdgeStyleValue<boolean>;
  arrowSize?: EdgeStyleValue<number>;
  lineDash?: EdgeStyleValue<number[]>;
  opacity?: EdgeStyleValue<number>;
  radius?: EdgeStyleValue<number>;
  router?: "orth" | "tree" | "indented" | "fishbone";
  indentTarget?: "left" | "right";
  trunkGap?: number;
  label?: EdgeStyleValue<string | false>;
  labelFontSize?: EdgeStyleValue<number>;
  labelFontFamily?: EdgeStyleValue<string>;
  labelColor?: EdgeStyleValue<string>;
  labelPlacement?: EdgeStyleValue<EdgeLabelPlacement>;
  labelBackground?: EdgeStyleValue<string | false>;
  labelBackgroundPadding?: EdgeStyleValue<number>;
  labelAutoRotate?: EdgeStyleValue<boolean>;
}>;
```

Defined in: [extensions/contracts.ts:129](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L129)

##### stateStyles? [#statestyles-2]

```ts
optional stateStyles?: Partial<Record<string, EdgeStateStyleOverride>>;
```

Defined in: [extensions/contracts.ts:130](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L130)

#### Methods [#methods-13]

##### getStyle()? [#getstyle-2]

```ts
optional getStyle(
   source: GraphNode, 
   target: GraphNode, 
edge: GraphEdge): Partial<NonNullable<EdgeConfig["style"]>>;
```

Defined in: [extensions/contracts.ts:131](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L131)

###### Parameters [#parameters-100]

| Parameter | Type                      |
| --------- | ------------------------- |
| `source`  | [`GraphNode`](#graphnode) |
| `target`  | [`GraphNode`](#graphnode) |
| `edge`    | [`GraphEdge`](#graphedge) |

###### Returns [#returns-132]

`Partial`\<`NonNullable`\<[`EdgeConfig`](#edgeconfig)\[`"style"`]>>

***

### DecorationMeasureParams [#decorationmeasureparams]

Defined in: [extensions/contracts.ts:138](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L138)

#### Extended by [#extended-by-2]

* [`DecorationDrawParams`](#decorationdrawparams)

#### Type Parameters [#type-parameters-15]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Properties [#properties-15]

##### ctx [#ctx]

```ts
ctx: CanvasRenderingContext2D;
```

Defined in: [extensions/contracts.ts:139](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L139)

##### node [#node]

```ts
node: GraphNode;
```

Defined in: [extensions/contracts.ts:140](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L140)

##### data [#data-4]

```ts
data: T;
```

Defined in: [extensions/contracts.ts:141](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L141)

##### dpr [#dpr]

```ts
dpr: number;
```

Defined in: [extensions/contracts.ts:142](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L142)

##### zoom [#zoom]

```ts
zoom: number;
```

Defined in: [extensions/contracts.ts:143](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L143)

##### nodeWidth [#nodewidth]

```ts
nodeWidth: number;
```

Defined in: [extensions/contracts.ts:145](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L145)

Final node dimensions in Canvas backing-store pixels.

##### nodeHeight [#nodeheight]

```ts
nodeHeight: number;
```

Defined in: [extensions/contracts.ts:147](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L147)

Final node dimensions in Canvas backing-store pixels.

***

### DecorationDrawParams [#decorationdrawparams]

Defined in: [extensions/contracts.ts:150](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L150)

#### Extends [#extends-5]

* [`DecorationMeasureParams`](#decorationmeasureparams)\<`T`>

#### Type Parameters [#type-parameters-16]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Properties [#properties-16]

##### ctx [#ctx-1]

```ts
ctx: CanvasRenderingContext2D;
```

Defined in: [extensions/contracts.ts:139](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L139)

###### Inherited from [#inherited-from-12]

[`DecorationMeasureParams`](#decorationmeasureparams).[`ctx`](#ctx)

##### node [#node-1]

```ts
node: GraphNode;
```

Defined in: [extensions/contracts.ts:140](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L140)

###### Inherited from [#inherited-from-13]

[`DecorationMeasureParams`](#decorationmeasureparams).[`node`](#node)

##### data [#data-5]

```ts
data: T;
```

Defined in: [extensions/contracts.ts:141](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L141)

###### Inherited from [#inherited-from-14]

[`DecorationMeasureParams`](#decorationmeasureparams).[`data`](#data-4)

##### dpr [#dpr-1]

```ts
dpr: number;
```

Defined in: [extensions/contracts.ts:142](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L142)

###### Inherited from [#inherited-from-15]

[`DecorationMeasureParams`](#decorationmeasureparams).[`dpr`](#dpr)

##### zoom [#zoom-1]

```ts
zoom: number;
```

Defined in: [extensions/contracts.ts:143](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L143)

###### Inherited from [#inherited-from-16]

[`DecorationMeasureParams`](#decorationmeasureparams).[`zoom`](#zoom)

##### nodeWidth [#nodewidth-1]

```ts
nodeWidth: number;
```

Defined in: [extensions/contracts.ts:145](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L145)

Final node dimensions in Canvas backing-store pixels.

###### Inherited from [#inherited-from-17]

[`DecorationMeasureParams`](#decorationmeasureparams).[`nodeWidth`](#nodewidth)

##### nodeHeight [#nodeheight-1]

```ts
nodeHeight: number;
```

Defined in: [extensions/contracts.ts:147](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L147)

Final node dimensions in Canvas backing-store pixels.

###### Inherited from [#inherited-from-18]

[`DecorationMeasureParams`](#decorationmeasureparams).[`nodeHeight`](#nodeheight)

##### layout [#layout-1]

```ts
layout: Readonly<LabelLayout>;
```

Defined in: [extensions/contracts.ts:151](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L151)

***

### DecorationRenderer [#decorationrenderer]

Defined in: [extensions/contracts.ts:155](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L155)

Stateless decoration content renderer; LabelLayerRenderer owns positioning and scheduling.

#### Type Parameters [#type-parameters-17]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Methods [#methods-14]

##### measure() [#measure]

```ts
measure(params: DecorationMeasureParams<T>): LabelLayout;
```

Defined in: [extensions/contracts.ts:156](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L156)

###### Parameters [#parameters-101]

| Parameter | Type                                                        |
| --------- | ----------------------------------------------------------- |
| `params`  | [`DecorationMeasureParams`](#decorationmeasureparams)\<`T`> |

###### Returns [#returns-133]

[`LabelLayout`](#labellayout)

##### draw() [#draw]

```ts
draw(params: DecorationDrawParams<T>): void;
```

Defined in: [extensions/contracts.ts:157](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L157)

###### Parameters [#parameters-102]

| Parameter | Type                                                  |
| --------- | ----------------------------------------------------- |
| `params`  | [`DecorationDrawParams`](#decorationdrawparams)\<`T`> |

###### Returns [#returns-134]

`void`

***

### NodeOverlayDrawParams [#nodeoverlaydrawparams]

Defined in: [extensions/node.ts:6](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L6)

#### Properties [#properties-17]

##### node [#node-2]

```ts
node: GraphNode & {
  x: number;
  y: number;
};
```

Defined in: [extensions/node.ts:7](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L7)

###### Type Declaration [#type-declaration]

###### x [#x-9]

```ts
x: number;
```

###### y [#y-9]

```ts
y: number;
```

##### x [#x-10]

```ts
x: number;
```

Defined in: [extensions/node.ts:8](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L8)

##### y [#y-10]

```ts
y: number;
```

Defined in: [extensions/node.ts:9](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L9)

##### nodeSize [#nodesize]

```ts
nodeSize: number;
```

Defined in: [extensions/node.ts:10](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L10)

##### dpr [#dpr-2]

```ts
dpr: number;
```

Defined in: [extensions/node.ts:11](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L11)

##### zoom [#zoom-2]

```ts
zoom: number;
```

Defined in: [extensions/node.ts:12](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L12)

##### camera [#camera]

```ts
camera: Camera;
```

Defined in: [extensions/node.ts:13](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L13)

##### time [#time]

```ts
time: number;
```

Defined in: [extensions/node.ts:14](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L14)

***

### NodeBoundaryAnchorParams [#nodeboundaryanchorparams]

Defined in: [extensions/node.ts:17](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L17)

#### Properties [#properties-18]

##### node [#node-3]

```ts
node: GraphNode;
```

Defined in: [extensions/node.ts:18](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L18)

##### placement [#placement]

```ts
placement: "top" | "bottom" | "left" | "right";
```

Defined in: [extensions/node.ts:19](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L19)

##### crossOffsetRatio [#crossoffsetratio]

```ts
crossOffsetRatio: number;
```

Defined in: [extensions/node.ts:20](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L20)

##### width [#width]

```ts
width: number;
```

Defined in: [extensions/node.ts:21](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L21)

##### height [#height]

```ts
height: number;
```

Defined in: [extensions/node.ts:22](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L22)

##### borderRadius [#borderradius]

```ts
borderRadius: number;
```

Defined in: [extensions/node.ts:23](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L23)

***

### NodeExtension [#nodeextension]

Defined in: [extensions/node.ts:26](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L26)

#### Properties [#properties-19]

##### base? [#base-3]

```ts
optional base?: "circle" | "rect";
```

Defined in: [extensions/node.ts:27](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L27)

##### style? [#style-3]

```ts
optional style?: Partial<NodeStyleConfig>;
```

Defined in: [extensions/node.ts:28](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L28)

##### stateStyles? [#statestyles-3]

```ts
optional stateStyles?: Partial<Record<string, NodeStateStyleOverride>>;
```

Defined in: [extensions/node.ts:29](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L29)

##### getStyle? [#getstyle-3]

```ts
optional getStyle?: (node: GraphNode) => Partial<NodeStyleConfig>;
```

Defined in: [extensions/node.ts:30](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L30)

###### Parameters [#parameters-103]

| Parameter | Type                      |
| --------- | ------------------------- |
| `node`    | [`GraphNode`](#graphnode) |

###### Returns [#returns-135]

`Partial`\<[`NodeStyleConfig`](#nodestyleconfig)>

##### getBoundaryAnchor? [#getboundaryanchor-2]

```ts
optional getBoundaryAnchor?: (params: NodeBoundaryAnchorParams) => {
  x: number;
  y: number;
};
```

Defined in: [extensions/node.ts:32](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L32)

Returns a screen-space offset from the node center to its visual boundary.

###### Parameters [#parameters-104]

| Parameter | Type                                                    |
| --------- | ------------------------------------------------------- |
| `params`  | [`NodeBoundaryAnchorParams`](#nodeboundaryanchorparams) |

###### Returns [#returns-136]

```ts
{
  x: number;
  y: number;
}
```

###### x [#x-11]

```ts
x: number;
```

###### y [#y-11]

```ts
y: number;
```

##### drawOverlay? [#drawoverlay-2]

```ts
optional drawOverlay?: (ctx: CanvasRenderingContext2D, params: NodeOverlayDrawParams) => boolean | void;
```

Defined in: [extensions/node.ts:33](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L33)

###### Parameters [#parameters-105]

| Parameter | Type                                              |
| --------- | ------------------------------------------------- |
| `ctx`     | `CanvasRenderingContext2D`                        |
| `params`  | [`NodeOverlayDrawParams`](#nodeoverlaydrawparams) |

###### Returns [#returns-137]

`boolean` | `void`

***

### Camera [#camera-1]

Defined in: [renderer/camera.ts:5](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/renderer/camera.ts#L5)

2D pan + zoom camera for graph space -> NDC.

#### Properties [#properties-20]

##### x [#x-12]

```ts
x: number;
```

Defined in: [renderer/camera.ts:6](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/renderer/camera.ts#L6)

##### y [#y-12]

```ts
y: number;
```

Defined in: [renderer/camera.ts:7](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/renderer/camera.ts#L7)

##### zoom [#zoom-3]

```ts
zoom: number;
```

Defined in: [renderer/camera.ts:8](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/renderer/camera.ts#L8)

***

### NodeData [#nodedata]

Defined in: [types.ts:7](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L7)

Extended payload attached to a node.

#### Extends [#extends-6]

* `Record`\<`string`, `unknown`>

#### Indexable [#indexable]

```ts
[key: string]: unknown
```

#### Properties [#properties-21]

##### cluster? [#cluster]

```ts
optional cluster?: string;
```

Defined in: [types.ts:8](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L8)

***

### GraphNode [#graphnode]

Defined in: [types.ts:12](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L12)

Node: at least id; optional name and data.

#### Properties [#properties-22]

##### id [#id-2]

```ts
id: string;
```

Defined in: [types.ts:13](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L13)

##### name? [#name-1]

```ts
optional name?: string;
```

Defined in: [types.ts:14](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L14)

##### data? [#data-6]

```ts
optional data?: NodeData;
```

Defined in: [types.ts:15](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L15)

##### x? [#x-13]

```ts
optional x?: number;
```

Defined in: [types.ts:16](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L16)

##### y? [#y-13]

```ts
optional y?: number;
```

Defined in: [types.ts:17](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L17)

##### fx? [#fx]

```ts
optional fx?: number;
```

Defined in: [types.ts:18](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L18)

##### fy? [#fy]

```ts
optional fy?: number;
```

Defined in: [types.ts:19](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L19)

##### states? [#states-2]

```ts
optional states?: ElementState[];
```

Defined in: [types.ts:20](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L20)

##### comboId? [#comboid]

```ts
optional comboId?: string;
```

Defined in: [types.ts:21](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L21)

***

### NodeDataUpdate [#nodedataupdate]

Defined in: [types.ts:34](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L34)

#### Properties [#properties-23]

##### id [#id-3]

```ts
id: string;
```

Defined in: [types.ts:35](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L35)

##### data [#data-7]

```ts
data: Record<string, unknown>;
```

Defined in: [types.ts:36](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L36)

***

### EdgeDataUpdate [#edgedataupdate]

Defined in: [types.ts:39](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L39)

#### Properties [#properties-24]

##### id [#id-4]

```ts
id: string;
```

Defined in: [types.ts:40](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L40)

##### data? [#data-8]

```ts
optional data?: Record<string, unknown>;
```

Defined in: [types.ts:41](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L41)

##### source? [#source-2]

```ts
optional source?: string;
```

Defined in: [types.ts:42](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L42)

##### target? [#target-2]

```ts
optional target?: string;
```

Defined in: [types.ts:43](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L43)

***

### ViewportPoint [#viewportpoint]

Defined in: [types.ts:46](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L46)

#### Properties [#properties-25]

##### x [#x-14]

```ts
x: number;
```

Defined in: [types.ts:47](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L47)

##### y [#y-14]

```ts
y: number;
```

Defined in: [types.ts:48](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L48)

***

### ZoomOptions [#zoomoptions]

Defined in: [types.ts:51](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L51)

#### Properties [#properties-26]

##### center? [#center]

```ts
optional center?: ViewportPoint;
```

Defined in: [types.ts:53](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L53)

Client/screen coordinate that remains visually fixed while zooming.

##### minZoom? [#minzoom-1]

```ts
optional minZoom?: number;
```

Defined in: [types.ts:54](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L54)

##### maxZoom? [#maxzoom-1]

```ts
optional maxZoom?: number;
```

Defined in: [types.ts:55](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L55)

***

### FitViewOptions [#fitviewoptions]

Defined in: [types.ts:58](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L58)

#### Properties [#properties-27]

##### padding? [#padding]

```ts
optional padding?: number | [number, number, number, number];
```

Defined in: [types.ts:60](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L60)

CSS-like padding in viewport pixels.

##### minZoom? [#minzoom-2]

```ts
optional minZoom?: number;
```

Defined in: [types.ts:61](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L61)

##### maxZoom? [#maxzoom-2]

```ts
optional maxZoom?: number;
```

Defined in: [types.ts:62](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L62)

***

### SetDataOptions [#setdataoptions]

Defined in: [types.ts:65](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L65)

#### Properties [#properties-28]

##### fitView? [#fitview-1]

```ts
optional fitView?: number | boolean | FitViewOptions;
```

Defined in: [types.ts:67](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L67)

Auto-fit after replacement. false preserves the current camera.

***

### NodePositionUpdate [#nodepositionupdate]

Defined in: [types.ts:70](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L70)

#### Properties [#properties-29]

##### id [#id-5]

```ts
id: string;
```

Defined in: [types.ts:71](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L71)

##### x [#x-15]

```ts
x: number;
```

Defined in: [types.ts:72](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L72)

##### y [#y-15]

```ts
y: number;
```

Defined in: [types.ts:73](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L73)

***

### GraphPoint [#graphpoint]

Defined in: [types.ts:76](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L76)

#### Properties [#properties-30]

##### x [#x-16]

```ts
x: number;
```

Defined in: [types.ts:77](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L77)

##### y [#y-16]

```ts
y: number;
```

Defined in: [types.ts:78](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L78)

***

### GraphElementEvent [#graphelementevent]

Defined in: [types.ts:81](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L81)

#### Extended by [#extended-by-3]

* [`CanvasGraphEvent`](#canvasgraphevent)
* [`ComboGraphEvent`](#combographevent)
* [`EdgeGraphEvent`](#edgegraphevent)
* [`NodeGraphEvent`](#nodegraphevent)

#### Type Parameters [#type-parameters-18]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `T`            | `Record`\<`string`, `unknown`> |

#### Properties [#properties-31]

##### targetType [#targettype]

```ts
targetType: "node" | "edge" | "combo" | "canvas";
```

Defined in: [types.ts:82](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L82)

##### targetId? [#targetid]

```ts
optional targetId?: string;
```

Defined in: [types.ts:83](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L83)

##### data? [#data-9]

```ts
optional data?: T;
```

Defined in: [types.ts:84](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L84)

##### client [#client]

```ts
client: GraphPoint;
```

Defined in: [types.ts:85](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L85)

##### canvas [#canvas]

```ts
canvas: GraphPoint;
```

Defined in: [types.ts:86](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L86)

##### graph [#graph-2]

```ts
graph: GraphPoint;
```

Defined in: [types.ts:87](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L87)

##### nativeEvent [#nativeevent]

```ts
nativeEvent: MouseEvent | WheelEvent;
```

Defined in: [types.ts:88](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L88)

##### ~~event~~ [#event-1]

```ts
event: MouseEvent | WheelEvent;
```

Defined in: [types.ts:90](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L90)

###### Deprecated [#deprecated-12]

Use nativeEvent.

##### nodeId? [#nodeid-1]

```ts
optional nodeId?: string;
```

Defined in: [types.ts:92](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L92)

Compatibility fields for existing consumers.

##### edgeId? [#edgeid-1]

```ts
optional edgeId?: string;
```

Defined in: [types.ts:93](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L93)

##### comboId? [#comboid-1]

```ts
optional comboId?: string;
```

Defined in: [types.ts:94](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L94)

##### edgeIndex? [#edgeindex-1]

```ts
optional edgeIndex?: number;
```

Defined in: [types.ts:95](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L95)

##### source? [#source-3]

```ts
optional source?: string;
```

Defined in: [types.ts:96](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L96)

##### target? [#target-3]

```ts
optional target?: string;
```

Defined in: [types.ts:97](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L97)

***

### NodeGraphEvent [#nodegraphevent]

Defined in: [types.ts:101](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L101)

Precisely typed node event emitted by the interaction dispatcher.

#### Extends [#extends-7]

* [`GraphElementEvent`](#graphelementevent)\<`TData`>

#### Type Parameters [#type-parameters-19]

| Type Parameter                                        | Default type                   |
| ----------------------------------------------------- | ------------------------------ |
| `TData`                                               | `Record`\<`string`, `unknown`> |
| `TNativeEvent` *extends* `MouseEvent` \| `WheelEvent` | `MouseEvent` \| `WheelEvent`   |

#### Properties [#properties-32]

##### data? [#data-10]

```ts
optional data?: TData;
```

Defined in: [types.ts:84](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L84)

###### Inherited from [#inherited-from-19]

[`GraphElementEvent`](#graphelementevent).[`data`](#data-9)

##### client [#client-1]

```ts
client: GraphPoint;
```

Defined in: [types.ts:85](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L85)

###### Inherited from [#inherited-from-20]

[`GraphElementEvent`](#graphelementevent).[`client`](#client)

##### canvas [#canvas-1]

```ts
canvas: GraphPoint;
```

Defined in: [types.ts:86](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L86)

###### Inherited from [#inherited-from-21]

[`GraphElementEvent`](#graphelementevent).[`canvas`](#canvas)

##### graph [#graph-3]

```ts
graph: GraphPoint;
```

Defined in: [types.ts:87](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L87)

###### Inherited from [#inherited-from-22]

[`GraphElementEvent`](#graphelementevent).[`graph`](#graph-2)

##### edgeId? [#edgeid-2]

```ts
optional edgeId?: string;
```

Defined in: [types.ts:93](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L93)

###### Inherited from [#inherited-from-23]

[`GraphElementEvent`](#graphelementevent).[`edgeId`](#edgeid-1)

##### comboId? [#comboid-2]

```ts
optional comboId?: string;
```

Defined in: [types.ts:94](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L94)

###### Inherited from [#inherited-from-24]

[`GraphElementEvent`](#graphelementevent).[`comboId`](#comboid-1)

##### edgeIndex? [#edgeindex-2]

```ts
optional edgeIndex?: number;
```

Defined in: [types.ts:95](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L95)

###### Inherited from [#inherited-from-25]

[`GraphElementEvent`](#graphelementevent).[`edgeIndex`](#edgeindex-1)

##### source? [#source-4]

```ts
optional source?: string;
```

Defined in: [types.ts:96](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L96)

###### Inherited from [#inherited-from-26]

[`GraphElementEvent`](#graphelementevent).[`source`](#source-3)

##### target? [#target-4]

```ts
optional target?: string;
```

Defined in: [types.ts:97](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L97)

###### Inherited from [#inherited-from-27]

[`GraphElementEvent`](#graphelementevent).[`target`](#target-3)

##### targetType [#targettype-1]

```ts
targetType: "node";
```

Defined in: [types.ts:105](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L105)

###### Overrides [#overrides-3]

[`GraphElementEvent`](#graphelementevent).[`targetType`](#targettype)

##### targetId [#targetid-1]

```ts
targetId: string;
```

Defined in: [types.ts:106](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L106)

###### Overrides [#overrides-4]

[`GraphElementEvent`](#graphelementevent).[`targetId`](#targetid)

##### nodeId [#nodeid-2]

```ts
nodeId: string;
```

Defined in: [types.ts:107](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L107)

Compatibility fields for existing consumers.

###### Overrides [#overrides-5]

[`GraphElementEvent`](#graphelementevent).[`nodeId`](#nodeid-1)

##### nativeEvent [#nativeevent-1]

```ts
nativeEvent: TNativeEvent;
```

Defined in: [types.ts:108](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L108)

###### Overrides [#overrides-6]

[`GraphElementEvent`](#graphelementevent).[`nativeEvent`](#nativeevent)

##### ~~event~~ [#event-2]

```ts
event: TNativeEvent;
```

Defined in: [types.ts:110](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L110)

###### Deprecated [#deprecated-13]

Use nativeEvent.

###### Overrides [#overrides-7]

[`GraphElementEvent`](#graphelementevent).[`event`](#event-1)

***

### EdgeGraphEvent [#edgegraphevent]

Defined in: [types.ts:114](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L114)

Precisely typed edge event emitted by the interaction dispatcher.

#### Extends [#extends-8]

* [`GraphElementEvent`](#graphelementevent)\<`TData`>

#### Type Parameters [#type-parameters-20]

| Type Parameter                                        | Default type                   |
| ----------------------------------------------------- | ------------------------------ |
| `TData`                                               | `Record`\<`string`, `unknown`> |
| `TNativeEvent` *extends* `MouseEvent` \| `WheelEvent` | `MouseEvent` \| `WheelEvent`   |

#### Properties [#properties-33]

##### data? [#data-11]

```ts
optional data?: TData;
```

Defined in: [types.ts:84](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L84)

###### Inherited from [#inherited-from-28]

[`GraphElementEvent`](#graphelementevent).[`data`](#data-9)

##### client [#client-2]

```ts
client: GraphPoint;
```

Defined in: [types.ts:85](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L85)

###### Inherited from [#inherited-from-29]

[`GraphElementEvent`](#graphelementevent).[`client`](#client)

##### canvas [#canvas-2]

```ts
canvas: GraphPoint;
```

Defined in: [types.ts:86](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L86)

###### Inherited from [#inherited-from-30]

[`GraphElementEvent`](#graphelementevent).[`canvas`](#canvas)

##### graph [#graph-4]

```ts
graph: GraphPoint;
```

Defined in: [types.ts:87](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L87)

###### Inherited from [#inherited-from-31]

[`GraphElementEvent`](#graphelementevent).[`graph`](#graph-2)

##### nodeId? [#nodeid-3]

```ts
optional nodeId?: string;
```

Defined in: [types.ts:92](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L92)

Compatibility fields for existing consumers.

###### Inherited from [#inherited-from-32]

[`GraphElementEvent`](#graphelementevent).[`nodeId`](#nodeid-1)

##### comboId? [#comboid-3]

```ts
optional comboId?: string;
```

Defined in: [types.ts:94](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L94)

###### Inherited from [#inherited-from-33]

[`GraphElementEvent`](#graphelementevent).[`comboId`](#comboid-1)

##### targetType [#targettype-2]

```ts
targetType: "edge";
```

Defined in: [types.ts:118](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L118)

###### Overrides [#overrides-8]

[`GraphElementEvent`](#graphelementevent).[`targetType`](#targettype)

##### targetId [#targetid-2]

```ts
targetId: string;
```

Defined in: [types.ts:119](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L119)

###### Overrides [#overrides-9]

[`GraphElementEvent`](#graphelementevent).[`targetId`](#targetid)

##### edgeId [#edgeid-3]

```ts
edgeId: string;
```

Defined in: [types.ts:120](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L120)

###### Overrides [#overrides-10]

[`GraphElementEvent`](#graphelementevent).[`edgeId`](#edgeid-1)

##### edgeIndex [#edgeindex-3]

```ts
edgeIndex: number;
```

Defined in: [types.ts:121](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L121)

###### Overrides [#overrides-11]

[`GraphElementEvent`](#graphelementevent).[`edgeIndex`](#edgeindex-1)

##### source [#source-5]

```ts
source: string;
```

Defined in: [types.ts:122](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L122)

###### Overrides [#overrides-12]

[`GraphElementEvent`](#graphelementevent).[`source`](#source-3)

##### target [#target-5]

```ts
target: string;
```

Defined in: [types.ts:123](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L123)

###### Overrides [#overrides-13]

[`GraphElementEvent`](#graphelementevent).[`target`](#target-3)

##### nativeEvent [#nativeevent-2]

```ts
nativeEvent: TNativeEvent;
```

Defined in: [types.ts:124](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L124)

###### Overrides [#overrides-14]

[`GraphElementEvent`](#graphelementevent).[`nativeEvent`](#nativeevent)

##### ~~event~~ [#event-3]

```ts
event: TNativeEvent;
```

Defined in: [types.ts:126](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L126)

###### Deprecated [#deprecated-14]

Use nativeEvent.

###### Overrides [#overrides-15]

[`GraphElementEvent`](#graphelementevent).[`event`](#event-1)

***

### ComboGraphEvent [#combographevent]

Defined in: [types.ts:130](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L130)

Precisely typed combo event emitted by the interaction dispatcher.

#### Extends [#extends-9]

* [`GraphElementEvent`](#graphelementevent)\<`Record`\<`string`, `unknown`>>

#### Type Parameters [#type-parameters-21]

| Type Parameter                        | Default type |
| ------------------------------------- | ------------ |
| `TNativeEvent` *extends* `MouseEvent` | `MouseEvent` |

#### Properties [#properties-34]

##### data? [#data-12]

```ts
optional data?: Record<string, unknown>;
```

Defined in: [types.ts:84](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L84)

###### Inherited from [#inherited-from-34]

[`GraphElementEvent`](#graphelementevent).[`data`](#data-9)

##### client [#client-3]

```ts
client: GraphPoint;
```

Defined in: [types.ts:85](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L85)

###### Inherited from [#inherited-from-35]

[`GraphElementEvent`](#graphelementevent).[`client`](#client)

##### canvas [#canvas-3]

```ts
canvas: GraphPoint;
```

Defined in: [types.ts:86](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L86)

###### Inherited from [#inherited-from-36]

[`GraphElementEvent`](#graphelementevent).[`canvas`](#canvas)

##### graph [#graph-5]

```ts
graph: GraphPoint;
```

Defined in: [types.ts:87](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L87)

###### Inherited from [#inherited-from-37]

[`GraphElementEvent`](#graphelementevent).[`graph`](#graph-2)

##### nodeId? [#nodeid-4]

```ts
optional nodeId?: string;
```

Defined in: [types.ts:92](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L92)

Compatibility fields for existing consumers.

###### Inherited from [#inherited-from-38]

[`GraphElementEvent`](#graphelementevent).[`nodeId`](#nodeid-1)

##### edgeId? [#edgeid-4]

```ts
optional edgeId?: string;
```

Defined in: [types.ts:93](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L93)

###### Inherited from [#inherited-from-39]

[`GraphElementEvent`](#graphelementevent).[`edgeId`](#edgeid-1)

##### edgeIndex? [#edgeindex-4]

```ts
optional edgeIndex?: number;
```

Defined in: [types.ts:95](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L95)

###### Inherited from [#inherited-from-40]

[`GraphElementEvent`](#graphelementevent).[`edgeIndex`](#edgeindex-1)

##### source? [#source-6]

```ts
optional source?: string;
```

Defined in: [types.ts:96](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L96)

###### Inherited from [#inherited-from-41]

[`GraphElementEvent`](#graphelementevent).[`source`](#source-3)

##### target? [#target-6]

```ts
optional target?: string;
```

Defined in: [types.ts:97](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L97)

###### Inherited from [#inherited-from-42]

[`GraphElementEvent`](#graphelementevent).[`target`](#target-3)

##### targetType [#targettype-3]

```ts
targetType: "combo";
```

Defined in: [types.ts:133](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L133)

###### Overrides [#overrides-16]

[`GraphElementEvent`](#graphelementevent).[`targetType`](#targettype)

##### targetId [#targetid-3]

```ts
targetId: string;
```

Defined in: [types.ts:134](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L134)

###### Overrides [#overrides-17]

[`GraphElementEvent`](#graphelementevent).[`targetId`](#targetid)

##### comboId [#comboid-4]

```ts
comboId: string;
```

Defined in: [types.ts:135](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L135)

###### Overrides [#overrides-18]

[`GraphElementEvent`](#graphelementevent).[`comboId`](#comboid-1)

##### nativeEvent [#nativeevent-3]

```ts
nativeEvent: TNativeEvent;
```

Defined in: [types.ts:136](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L136)

###### Overrides [#overrides-19]

[`GraphElementEvent`](#graphelementevent).[`nativeEvent`](#nativeevent)

##### ~~event~~ [#event-4]

```ts
event: TNativeEvent;
```

Defined in: [types.ts:138](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L138)

###### Deprecated [#deprecated-15]

Use nativeEvent.

###### Overrides [#overrides-20]

[`GraphElementEvent`](#graphelementevent).[`event`](#event-1)

***

### CanvasGraphEvent [#canvasgraphevent]

Defined in: [types.ts:142](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L142)

Precisely typed canvas event emitted by the interaction dispatcher.

#### Extends [#extends-10]

* [`GraphElementEvent`](#graphelementevent)\<`Record`\<`string`, `unknown`>>

#### Type Parameters [#type-parameters-22]

| Type Parameter                                        | Default type                 |
| ----------------------------------------------------- | ---------------------------- |
| `TNativeEvent` *extends* `MouseEvent` \| `WheelEvent` | `MouseEvent` \| `WheelEvent` |

#### Properties [#properties-35]

##### targetId? [#targetid-4]

```ts
optional targetId?: string;
```

Defined in: [types.ts:83](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L83)

###### Inherited from [#inherited-from-43]

[`GraphElementEvent`](#graphelementevent).[`targetId`](#targetid)

##### data? [#data-13]

```ts
optional data?: Record<string, unknown>;
```

Defined in: [types.ts:84](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L84)

###### Inherited from [#inherited-from-44]

[`GraphElementEvent`](#graphelementevent).[`data`](#data-9)

##### client [#client-4]

```ts
client: GraphPoint;
```

Defined in: [types.ts:85](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L85)

###### Inherited from [#inherited-from-45]

[`GraphElementEvent`](#graphelementevent).[`client`](#client)

##### canvas [#canvas-4]

```ts
canvas: GraphPoint;
```

Defined in: [types.ts:86](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L86)

###### Inherited from [#inherited-from-46]

[`GraphElementEvent`](#graphelementevent).[`canvas`](#canvas)

##### graph [#graph-6]

```ts
graph: GraphPoint;
```

Defined in: [types.ts:87](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L87)

###### Inherited from [#inherited-from-47]

[`GraphElementEvent`](#graphelementevent).[`graph`](#graph-2)

##### nodeId? [#nodeid-5]

```ts
optional nodeId?: string;
```

Defined in: [types.ts:92](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L92)

Compatibility fields for existing consumers.

###### Inherited from [#inherited-from-48]

[`GraphElementEvent`](#graphelementevent).[`nodeId`](#nodeid-1)

##### edgeId? [#edgeid-5]

```ts
optional edgeId?: string;
```

Defined in: [types.ts:93](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L93)

###### Inherited from [#inherited-from-49]

[`GraphElementEvent`](#graphelementevent).[`edgeId`](#edgeid-1)

##### comboId? [#comboid-5]

```ts
optional comboId?: string;
```

Defined in: [types.ts:94](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L94)

###### Inherited from [#inherited-from-50]

[`GraphElementEvent`](#graphelementevent).[`comboId`](#comboid-1)

##### edgeIndex? [#edgeindex-5]

```ts
optional edgeIndex?: number;
```

Defined in: [types.ts:95](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L95)

###### Inherited from [#inherited-from-51]

[`GraphElementEvent`](#graphelementevent).[`edgeIndex`](#edgeindex-1)

##### source? [#source-7]

```ts
optional source?: string;
```

Defined in: [types.ts:96](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L96)

###### Inherited from [#inherited-from-52]

[`GraphElementEvent`](#graphelementevent).[`source`](#source-3)

##### target? [#target-7]

```ts
optional target?: string;
```

Defined in: [types.ts:97](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L97)

###### Inherited from [#inherited-from-53]

[`GraphElementEvent`](#graphelementevent).[`target`](#target-3)

##### targetType [#targettype-4]

```ts
targetType: "canvas";
```

Defined in: [types.ts:145](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L145)

###### Overrides [#overrides-21]

[`GraphElementEvent`](#graphelementevent).[`targetType`](#targettype)

##### nativeEvent [#nativeevent-4]

```ts
nativeEvent: TNativeEvent;
```

Defined in: [types.ts:146](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L146)

###### Overrides [#overrides-22]

[`GraphElementEvent`](#graphelementevent).[`nativeEvent`](#nativeevent)

##### ~~event~~ [#event-5]

```ts
event: TNativeEvent;
```

Defined in: [types.ts:148](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L148)

###### Deprecated [#deprecated-16]

Use nativeEvent.

###### Overrides [#overrides-23]

[`GraphElementEvent`](#graphelementevent).[`event`](#event-1)

***

### GraphEventMap [#grapheventmap]

Defined in: [types.ts:155](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L155)

Public graph event contract. Values are argument tuples so zero-argument and
future multi-argument events remain type-safe.

#### Properties [#properties-36]

##### node:pointerover [#nodepointerover]

```ts
node:pointerover: [NodeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:156](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L156)

##### node:pointerenter [#nodepointerenter]

```ts
node:pointerenter: [NodeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:157](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L157)

##### node:pointermove [#nodepointermove]

```ts
node:pointermove: [NodeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:158](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L158)

##### node:pointerleave [#nodepointerleave]

```ts
node:pointerleave: [NodeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:159](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L159)

##### node:pointerdown [#nodepointerdown]

```ts
node:pointerdown: [NodeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:160](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L160)

##### node:click [#nodeclick]

```ts
node:click: [NodeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:161](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L161)

##### node:dblclick [#nodedblclick]

```ts
node:dblclick: [NodeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:162](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L162)

##### node:contextmenu [#nodecontextmenu]

```ts
node:contextmenu: [NodeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:163](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L163)

##### node:wheel [#nodewheel]

```ts
node:wheel: [NodeGraphEvent<Record<string, unknown>, WheelEvent>];
```

Defined in: [types.ts:164](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L164)

##### edge:pointerover [#edgepointerover]

```ts
edge:pointerover: [EdgeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:166](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L166)

##### edge:pointerenter [#edgepointerenter]

```ts
edge:pointerenter: [EdgeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:167](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L167)

##### edge:pointermove [#edgepointermove]

```ts
edge:pointermove: [EdgeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:168](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L168)

##### edge:pointerleave [#edgepointerleave]

```ts
edge:pointerleave: [EdgeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:169](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L169)

##### edge:pointerdown [#edgepointerdown]

```ts
edge:pointerdown: [EdgeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:170](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L170)

##### edge:click [#edgeclick]

```ts
edge:click: [EdgeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:171](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L171)

##### edge:dblclick [#edgedblclick]

```ts
edge:dblclick: [EdgeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:172](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L172)

##### edge:contextmenu [#edgecontextmenu]

```ts
edge:contextmenu: [EdgeGraphEvent<Record<string, unknown>, MouseEvent>];
```

Defined in: [types.ts:173](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L173)

##### edge:wheel [#edgewheel]

```ts
edge:wheel: [EdgeGraphEvent<Record<string, unknown>, WheelEvent>];
```

Defined in: [types.ts:174](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L174)

##### combo:pointerdown [#combopointerdown]

```ts
combo:pointerdown: [ComboGraphEvent<MouseEvent>];
```

Defined in: [types.ts:176](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L176)

##### combo:click [#comboclick]

```ts
combo:click: [ComboGraphEvent<MouseEvent>];
```

Defined in: [types.ts:177](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L177)

##### combo:dblclick [#combodblclick]

```ts
combo:dblclick: [ComboGraphEvent<MouseEvent>];
```

Defined in: [types.ts:178](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L178)

##### combo:contextmenu [#combocontextmenu]

```ts
combo:contextmenu: [ComboGraphEvent<MouseEvent>];
```

Defined in: [types.ts:179](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L179)

##### canvas:pointermove [#canvaspointermove]

```ts
canvas:pointermove: [CanvasGraphEvent<MouseEvent>];
```

Defined in: [types.ts:181](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L181)

##### canvas:pointerdown [#canvaspointerdown]

```ts
canvas:pointerdown: [CanvasGraphEvent<MouseEvent>];
```

Defined in: [types.ts:182](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L182)

##### canvas:pointerup [#canvaspointerup]

```ts
canvas:pointerup: [CanvasGraphEvent<MouseEvent>];
```

Defined in: [types.ts:183](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L183)

##### canvas:click [#canvasclick]

```ts
canvas:click: [CanvasGraphEvent<MouseEvent>];
```

Defined in: [types.ts:184](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L184)

##### canvas:dblclick [#canvasdblclick]

```ts
canvas:dblclick: [CanvasGraphEvent<MouseEvent>];
```

Defined in: [types.ts:185](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L185)

##### canvas:contextmenu [#canvascontextmenu]

```ts
canvas:contextmenu: [CanvasGraphEvent<MouseEvent>];
```

Defined in: [types.ts:186](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L186)

##### canvas:wheel [#canvaswheel]

```ts
canvas:wheel: [CanvasGraphEvent<WheelEvent>];
```

Defined in: [types.ts:187](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L187)

##### selection:clear [#selectionclear]

```ts
selection:clear: [{
  ids: string[];
  event: MouseEvent;
}];
```

Defined in: [types.ts:189](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L189)

##### node:selectchange [#nodeselectchange]

```ts
node:selectchange: [{
  nodeId: string;
  selected: boolean;
  event: MouseEvent;
}];
```

Defined in: [types.ts:190](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L190)

##### edge:selectchange [#edgeselectchange]

```ts
edge:selectchange: [{
  edgeId: string;
  edgeIndex: number;
  source: string;
  target: string;
  selected: boolean;
  event: MouseEvent;
}];
```

Defined in: [types.ts:191](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L191)

##### node:dragstart [#nodedragstart]

```ts
node:dragstart: [{
  nodeId: string;
  nodeIds: string[];
  event: MouseEvent;
}];
```

Defined in: [types.ts:202](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L202)

##### node:drag [#nodedrag]

```ts
node:drag: [{
  nodeId: string;
  nodeIds: string[];
  dx: number;
  dy: number;
  event: MouseEvent;
}];
```

Defined in: [types.ts:203](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L203)

##### node:dragend [#nodedragend]

```ts
node:dragend: [{
  nodeId: string;
  nodeIds: string[];
}];
```

Defined in: [types.ts:206](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L206)

##### combo:dragstart [#combodragstart]

```ts
combo:dragstart: [{
  comboId: string;
  event: MouseEvent;
}];
```

Defined in: [types.ts:207](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L207)

##### combo:drag [#combodrag]

```ts
combo:drag: [{
  comboId: string;
  dx: number;
  dy: number;
  event: MouseEvent;
}];
```

Defined in: [types.ts:208](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L208)

##### combo:dragend [#combodragend]

```ts
combo:dragend: [{
  comboId: string;
}];
```

Defined in: [types.ts:209](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L209)

##### edge:dragstart [#edgedragstart]

```ts
edge:dragstart: [{
  edgeId?: string;
  edgeIndex: number;
  source: string;
  target: string;
  dragEnd: "source" | "target";
  event: MouseEvent;
}];
```

Defined in: [types.ts:210](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L210)

##### edge:drag [#edgedrag]

```ts
edge:drag: [{
  edgeId?: string;
  edgeIndex: number;
  source: string;
  target: string;
  dragEnd: "source" | "target";
  event: MouseEvent;
}];
```

Defined in: [types.ts:220](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L220)

##### edge:dragend [#edgedragend]

```ts
edge:dragend: [{
  edgeId?: string;
  edgeIndex: number;
  source: string;
  target: string;
  originalSource: string;
  originalTarget: string;
  reconnected: boolean;
  newEndpoint?: string;
  event: MouseEvent;
}];
```

Defined in: [types.ts:230](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L230)

##### brush:select [#brushselect]

```ts
brush:select: [{
  nodeIds: string[];
}];
```

Defined in: [types.ts:243](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L243)

##### brush:end [#brushend]

```ts
brush:end: [{
  nodeIds: string[];
}];
```

Defined in: [types.ts:244](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L244)

##### lasso:select [#lassoselect]

```ts
lasso:select: [{
  nodeIds: string[];
}];
```

Defined in: [types.ts:245](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L245)

##### lasso:end [#lassoend]

```ts
lasso:end: [{
  nodeIds: string[];
}];
```

Defined in: [types.ts:246](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L246)

##### beforelayout [#beforelayout]

```ts
beforelayout: [{
  nodeCount: number;
}];
```

Defined in: [types.ts:248](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L248)

##### layout:start [#layoutstart]

```ts
layout:start: [{
  nodeCount: number;
}];
```

Defined in: [types.ts:249](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L249)

##### layout:end [#layoutend]

```ts
layout:end: [{
  duration: number;
  nodeCount: number;
}];
```

Defined in: [types.ts:250](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L250)

##### afterlayout [#afterlayout]

```ts
afterlayout: [{
  duration: number;
  nodeCount: number;
}];
```

Defined in: [types.ts:251](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L251)

##### beforerender [#beforerender-1]

```ts
beforerender: [{
  nodeCount: number;
  edgeCount: number;
}];
```

Defined in: [types.ts:252](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L252)

##### afterrender [#afterrender]

```ts
afterrender: [{
  nodeCount: number;
  edgeCount: number;
}];
```

Defined in: [types.ts:253](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L253)

##### resize [#resize]

```ts
resize: [{
  width: number;
  height: number;
}];
```

Defined in: [types.ts:254](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L254)

##### destroy [#destroy-6]

```ts
destroy: [];
```

Defined in: [types.ts:255](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L255)

##### datachange [#datachange]

```ts
datachange: [{
  nodeCount: number;
  edgeCount: number;
}];
```

Defined in: [types.ts:256](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L256)

##### afteradditem [#afteradditem]

```ts
afteradditem: [
  | {
  type: "node";
  id: string;
}
  | {
  type: "edge";
  id: string;
  source: string;
  target: string;
}];
```

Defined in: [types.ts:257](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L257)

##### afterremoveitem [#afterremoveitem]

```ts
afterremoveitem: [{
  type: "node" | "edge";
  id: string;
}];
```

Defined in: [types.ts:261](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L261)

##### afterupdateitem [#afterupdateitem]

```ts
afterupdateitem: [
  | {
  type: "node";
  id: string;
  action: "position" | "data";
}
  | {
  type: "edge";
  id: string;
  action: "data";
}];
```

Defined in: [types.ts:262](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L262)

##### combo:collapse [#combocollapse]

```ts
combo:collapse: [{
  comboId: string;
}];
```

Defined in: [types.ts:267](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L267)

##### combo:expand [#comboexpand]

```ts
combo:expand: [{
  comboId: string;
}];
```

Defined in: [types.ts:268](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L268)

***

### GraphEdge [#graphedge]

Defined in: [types.ts:278](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L278)

Edge: at least source and target (node ids); optional data and states.

#### Properties [#properties-37]

##### id? [#id-6]

```ts
optional id?: string;
```

Defined in: [types.ts:279](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L279)

##### source [#source-8]

```ts
source: string;
```

Defined in: [types.ts:280](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L280)

##### target [#target-8]

```ts
target: string;
```

Defined in: [types.ts:281](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L281)

##### data? [#data-14]

```ts
optional data?: EdgeData;
```

Defined in: [types.ts:282](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L282)

##### states? [#states-3]

```ts
optional states?: ElementState[];
```

Defined in: [types.ts:283](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L283)

***

### NodeModel [#nodemodel]

Defined in: [types.ts:290](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L290)

Read-only normalized node view returned by Graph query APIs.
The view is backed by Graph; update it through Graph data/state APIs.

#### Properties [#properties-38]

##### id [#id-7]

```ts
readonly id: string;
```

Defined in: [types.ts:291](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L291)

##### name? [#name-2]

```ts
readonly optional name?: string;
```

Defined in: [types.ts:292](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L292)

##### x [#x-17]

```ts
readonly x: number;
```

Defined in: [types.ts:293](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L293)

##### y [#y-17]

```ts
readonly y: number;
```

Defined in: [types.ts:294](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L294)

##### data? [#data-15]

```ts
readonly optional data?: Readonly<Record<string, unknown>>;
```

Defined in: [types.ts:295](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L295)

##### states [#states-4]

```ts
readonly states: ReadonlySet<ElementState>;
```

Defined in: [types.ts:296](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L296)

***

### EdgeModel [#edgemodel]

Defined in: [types.ts:303](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L303)

Read-only normalized edge view returned by Graph query APIs.
The view is backed by Graph; update it through Graph data/state APIs.

#### Properties [#properties-39]

##### id [#id-8]

```ts
readonly id: string;
```

Defined in: [types.ts:304](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L304)

##### source [#source-9]

```ts
readonly source: string;
```

Defined in: [types.ts:305](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L305)

##### target [#target-9]

```ts
readonly target: string;
```

Defined in: [types.ts:306](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L306)

##### data? [#data-16]

```ts
readonly optional data?: Readonly<Record<string, unknown>>;
```

Defined in: [types.ts:307](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L307)

##### states [#states-5]

```ts
readonly states: ReadonlySet<ElementState>;
```

Defined in: [types.ts:308](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L308)

***

### ParallelEdgesConfig [#paralleledgesconfig]

Defined in: [types.ts:312](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L312)

Configuration for automatic same-endpoint edge separation.

#### Properties [#properties-40]

##### enabled? [#enabled]

```ts
optional enabled?: boolean;
```

Defined in: [types.ts:313](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L313)

##### offset? [#offset-1]

```ts
optional offset?: number;
```

Defined in: [types.ts:315](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L315)

Offset step in graph coordinates. Defaults to 20.

##### mergeBy? [#mergeby]

```ts
optional mergeBy?: ("source" | "target")[];
```

Defined in: [types.ts:317](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L317)

Grouping fields. Currently only source/target grouping is supported.

##### includeReverse? [#includereverse]

```ts
optional includeReverse?: boolean;
```

Defined in: [types.ts:319](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L319)

Whether A->B and B->A belong to the same separation group. Defaults to true.

##### minOffset? [#minoffset]

```ts
optional minOffset?: number;
```

Defined in: [types.ts:321](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L321)

Clamp minimum absolute offset for non-center parallel edges. Defaults to 0.

##### maxOffset? [#maxoffset]

```ts
optional maxOffset?: number;
```

Defined in: [types.ts:323](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L323)

Clamp maximum absolute offset. Defaults to 80.

***

### GraphData [#graphdata]

Defined in: [types.ts:340](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L340)

Graph data: nodes, edges, and optional combos.

#### Properties [#properties-41]

##### nodes [#nodes-1]

```ts
nodes: GraphNode[];
```

Defined in: [types.ts:341](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L341)

##### edges [#edges]

```ts
edges: GraphEdge[];
```

Defined in: [types.ts:342](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L342)

##### combos? [#combos-1]

```ts
optional combos?: ComboData[];
```

Defined in: [types.ts:343](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L343)

***

### NodeStateStyleOverride [#nodestatestyleoverride]

Defined in: [types.ts:350](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L350)

Style overrides applied per node state.

#### Properties [#properties-42]

##### fill? [#fill]

```ts
optional fill?: string;
```

Defined in: [types.ts:351](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L351)

##### stroke? [#stroke]

```ts
optional stroke?: string;
```

Defined in: [types.ts:352](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L352)

##### strokeWidth? [#strokewidth]

```ts
optional strokeWidth?: number;
```

Defined in: [types.ts:353](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L353)

##### opacity? [#opacity]

```ts
optional opacity?: number;
```

Defined in: [types.ts:354](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L354)

##### haloWidth? [#halowidth]

```ts
optional haloWidth?: number;
```

Defined in: [types.ts:355](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L355)

***

### NodeBadgeItem [#nodebadgeitem]

Defined in: [types.ts:368](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L368)

#### Properties [#properties-43]

##### kind [#kind]

```ts
kind: NodeBadgeKind;
```

Defined in: [types.ts:369](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L369)

##### value? [#value]

```ts
optional value?: string | number;
```

Defined in: [types.ts:370](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L370)

##### text? [#text]

```ts
optional text?: string;
```

Defined in: [types.ts:371](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L371)

##### icon? [#icon]

```ts
optional icon?: string;
```

Defined in: [types.ts:372](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L372)

##### iconFontFamily? [#iconfontfamily]

```ts
optional iconFontFamily?: string;
```

Defined in: [types.ts:373](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L373)

##### fill? [#fill-1]

```ts
optional fill?: string;
```

Defined in: [types.ts:374](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L374)

##### color? [#color]

```ts
optional color?: string;
```

Defined in: [types.ts:375](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L375)

***

### LabelOptions [#labeloptions]

Defined in: [types.ts:385](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L385)

Engine-managed rendering policies shared by node and edge labels.

#### Properties [#properties-44]

##### scaleWithZoom? [#scalewithzoom]

```ts
optional scaleWithZoom?: boolean;
```

Defined in: [types.ts:390](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L390)

Whether engine-managed label dimensions scale with camera zoom.
Defaults to true. Edge labels already use fixed screen-space dimensions.

##### hideOnLowZoom? [#hideonlowzoom]

```ts
optional hideOnLowZoom?: boolean;
```

Defined in: [types.ts:395](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L395)

Whether labels are hidden below their low-zoom thresholds.
Defaults to true. Configure the thresholds with nodeMinZoom and edgeMinZoom.

##### hideOnCollision? [#hideoncollision]

```ts
optional hideOnCollision?: boolean;
```

Defined in: [types.ts:397](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L397)

Whether labels that collide with an earlier label are hidden. Defaults to true.

##### nodeMinZoom? [#nodeminzoom]

```ts
optional nodeMinZoom?: number;
```

Defined in: [types.ts:399](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L399)

Minimum camera zoom for node labels. Defaults to 0.3.

##### edgeMinZoom? [#edgeminzoom]

```ts
optional edgeMinZoom?: number;
```

Defined in: [types.ts:401](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L401)

Minimum camera zoom for edge labels. Defaults to 0.5.

***

### ResolvedLabelStyle [#resolvedlabelstyle]

Defined in: [types.ts:405](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L405)

Final, function-free label style passed to a custom label renderer.

#### Properties [#properties-45]

##### labelFontSize [#labelfontsize]

```ts
labelFontSize: number;
```

Defined in: [types.ts:407](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L407)

Canvas backing-store pixels after DPR/zoom conversion.

##### labelFontFamily [#labelfontfamily]

```ts
labelFontFamily: string;
```

Defined in: [types.ts:408](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L408)

##### labelFontWeight [#labelfontweight]

```ts
labelFontWeight: string;
```

Defined in: [types.ts:409](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L409)

##### labelColor [#labelcolor]

```ts
labelColor: string;
```

Defined in: [types.ts:410](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L410)

##### labelPlacement [#labelplacement]

```ts
labelPlacement: "center" | "top" | "bottom" | "left" | "right" | "start" | "end";
```

Defined in: [types.ts:411](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L411)

##### labelOffsetX [#labeloffsetx]

```ts
labelOffsetX: number;
```

Defined in: [types.ts:413](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L413)

Canvas backing-store pixels after DPR/zoom conversion.

##### labelOffsetY [#labeloffsety]

```ts
labelOffsetY: number;
```

Defined in: [types.ts:415](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L415)

Canvas backing-store pixels after DPR/zoom conversion.

##### labelBackground [#labelbackground]

```ts
labelBackground: string | false;
```

Defined in: [types.ts:416](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L416)

##### labelBackgroundPadding [#labelbackgroundpadding]

```ts
labelBackgroundPadding: number;
```

Defined in: [types.ts:418](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L418)

Canvas backing-store pixels after DPR/zoom conversion.

##### labelMaxWidth [#labelmaxwidth]

```ts
labelMaxWidth: number;
```

Defined in: [types.ts:420](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L420)

Canvas backing-store pixels after DPR/zoom conversion; 0 means unlimited.

##### labelAutoRotate [#labelautorotate]

```ts
labelAutoRotate: boolean;
```

Defined in: [types.ts:421](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L421)

***

### LabelLayout [#labellayout]

Defined in: [types.ts:425](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L425)

Measurement result returned by a custom label renderer.

#### Type Parameters [#type-parameters-23]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Properties [#properties-46]

##### width [#width-1]

```ts
width: number;
```

Defined in: [types.ts:427](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L427)

Full visual width in Canvas backing-store pixels.

##### height [#height-1]

```ts
height: number;
```

Defined in: [types.ts:429](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L429)

Full visual height in Canvas backing-store pixels.

##### data? [#data-17]

```ts
optional data?: T;
```

Defined in: [types.ts:431](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L431)

Renderer-owned data passed from measure() to draw() for the same label.

***

### NodeLabelParams [#nodelabelparams]

Defined in: [types.ts:443](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L443)

Custom label renderer context for a node label.

#### Extends [#extends-11]

* `LabelParamsBase`

#### Properties [#properties-47]

##### ctx [#ctx-2]

```ts
ctx: CanvasRenderingContext2D;
```

Defined in: [types.ts:435](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L435)

###### Inherited from [#inherited-from-54]

```ts
LabelParamsBase.ctx
```

##### text [#text-1]

```ts
text: string;
```

Defined in: [types.ts:436](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L436)

###### Inherited from [#inherited-from-55]

```ts
LabelParamsBase.text
```

##### style [#style-4]

```ts
style: Readonly<ResolvedLabelStyle>;
```

Defined in: [types.ts:437](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L437)

###### Inherited from [#inherited-from-56]

```ts
LabelParamsBase.style
```

##### dpr [#dpr-3]

```ts
dpr: number;
```

Defined in: [types.ts:438](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L438)

###### Inherited from [#inherited-from-57]

```ts
LabelParamsBase.dpr
```

##### zoom [#zoom-4]

```ts
zoom: number;
```

Defined in: [types.ts:439](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L439)

###### Inherited from [#inherited-from-58]

```ts
LabelParamsBase.zoom
```

##### type [#type-2]

```ts
type: "node";
```

Defined in: [types.ts:444](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L444)

##### item [#item]

```ts
item: GraphNode;
```

Defined in: [types.ts:445](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L445)

##### node [#node-4]

```ts
node: GraphNode;
```

Defined in: [types.ts:446](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L446)

***

### EdgeLabelParams [#edgelabelparams]

Defined in: [types.ts:450](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L450)

Custom label renderer context for an edge label.

#### Extends [#extends-12]

* `LabelParamsBase`

#### Properties [#properties-48]

##### ctx [#ctx-3]

```ts
ctx: CanvasRenderingContext2D;
```

Defined in: [types.ts:435](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L435)

###### Inherited from [#inherited-from-59]

```ts
LabelParamsBase.ctx
```

##### text [#text-2]

```ts
text: string;
```

Defined in: [types.ts:436](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L436)

###### Inherited from [#inherited-from-60]

```ts
LabelParamsBase.text
```

##### style [#style-5]

```ts
style: Readonly<ResolvedLabelStyle>;
```

Defined in: [types.ts:437](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L437)

###### Inherited from [#inherited-from-61]

```ts
LabelParamsBase.style
```

##### dpr [#dpr-4]

```ts
dpr: number;
```

Defined in: [types.ts:438](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L438)

###### Inherited from [#inherited-from-62]

```ts
LabelParamsBase.dpr
```

##### zoom [#zoom-5]

```ts
zoom: number;
```

Defined in: [types.ts:439](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L439)

###### Inherited from [#inherited-from-63]

```ts
LabelParamsBase.zoom
```

##### type [#type-3]

```ts
type: "edge";
```

Defined in: [types.ts:451](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L451)

##### item [#item-1]

```ts
item: GraphEdge;
```

Defined in: [types.ts:452](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L452)

##### edge [#edge]

```ts
edge: GraphEdge;
```

Defined in: [types.ts:453](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L453)

##### source [#source-10]

```ts
source: GraphNode;
```

Defined in: [types.ts:454](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L454)

##### target [#target-10]

```ts
target: GraphNode;
```

Defined in: [types.ts:455](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L455)

***

### LabelRenderer [#labelrenderer]

Defined in: [types.ts:467](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L467)

Shared custom label renderer protocol for node and edge labels.

#### Type Parameters [#type-parameters-24]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Methods [#methods-15]

##### measure() [#measure-1]

```ts
measure(params: LabelMeasureParams): LabelLayout<T>;
```

Defined in: [types.ts:468](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L468)

###### Parameters [#parameters-106]

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `params`  | [`LabelMeasureParams`](#labelmeasureparams) |

###### Returns [#returns-138]

[`LabelLayout`](#labellayout)\<`T`>

##### draw() [#draw-1]

```ts
draw(params: LabelDrawParams<T>): void;
```

Defined in: [types.ts:469](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L469)

###### Parameters [#parameters-107]

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `params`  | [`LabelDrawParams`](#labeldrawparams)\<`T`> |

###### Returns [#returns-139]

`void`

***

### NodeDecorationConfig [#nodedecorationconfig]

Defined in: [types.ts:472](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L472)

#### Type Parameters [#type-parameters-25]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Properties [#properties-49]

##### renderer [#renderer]

```ts
renderer: string;
```

Defined in: [types.ts:473](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L473)

##### minZoom? [#minzoom-3]

```ts
optional minZoom?: number;
```

Defined in: [types.ts:475](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L475)

Minimum camera zoom for this decoration. Defaults to 0.

##### hideOnCollision? [#hideoncollision-1]

```ts
optional hideOnCollision?: boolean;
```

Defined in: [types.ts:477](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L477)

Whether collisions hide this decoration. Defaults to true.

##### placement? [#placement-1]

```ts
optional placement?: NodeStyleValue<NodeDecorationPlacement>;
```

Defined in: [types.ts:478](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L478)

##### attachment? [#attachment]

```ts
optional attachment?: NodeDecorationAttachment;
```

Defined in: [types.ts:480](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L480)

Defaults to `boundary`, which centers the decoration on the node edge.

##### anchor? [#anchor]

```ts
optional anchor?: NodeDecorationAnchor;
```

Defined in: [types.ts:482](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L482)

Which edge of the decoration box is aligned to the node-side anchor.

##### crossOffsetRatio? [#crossoffsetratio-1]

```ts
optional crossOffsetRatio?: NodeStyleValue<number>;
```

Defined in: [types.ts:484](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L484)

Cross-axis offset relative to the node width/height.

##### boundaryOverlap? [#boundaryoverlap]

```ts
optional boundaryOverlap?: NodeStyleValue<number | "half-badge">;
```

Defined in: [types.ts:486](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L486)

With `anchor: start`, overlap by CSS pixels or half the boundary-adjacent badge height.

##### layout? [#layout-2]

```ts
optional layout?: "single" | "stack";
```

Defined in: [types.ts:488](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L488)

Enables engine-managed vertical item stacking.

##### items? [#items]

```ts
optional items?: T[] | ((node: GraphNode) => T[]);
```

Defined in: [types.ts:489](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L489)

##### sort? [#sort]

```ts
optional sort?: "none" | "width-desc";
```

Defined in: [types.ts:490](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L490)

##### maxVisible? [#maxvisible]

```ts
optional maxVisible?: number;
```

Defined in: [types.ts:491](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L491)

##### overflow? [#overflow]

```ts
optional overflow?: "clip" | "hover-expand";
```

Defined in: [types.ts:492](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L492)

##### overflowData? [#overflowdata]

```ts
optional overflowData?: 
  | T
  | ((hiddenCount: number, node: GraphNode) => T);
```

Defined in: [types.ts:493](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L493)

##### itemGap? [#itemgap]

```ts
optional itemGap?: number;
```

Defined in: [types.ts:494](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L494)

##### offsetX? [#offsetx]

```ts
optional offsetX?: number;
```

Defined in: [types.ts:495](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L495)

##### offsetY? [#offsety]

```ts
optional offsetY?: number;
```

Defined in: [types.ts:496](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L496)

##### data? [#data-18]

```ts
optional data?: T | ((node: GraphNode) => T);
```

Defined in: [types.ts:497](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L497)

***

### NodeStyleConfig [#nodestyleconfig]

Defined in: [types.ts:500](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L500)

#### Properties [#properties-50]

##### fill? [#fill-2]

```ts
optional fill?: NodeStyleValue<string>;
```

Defined in: [types.ts:501](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L501)

##### size? [#size]

```ts
optional size?: NodeStyleValue<number>;
```

Defined in: [types.ts:502](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L502)

##### width? [#width-2]

```ts
optional width?: NodeStyleValue<number>;
```

Defined in: [types.ts:503](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L503)

##### height? [#height-2]

```ts
optional height?: NodeStyleValue<number>;
```

Defined in: [types.ts:504](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L504)

##### stroke? [#stroke-1]

```ts
optional stroke?: NodeStyleValue<string>;
```

Defined in: [types.ts:505](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L505)

##### strokeWidth? [#strokewidth-1]

```ts
optional strokeWidth?: NodeStyleValue<number>;
```

Defined in: [types.ts:506](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L506)

##### opacity? [#opacity-1]

```ts
optional opacity?: NodeStyleValue<number>;
```

Defined in: [types.ts:507](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L507)

##### borderRadius? [#borderradius-1]

```ts
optional borderRadius?: NodeStyleValue<number>;
```

Defined in: [types.ts:508](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L508)

##### label? [#label]

```ts
optional label?: NodeStyleValue<string | false>;
```

Defined in: [types.ts:509](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L509)

##### labelFontSize? [#labelfontsize-1]

```ts
optional labelFontSize?: NodeStyleValue<number>;
```

Defined in: [types.ts:510](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L510)

##### labelFontFamily? [#labelfontfamily-1]

```ts
optional labelFontFamily?: NodeStyleValue<string>;
```

Defined in: [types.ts:511](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L511)

##### labelFontWeight? [#labelfontweight-1]

```ts
optional labelFontWeight?: NodeStyleValue<string>;
```

Defined in: [types.ts:512](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L512)

##### labelColor? [#labelcolor-1]

```ts
optional labelColor?: NodeStyleValue<string>;
```

Defined in: [types.ts:513](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L513)

##### labelPlacement? [#labelplacement-1]

```ts
optional labelPlacement?: NodeStyleValue<LabelPlacement>;
```

Defined in: [types.ts:514](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L514)

##### labelOffsetX? [#labeloffsetx-1]

```ts
optional labelOffsetX?: NodeStyleValue<number>;
```

Defined in: [types.ts:515](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L515)

##### labelOffsetY? [#labeloffsety-1]

```ts
optional labelOffsetY?: NodeStyleValue<number>;
```

Defined in: [types.ts:516](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L516)

##### labelBackground? [#labelbackground-1]

```ts
optional labelBackground?: NodeStyleValue<string | false>;
```

Defined in: [types.ts:517](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L517)

##### labelBackgroundPadding? [#labelbackgroundpadding-1]

```ts
optional labelBackgroundPadding?: NodeStyleValue<number>;
```

Defined in: [types.ts:518](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L518)

##### labelMaxWidth? [#labelmaxwidth-1]

```ts
optional labelMaxWidth?: NodeStyleValue<number>;
```

Defined in: [types.ts:519](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L519)

##### icon? [#icon-1]

```ts
optional icon?: NodeStyleValue<string | false>;
```

Defined in: [types.ts:520](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L520)

##### iconWidth? [#iconwidth]

```ts
optional iconWidth?: NodeStyleValue<number>;
```

Defined in: [types.ts:521](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L521)

##### iconHeight? [#iconheight]

```ts
optional iconHeight?: NodeStyleValue<number>;
```

Defined in: [types.ts:522](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L522)

##### iconType? [#icontype]

```ts
optional iconType?: NodeStyleValue<"text" | "image">;
```

Defined in: [types.ts:523](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L523)

##### iconFontFamily? [#iconfontfamily-1]

```ts
optional iconFontFamily?: NodeStyleValue<string>;
```

Defined in: [types.ts:524](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L524)

##### iconFontSize? [#iconfontsize]

```ts
optional iconFontSize?: NodeStyleValue<number>;
```

Defined in: [types.ts:525](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L525)

##### iconColor? [#iconcolor]

```ts
optional iconColor?: NodeStyleValue<string>;
```

Defined in: [types.ts:526](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L526)

##### iconOffsetX? [#iconoffsetx]

```ts
optional iconOffsetX?: NodeStyleValue<number>;
```

Defined in: [types.ts:527](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L527)

##### iconOffsetY? [#iconoffsety]

```ts
optional iconOffsetY?: NodeStyleValue<number>;
```

Defined in: [types.ts:528](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L528)

***

### NodeConfig [#nodeconfig]

Defined in: [types.ts:532](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L532)

Node config: type and style (WebGL-capable only).

#### Properties [#properties-51]

##### type? [#type-4]

```ts
optional type?: 
  | string & {
}
  | "circle"
  | "rect";
```

Defined in: [types.ts:533](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L533)

##### labelRenderer? [#labelrenderer-1]

```ts
optional labelRenderer?: string;
```

Defined in: [types.ts:535](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L535)

Registered custom label renderer name.

##### decorations? [#decorations]

```ts
optional decorations?: NodeDecorationConfig<unknown>[];
```

Defined in: [types.ts:536](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L536)

##### autoExternalLabelPlacement? [#autoexternallabelplacement]

```ts
optional autoExternalLabelPlacement?: boolean;
```

Defined in: [types.ts:538](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L538)

Keeps the default node label below decorated nodes unless labelPlacement is explicit.

##### style? [#style-6]

```ts
optional style?: 
  | NodeStyleConfig
  | ((node: GraphNode) => Partial<NodeStyleConfig>);
```

Defined in: [types.ts:539](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L539)

##### stateStyles? [#statestyles-4]

```ts
optional stateStyles?: Partial<Record<ElementState, NodeStateStyleOverride>>;
```

Defined in: [types.ts:540](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L540)

***

### EdgeStateStyleOverride [#edgestatestyleoverride]

Defined in: [types.ts:547](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L547)

Style overrides applied per edge state.

#### Properties [#properties-52]

##### stroke? [#stroke-2]

```ts
optional stroke?: string;
```

Defined in: [types.ts:548](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L548)

##### lineWidth? [#linewidth]

```ts
optional lineWidth?: number;
```

Defined in: [types.ts:549](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L549)

##### opacity? [#opacity-2]

```ts
optional opacity?: number;
```

Defined in: [types.ts:550](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L550)

##### lineDash? [#linedash]

```ts
optional lineDash?: number[];
```

Defined in: [types.ts:551](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L551)

***

### EdgeConfig [#edgeconfig]

Defined in: [types.ts:555](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L555)

Edge config: type and style (WebGL-capable only).

#### Properties [#properties-53]

##### type? [#type-5]

```ts
optional type?: 
  | string & {
}
  | "line"
  | "arc"
  | "polyline"
  | "cubic";
```

Defined in: [types.ts:556](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L556)

##### labelRenderer? [#labelrenderer-2]

```ts
optional labelRenderer?: string;
```

Defined in: [types.ts:558](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L558)

Registered custom label renderer name.

##### parallelEdges? [#paralleledges]

```ts
optional parallelEdges?: boolean | ParallelEdgesConfig;
```

Defined in: [types.ts:559](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L559)

##### style? [#style-7]

```ts
optional style?: {
  stroke?: EdgeStyleValue<string>;
  lineWidth?: EdgeStyleValue<number>;
  curvature?: EdgeStyleValue<number>;
  curveOffset?: EdgeStyleValue<number>;
  endArrow?: EdgeStyleValue<boolean>;
  startArrow?: EdgeStyleValue<boolean>;
  arrowSize?: EdgeStyleValue<number>;
  lineDash?: EdgeStyleValue<number[]>;
  opacity?: EdgeStyleValue<number>;
  radius?: EdgeStyleValue<number>;
  router?: "orth" | "tree" | "indented" | "fishbone";
  indentTarget?: "left" | "right";
  trunkGap?: number;
  label?: EdgeStyleValue<string | false>;
  labelFontSize?: EdgeStyleValue<number>;
  labelFontFamily?: EdgeStyleValue<string>;
  labelColor?: EdgeStyleValue<string>;
  labelPlacement?: EdgeStyleValue<EdgeLabelPlacement>;
  labelBackground?: EdgeStyleValue<string | false>;
  labelBackgroundPadding?: EdgeStyleValue<number>;
  labelAutoRotate?: EdgeStyleValue<boolean>;
};
```

Defined in: [types.ts:560](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L560)

###### stroke? [#stroke-3]

```ts
optional stroke?: EdgeStyleValue<string>;
```

###### lineWidth? [#linewidth-1]

```ts
optional lineWidth?: EdgeStyleValue<number>;
```

###### curvature? [#curvature]

```ts
optional curvature?: EdgeStyleValue<number>;
```

###### curveOffset? [#curveoffset]

```ts
optional curveOffset?: EdgeStyleValue<number>;
```

###### endArrow? [#endarrow]

```ts
optional endArrow?: EdgeStyleValue<boolean>;
```

###### startArrow? [#startarrow]

```ts
optional startArrow?: EdgeStyleValue<boolean>;
```

###### arrowSize? [#arrowsize]

```ts
optional arrowSize?: EdgeStyleValue<number>;
```

###### lineDash? [#linedash-1]

```ts
optional lineDash?: EdgeStyleValue<number[]>;
```

###### opacity? [#opacity-3]

```ts
optional opacity?: EdgeStyleValue<number>;
```

###### radius? [#radius]

```ts
optional radius?: EdgeStyleValue<number>;
```

###### router? [#router]

```ts
optional router?: "orth" | "tree" | "indented" | "fishbone";
```

###### indentTarget? [#indenttarget]

```ts
optional indentTarget?: "left" | "right";
```

###### trunkGap? [#trunkgap]

```ts
optional trunkGap?: number;
```

###### label? [#label-1]

```ts
optional label?: EdgeStyleValue<string | false>;
```

###### labelFontSize? [#labelfontsize-2]

```ts
optional labelFontSize?: EdgeStyleValue<number>;
```

###### labelFontFamily? [#labelfontfamily-2]

```ts
optional labelFontFamily?: EdgeStyleValue<string>;
```

###### labelColor? [#labelcolor-2]

```ts
optional labelColor?: EdgeStyleValue<string>;
```

###### labelPlacement? [#labelplacement-2]

```ts
optional labelPlacement?: EdgeStyleValue<EdgeLabelPlacement>;
```

###### labelBackground? [#labelbackground-2]

```ts
optional labelBackground?: EdgeStyleValue<string | false>;
```

###### labelBackgroundPadding? [#labelbackgroundpadding-2]

```ts
optional labelBackgroundPadding?: EdgeStyleValue<number>;
```

###### labelAutoRotate? [#labelautorotate-1]

```ts
optional labelAutoRotate?: EdgeStyleValue<boolean>;
```

##### stateStyles? [#statestyles-5]

```ts
optional stateStyles?: Partial<Record<ElementState, EdgeStateStyleOverride>>;
```

Defined in: [types.ts:584](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L584)

***

### LayoutConfig [#layoutconfig]

Defined in: [types.ts:588](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L588)

Layout config: type + algorithm-specific options (aligned with @antv/layout).

#### Indexable [#indexable-1]

```ts
[key: string]: unknown
```

#### Properties [#properties-54]

##### type [#type-6]

```ts
type: string;
```

Defined in: [types.ts:589](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L589)

##### worker? [#worker]

```ts
optional worker?: boolean;
```

Defined in: [types.ts:591](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L591)

Run layout in a Web Worker to avoid blocking the main thread.

##### width? [#width-3]

```ts
optional width?: number;
```

Defined in: [types.ts:593](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L593)

Layout viewport width; defaults to the canvas width (injected by Graph).

##### height? [#height-3]

```ts
optional height?: number;
```

Defined in: [types.ts:595](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L595)

Layout viewport height; defaults to the canvas height (injected by Graph).

##### center? [#center-1]

```ts
optional center?: [number, number];
```

Defined in: [types.ts:597](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L597)

Layout center point; defaults to \[width/2, height/2].

***

### BehaviorOptions [#behavioroptions]

Defined in: [types.ts:602](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L602)

Shared selector included in every normalized behavior configuration.

#### Type Parameters [#type-parameters-26]

| Type Parameter             | Default type |
| -------------------------- | ------------ |
| `TType` *extends* `string` | `string`     |

#### Properties [#properties-55]

##### type [#type-7]

```ts
type: TType;
```

Defined in: [types.ts:603](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L603)

***

### PluginOptions [#pluginoptions]

Defined in: [types.ts:622](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L622)

Shared selector included in every plugin configuration.

#### Extended by [#extended-by-4]

* [`PluginOption`](#pluginoption)

#### Type Parameters [#type-parameters-27]

| Type Parameter             | Default type |
| -------------------------- | ------------ |
| `TType` *extends* `string` | `string`     |

#### Properties [#properties-56]

##### type [#type-8]

```ts
type: TType;
```

Defined in: [types.ts:623](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L623)

***

### PluginOption [#pluginoption]

Defined in: [types.ts:626](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L626)

Shared selector included in every plugin configuration.

#### Extends [#extends-13]

* [`PluginOptions`](#pluginoptions)

#### Indexable [#indexable-2]

```ts
[key: string]: unknown
```

#### Properties [#properties-57]

##### type [#type-9]

```ts
type: string;
```

Defined in: [types.ts:623](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L623)

###### Inherited from [#inherited-from-64]

[`PluginOptions`](#pluginoptions).[`type`](#type-8)

***

### ThemeTokens [#themetokens]

Defined in: [types.ts:631](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L631)

Theme tokens (partial list; extend as needed).

#### Properties [#properties-58]

##### nodeFill? [#nodefill]

```ts
optional nodeFill?: string;
```

Defined in: [types.ts:632](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L632)

##### nodeSize? [#nodesize-1]

```ts
optional nodeSize?: number;
```

Defined in: [types.ts:633](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L633)

##### nodeStroke? [#nodestroke]

```ts
optional nodeStroke?: string;
```

Defined in: [types.ts:634](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L634)

##### nodeStrokeWidth? [#nodestrokewidth]

```ts
optional nodeStrokeWidth?: number;
```

Defined in: [types.ts:635](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L635)

##### edgeStroke? [#edgestroke]

```ts
optional edgeStroke?: string;
```

Defined in: [types.ts:636](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L636)

##### edgeLineWidth? [#edgelinewidth]

```ts
optional edgeLineWidth?: number;
```

Defined in: [types.ts:637](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L637)

##### canvasBackground? [#canvasbackground]

```ts
optional canvasBackground?: string;
```

Defined in: [types.ts:638](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L638)

##### edgeDefaultColor? [#edgedefaultcolor]

```ts
optional edgeDefaultColor?: string;
```

Defined in: [types.ts:639](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L639)

##### edgeCategoryPalette? [#edgecategorypalette]

```ts
optional edgeCategoryPalette?: string[];
```

Defined in: [types.ts:640](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L640)

##### edgeArrow? [#edgearrow]

```ts
optional edgeArrow?: boolean;
```

Defined in: [types.ts:641](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L641)

##### edgeStateStyles? [#edgestatestyles]

```ts
optional edgeStateStyles?: Partial<Record<ElementState, EdgeStateStyleOverride>>;
```

Defined in: [types.ts:642](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L642)

##### nodeStateStyles? [#nodestatestyles]

```ts
optional nodeStateStyles?: Partial<Record<ElementState, NodeStateStyleOverride>>;
```

Defined in: [types.ts:643](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L643)

***

### ComboData [#combodata]

Defined in: [types.ts:650](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L650)

Combo (group container) user data.

#### Properties [#properties-59]

##### id [#id-9]

```ts
id: string;
```

Defined in: [types.ts:651](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L651)

##### parentId? [#parentid]

```ts
optional parentId?: string;
```

Defined in: [types.ts:652](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L652)

##### collapsed? [#collapsed]

```ts
optional collapsed?: boolean;
```

Defined in: [types.ts:653](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L653)

##### style? [#style-8]

```ts
optional style?: Partial<ComboStyleConfig>;
```

Defined in: [types.ts:654](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L654)

##### data? [#data-19]

```ts
optional data?: Record<string, unknown>;
```

Defined in: [types.ts:655](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L655)

##### states? [#states-6]

```ts
optional states?: ElementState[];
```

Defined in: [types.ts:656](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L656)

***

### ComboStateStyleOverride [#combostatestyleoverride]

Defined in: [types.ts:663](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L663)

Style overrides applied per combo state.

#### Properties [#properties-60]

##### fill? [#fill-3]

```ts
optional fill?: ComboStyleValue<string>;
```

Defined in: [types.ts:664](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L664)

##### stroke? [#stroke-4]

```ts
optional stroke?: ComboStyleValue<string>;
```

Defined in: [types.ts:665](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L665)

##### strokeWidth? [#strokewidth-2]

```ts
optional strokeWidth?: ComboStyleValue<number>;
```

Defined in: [types.ts:666](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L666)

##### opacity? [#opacity-4]

```ts
optional opacity?: ComboStyleValue<number>;
```

Defined in: [types.ts:667](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L667)

##### borderRadius? [#borderradius-2]

```ts
optional borderRadius?: ComboStyleValue<number>;
```

Defined in: [types.ts:668](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L668)

##### label? [#label-2]

```ts
optional label?: ComboStyleValue<string | false>;
```

Defined in: [types.ts:669](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L669)

##### labelFontSize? [#labelfontsize-3]

```ts
optional labelFontSize?: ComboStyleValue<number>;
```

Defined in: [types.ts:670](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L670)

##### labelColor? [#labelcolor-3]

```ts
optional labelColor?: ComboStyleValue<string>;
```

Defined in: [types.ts:671](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L671)

***

### ComboStyleConfig [#combostyleconfig]

Defined in: [types.ts:675](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L675)

Combo style configuration.

#### Properties [#properties-61]

##### fill? [#fill-4]

```ts
optional fill?: ComboStyleValue<string>;
```

Defined in: [types.ts:676](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L676)

##### stroke? [#stroke-5]

```ts
optional stroke?: ComboStyleValue<string>;
```

Defined in: [types.ts:677](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L677)

##### strokeWidth? [#strokewidth-3]

```ts
optional strokeWidth?: ComboStyleValue<number>;
```

Defined in: [types.ts:678](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L678)

##### opacity? [#opacity-5]

```ts
optional opacity?: ComboStyleValue<number>;
```

Defined in: [types.ts:679](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L679)

##### borderRadius? [#borderradius-3]

```ts
optional borderRadius?: ComboStyleValue<number>;
```

Defined in: [types.ts:680](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L680)

##### padding? [#padding-1]

```ts
optional padding?: number | [number, number, number, number];
```

Defined in: [types.ts:681](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L681)

##### label? [#label-3]

```ts
optional label?: ComboStyleValue<string | false>;
```

Defined in: [types.ts:682](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L682)

##### labelFontSize? [#labelfontsize-4]

```ts
optional labelFontSize?: ComboStyleValue<number>;
```

Defined in: [types.ts:683](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L683)

##### labelColor? [#labelcolor-4]

```ts
optional labelColor?: ComboStyleValue<string>;
```

Defined in: [types.ts:684](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L684)

##### labelPlacement? [#labelplacement-3]

```ts
optional labelPlacement?: "center" | "top" | "bottom" | "inside";
```

Defined in: [types.ts:685](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L685)

##### collapsedType? [#collapsedtype]

```ts
optional collapsedType?: "circle" | "rect";
```

Defined in: [types.ts:686](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L686)

##### collapsedSize? [#collapsedsize]

```ts
optional collapsedSize?: ComboStyleValue<number | [number, number]>;
```

Defined in: [types.ts:687](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L687)

##### size? [#size-1]

```ts
optional size?: ComboStyleValue<number | [number, number]>;
```

Defined in: [types.ts:688](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L688)

##### count? [#count]

```ts
optional count?: 
  | string
  | boolean
  | ((combo: ComboModel) => string | boolean);
```

Defined in: [types.ts:689](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L689)

##### stateStyles? [#statestyles-6]

```ts
optional stateStyles?: Partial<Record<ElementState, ComboStateStyleOverride>>;
```

Defined in: [types.ts:690](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L690)

***

### ComboConfig [#comboconfig]

Defined in: [types.ts:694](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L694)

Combo config in GraphOptions.

#### Properties [#properties-62]

##### style? [#style-9]

```ts
optional style?: ComboStyleConfig;
```

Defined in: [types.ts:695](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L695)

***

### ComboModel [#combomodel]

Defined in: [types.ts:702](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L702)

Read-only normalized combo view returned by Graph query APIs.
The view is backed by Graph; update it through Graph data/state APIs.

#### Properties [#properties-63]

##### id [#id-10]

```ts
readonly id: string;
```

Defined in: [types.ts:703](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L703)

##### parentId? [#parentid-1]

```ts
readonly optional parentId?: string;
```

Defined in: [types.ts:704](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L704)

##### childNodeIds [#childnodeids]

```ts
readonly childNodeIds: ReadonlySet<string>;
```

Defined in: [types.ts:705](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L705)

##### childComboIds [#childcomboids]

```ts
readonly childComboIds: ReadonlySet<string>;
```

Defined in: [types.ts:706](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L706)

##### collapsed [#collapsed-1]

```ts
readonly collapsed: boolean;
```

Defined in: [types.ts:707](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L707)

##### x [#x-18]

```ts
readonly x: number;
```

Defined in: [types.ts:708](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L708)

##### y [#y-18]

```ts
readonly y: number;
```

Defined in: [types.ts:709](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L709)

##### width [#width-4]

```ts
readonly width: number;
```

Defined in: [types.ts:710](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L710)

##### height [#height-4]

```ts
readonly height: number;
```

Defined in: [types.ts:711](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L711)

##### style? [#style-10]

```ts
readonly optional style?: Readonly<Partial<ComboStyleConfig>>;
```

Defined in: [types.ts:712](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L712)

##### data? [#data-20]

```ts
readonly optional data?: Readonly<Record<string, unknown>>;
```

Defined in: [types.ts:713](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L713)

##### states [#states-7]

```ts
readonly states: ReadonlySet<ElementState>;
```

Defined in: [types.ts:714](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L714)

***

### GraphOptions [#graphoptions]

Defined in: [types.ts:737](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L737)

Full graph options.

#### Properties [#properties-64]

##### container [#container-1]

```ts
container: string | HTMLElement;
```

Defined in: [types.ts:738](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L738)

##### data [#data-21]

```ts
data: GraphData;
```

Defined in: [types.ts:739](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L739)

##### autoFitOnResize? [#autofitonresize]

```ts
optional autoFitOnResize?: number | boolean | FitViewOptions;
```

Defined in: [types.ts:744](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L744)

Refit the graph after its viewport size changes.
Defaults to false so resizing preserves the current camera.

##### label? [#label-4]

```ts
optional label?: LabelOptions;
```

Defined in: [types.ts:746](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L746)

Engine-managed node and edge label rendering policies.

##### node? [#node-5]

```ts
optional node?: NodeConfig;
```

Defined in: [types.ts:747](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L747)

##### edge? [#edge-1]

```ts
optional edge?: EdgeConfig;
```

Defined in: [types.ts:748](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L748)

##### combo? [#combo]

```ts
optional combo?: ComboConfig;
```

Defined in: [types.ts:749](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L749)

##### layout? [#layout-3]

```ts
optional layout?: LayoutConfig;
```

Defined in: [types.ts:750](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L750)

##### behaviors? [#behaviors]

```ts
optional behaviors?: BehaviorOption[];
```

Defined in: [types.ts:751](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L751)

##### transforms? [#transforms]

```ts
optional transforms?: TransformOption[];
```

Defined in: [types.ts:752](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L752)

##### plugins? [#plugins]

```ts
optional plugins?: PluginOption[];
```

Defined in: [types.ts:753](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L753)

##### theme? [#theme]

```ts
optional theme?: ThemeOption;
```

Defined in: [types.ts:754](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L754)

## Type Aliases [#type-aliases]

### BehaviorName [#behaviorname]

```ts
type BehaviorName = 
  | "zoom-canvas"
  | "drag-canvas"
  | "highlight-node"
  | "highlight-edge"
  | "hover-highlight"
  | "drag-node"
  | "click-select"
  | "drag-edge"
  | "brush-select"
  | "lasso-select"
  | "tooltip";
```

Defined in: [behaviors/index.ts:42](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L42)

***

### BuiltInBehaviorConfig [#builtinbehaviorconfig]

```ts
type BuiltInBehaviorConfig = BuiltInBehaviorOptionsMap[keyof BuiltInBehaviorOptionsMap];
```

Defined in: [behaviors/index.ts:70](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/behaviors/index.ts#L70)

***

### Handler [#handler]

```ts
type Handler<Args> = (...args: Args) => void;
```

Defined in: [events.ts:7](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/events.ts#L7)

#### Type Parameters [#type-parameters-28]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

#### Parameters [#parameters-108]

| Parameter | Type   |
| --------- | ------ |
| ...`args` | `Args` |

#### Returns [#returns-140]

`void`

***

### ExtensionCategory [#extensioncategory]

```ts
type ExtensionCategory = 
  | "node"
  | "edge"
  | "label"
  | "decoration"
  | "layout"
  | "behavior"
  | "transform"
  | "plugin";
```

Defined in: [extensions/contracts.ts:17](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L17)

***

### EventArguments [#eventarguments]

```ts
type EventArguments<T> = T extends readonly unknown[] ? T : never;
```

Defined in: [extensions/contracts.ts:99](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L99)

Extracts the argument tuple declared for an event-map entry.

#### Type Parameters [#type-parameters-29]

| Type Parameter |
| -------------- |
| `T`            |

***

### BehaviorEventHandlers [#behavioreventhandlers]

```ts
type BehaviorEventHandlers<TEventMap> = Partial<{ [K in keyof TEventMap]: (args: EventArguments<TEventMap[K]>) => void }>;
```

Defined in: [extensions/contracts.ts:102](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L102)

Event handlers declared by a behavior, keyed by graph event name.

#### Type Parameters [#type-parameters-30]

| Type Parameter                 | Default type                      |
| ------------------------------ | --------------------------------- |
| `TEventMap` *extends* `object` | [`GraphEventMap`](#grapheventmap) |

***

### ExtensionFactory [#extensionfactory]

```ts
type ExtensionFactory<T> = () => T;
```

Defined in: [extensions/contracts.ts:169](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L169)

Recommended registration form for stateful extensions.

#### Type Parameters [#type-parameters-31]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Returns [#returns-141]

`T`

***

### ~~ExtensionConstructor~~ [#extensionconstructor]

```ts
type ExtensionConstructor<T> = () => T;
```

Defined in: [extensions/contracts.ts:175](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L175)

#### Type Parameters [#type-parameters-32]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Returns [#returns-142]

`T`

#### Deprecated [#deprecated-17]

Register a factory that returns the extension instance instead.
Constructor registration remains available during the beta migration period.

***

### ExtensionInput [#extensioninput]

```ts
type ExtensionInput<T> = 
  | T
  | ExtensionFactory<T>
| ExtensionConstructor<T>;
```

Defined in: [extensions/contracts.ts:176](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/contracts.ts#L176)

#### Type Parameters [#type-parameters-33]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

***

### NodeExtensionInput [#nodeextensioninput]

```ts
type NodeExtensionInput = ExtensionInput<NodeExtension>;
```

Defined in: [extensions/node.ts:49](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L49)

***

### LayoutResult [#layoutresult]

```ts
type LayoutResult = {
  nodes: GraphNode & {
     x: number;
     y: number;
  }[];
};
```

Defined in: [layout/runLayout.ts:16](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/layout/runLayout.ts#L16)

#### Properties [#properties-65]

##### nodes [#nodes-2]

```ts
nodes: GraphNode & {
  x: number;
  y: number;
}[];
```

Defined in: [layout/runLayout.ts:16](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/layout/runLayout.ts#L16)

***

### EdgeData [#edgedata]

```ts
type EdgeData = Record<string, unknown>;
```

Defined in: [types.ts:25](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L25)

Extended payload attached to an edge.

***

### BuiltInElementState [#builtinelementstate]

```ts
type BuiltInElementState = 
  | "default"
  | "active"
  | "selected"
  | "disabled"
  | "highlight"
  | "inactive"
  | "hidden";
```

Defined in: [types.ts:28](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L28)

Shared state type for nodes and edges.

***

### ElementState [#elementstate]

```ts
type ElementState = 
  | BuiltInElementState
  | string & {
};
```

Defined in: [types.ts:32](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L32)

Built-in states plus application-defined state names.

***

### NodeState [#nodestate]

```ts
type NodeState = ElementState;
```

Defined in: [types.ts:272](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L272)

Node states for visual differentiation.

***

### EdgeState [#edgestate]

```ts
type EdgeState = ElementState;
```

Defined in: [types.ts:275](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L275)

Edge states for visual differentiation.

***

### NodeStyleValue [#nodestylevalue]

```ts
type NodeStyleValue<T> = T | ((node: GraphNode) => T);
```

Defined in: [types.ts:347](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L347)

Style value or function for node.

#### Type Parameters [#type-parameters-34]

| Type Parameter |
| -------------- |
| `T`            |

***

### LabelPlacement [#labelplacement-4]

```ts
type LabelPlacement = "center" | "top" | "bottom" | "left" | "right";
```

Defined in: [types.ts:359](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L359)

Label placement relative to node.

***

### NodeDecorationAttachment [#nodedecorationattachment]

```ts
type NodeDecorationAttachment = "boundary" | "outside" | "inside";
```

Defined in: [types.ts:362](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L362)

How a node decoration is attached relative to the selected node side.

***

### NodeDecorationAnchor [#nodedecorationanchor]

```ts
type NodeDecorationAnchor = "start" | "center" | "end";
```

Defined in: [types.ts:363](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L363)

***

### NodeDecorationPlacement [#nodedecorationplacement]

```ts
type NodeDecorationPlacement = LabelPlacement | "follow-label";
```

Defined in: [types.ts:364](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L364)

***

### NodeBadgeKind [#nodebadgekind]

```ts
type NodeBadgeKind = "count" | "lock" | "warning" | "favorite" | "text" | "icon";
```

Defined in: [types.ts:366](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L366)

***

### EdgeLabelPlacement [#edgelabelplacement]

```ts
type EdgeLabelPlacement = "start" | "center" | "end";
```

Defined in: [types.ts:379](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L379)

Edge label placement along the edge.

***

### LabelType [#labeltype]

```ts
type LabelType = "node" | "edge";
```

Defined in: [types.ts:382](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L382)

Label owner type shared by node and edge label renderers.

***

### LabelMeasureParams [#labelmeasureparams]

```ts
type LabelMeasureParams = 
  | NodeLabelParams
  | EdgeLabelParams;
```

Defined in: [types.ts:459](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L459)

Parameters passed to LabelRenderer.measure().

***

### LabelDrawParams [#labeldrawparams]

```ts
type LabelDrawParams<T> = 
  | NodeLabelParams & {
  layout: Readonly<LabelLayout<T>>;
}
  | EdgeLabelParams & {
  layout: Readonly<LabelLayout<T>>;
};
```

Defined in: [types.ts:462](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L462)

Parameters passed to LabelRenderer.draw().

#### Type Parameters [#type-parameters-35]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

***

### EdgeStyleValue [#edgestylevalue]

```ts
type EdgeStyleValue<T> = 
  | T
  | ((source: GraphNode, target: GraphNode, edge: GraphEdge) => T);
```

Defined in: [types.ts:544](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L544)

Style value or function for edge (node1, node2, edge).

#### Type Parameters [#type-parameters-36]

| Type Parameter |
| -------------- |
| `T`            |

***

### BehaviorConfig [#behaviorconfig]

```ts
type BehaviorConfig<TType, TOptions> = Readonly<BehaviorOptions<TType> & TOptions>;
```

Defined in: [types.ts:607](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L607)

Type-safe behavior configuration authored by built-in or third-party extensions.

#### Type Parameters [#type-parameters-37]

| Type Parameter                | Default type                   |
| ----------------------------- | ------------------------------ |
| `TType` *extends* `string`    | `string`                       |
| `TOptions` *extends* `object` | `Record`\<`string`, `unknown`> |

***

### BehaviorOption [#behavioroption]

```ts
type BehaviorOption = string | BehaviorConfig;
```

Defined in: [types.ts:613](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L613)

Behavior: string name or config object.

***

### TransformOption [#transformoption]

```ts
type TransformOption = 
  | "process-parallel-edges"
  | string & {
}
  | {
  type: string;
  options?:   | Record<string, unknown>
     | ParallelEdgesConfig;
};
```

Defined in: [types.ts:616](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L616)

Data transform config.

***

### ThemeOption [#themeoption]

```ts
type ThemeOption = 
  | "light"
  | "dark"
  | {
  type: "light" | "dark";
} & Partial<ThemeTokens>;
```

Defined in: [types.ts:647](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L647)

Theme: preset name or object with type and overrides.

***

### ComboStyleValue [#combostylevalue]

```ts
type ComboStyleValue<T> = T | ((combo: ComboModel) => T);
```

Defined in: [types.ts:660](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L660)

Style value or function for combo.

#### Type Parameters [#type-parameters-38]

| Type Parameter |
| -------------- |
| `T`            |

***

### ElementModel [#elementmodel]

```ts
type ElementModel = 
  | NodeModel
  | EdgeModel
  | ComboModel;
```

Defined in: [types.ts:718](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/types.ts#L718)

Normalized graph element model returned by Graph.getElementData().

## Functions [#functions]

### register() [#register]

#### Call Signature [#call-signature-12]

```ts
function register(
   type: "node", 
   name: string, 
   extension: NodeExtensionInput): void;
```

Defined in: [extensions/index.ts:26](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/index.ts#L26)

##### Parameters [#parameters-109]

| Parameter   | Type                                        |
| ----------- | ------------------------------------------- |
| `type`      | `"node"`                                    |
| `name`      | `string`                                    |
| `extension` | [`NodeExtensionInput`](#nodeextensioninput) |

##### Returns [#returns-143]

`void`

#### Call Signature [#call-signature-13]

```ts
function register<T>(
   type: "label", 
   name: string, 
   renderer: ExtensionInput<LabelRenderer<T>>): void;
```

Defined in: [extensions/index.ts:27](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/index.ts#L27)

##### Type Parameters [#type-parameters-39]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

##### Parameters [#parameters-110]

| Parameter  | Type                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| `type`     | `"label"`                                                                     |
| `name`     | `string`                                                                      |
| `renderer` | [`ExtensionInput`](#extensioninput)\<[`LabelRenderer`](#labelrenderer)\<`T`>> |

##### Returns [#returns-144]

`void`

#### Call Signature [#call-signature-14]

```ts
function register(
   type: "edge", 
   name: string, 
   extension: ExtensionInput<EdgeExtension>): void;
```

Defined in: [extensions/index.ts:32](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/index.ts#L32)

##### Parameters [#parameters-111]

| Parameter   | Type                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| `type`      | `"edge"`                                                                |
| `name`      | `string`                                                                |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`EdgeExtension`](#edgeextension)> |

##### Returns [#returns-145]

`void`

#### Call Signature [#call-signature-15]

```ts
function register(
   type: "decoration", 
   name: string, 
   extension: ExtensionInput<DecorationRenderer<unknown>>): void;
```

Defined in: [extensions/index.ts:37](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/index.ts#L37)

##### Parameters [#parameters-112]

| Parameter   | Type                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------- |
| `type`      | `"decoration"`                                                                                |
| `name`      | `string`                                                                                      |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`DecorationRenderer`](#decorationrenderer)\<`unknown`>> |

##### Returns [#returns-146]

`void`

#### Call Signature [#call-signature-16]

```ts
function register<TOptions>(
   type: "layout", 
   name: string, 
   extension: ExtensionInput<LayoutExtension<TOptions>>): void;
```

Defined in: [extensions/index.ts:42](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/index.ts#L42)

##### Type Parameters [#type-parameters-40]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `TOptions`     | `Record`\<`string`, `unknown`> |

##### Parameters [#parameters-113]

| Parameter   | Type                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------- |
| `type`      | `"layout"`                                                                               |
| `name`      | `string`                                                                                 |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`LayoutExtension`](#layoutextension)\<`TOptions`>> |

##### Returns [#returns-147]

`void`

#### Call Signature [#call-signature-17]

```ts
function register<TType, TOptions, TEventMap>(
   type: "behavior", 
   name: TType, 
   extension: ExtensionInput<BehaviorExtension<TOptions, TEventMap>>): void;
```

Defined in: [extensions/index.ts:47](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/index.ts#L47)

##### Type Parameters [#type-parameters-41]

| Type Parameter                                                       | Default type                                    |
| -------------------------------------------------------------------- | ----------------------------------------------- |
| `TType` *extends* `string`                                           | -                                               |
| `TOptions` *extends* [`BehaviorOptions`](#behavioroptions)\<`TType`> | [`BehaviorOptions`](#behavioroptions)\<`TType`> |
| `TEventMap` *extends* `object`                                       | [`GraphEventMap`](#grapheventmap)               |

##### Parameters [#parameters-114]

| Parameter   | Type                                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| `type`      | `"behavior"`                                                                                              |
| `name`      | `TType`                                                                                                   |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`BehaviorExtension`](#behaviorextension)\<`TOptions`, `TEventMap`>> |

##### Returns [#returns-148]

`void`

#### Call Signature [#call-signature-18]

```ts
function register<TOptions>(
   type: "transform", 
   name: string, 
   extension: ExtensionInput<TransformExtension<TOptions>>): void;
```

Defined in: [extensions/index.ts:56](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/index.ts#L56)

##### Type Parameters [#type-parameters-42]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `TOptions`     | `Record`\<`string`, `unknown`> |

##### Parameters [#parameters-115]

| Parameter   | Type                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `type`      | `"transform"`                                                                                  |
| `name`      | `string`                                                                                       |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`TransformExtension`](#transformextension)\<`TOptions`>> |

##### Returns [#returns-149]

`void`

#### Call Signature [#call-signature-19]

```ts
function register<TType, TOptions>(
   type: "plugin", 
   name: TType, 
   extension: ExtensionInput<PluginExtension<TOptions>>): void;
```

Defined in: [extensions/index.ts:61](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/index.ts#L61)

##### Type Parameters [#type-parameters-43]

| Type Parameter                                                   | Default type                                |
| ---------------------------------------------------------------- | ------------------------------------------- |
| `TType` *extends* `string`                                       | -                                           |
| `TOptions` *extends* [`PluginOptions`](#pluginoptions)\<`TType`> | [`PluginOptions`](#pluginoptions)\<`TType`> |

##### Parameters [#parameters-116]

| Parameter   | Type                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------- |
| `type`      | `"plugin"`                                                                               |
| `name`      | `TType`                                                                                  |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`PluginExtension`](#pluginextension)\<`TOptions`>> |

##### Returns [#returns-150]

`void`

***

### ~~registerNode()~~ [#registernode]

```ts
function registerNode(name: string, extension: NodeExtensionInput): void;
```

Defined in: [extensions/node.ts:54](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/node.ts#L54)

#### Parameters [#parameters-117]

| Parameter   | Type                                        |
| ----------- | ------------------------------------------- |
| `name`      | `string`                                    |
| `extension` | [`NodeExtensionInput`](#nodeextensioninput) |

#### Returns [#returns-151]

`void`

#### Deprecated [#deprecated-18]

Use the unified register('node', name, extension) API.

***

### extensionFactory() [#extensionfactory-1]

```ts
function extensionFactory<T>(factory: ExtensionFactory<T>): ExtensionFactory<T>;
```

Defined in: [extensions/registry.ts:21](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/extensions/registry.ts#L21)

Marks a function as the preferred extension factory form.

#### Type Parameters [#type-parameters-44]

| Type Parameter |
| -------------- |
| `T`            |

#### Parameters [#parameters-118]

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `factory` | [`ExtensionFactory`](#extensionfactory)\<`T`> |

#### Returns [#returns-152]

[`ExtensionFactory`](#extensionfactory)\<`T`>

***

### runLayout() [#runlayout]

```ts
function runLayout(
   data: GraphData, 
   config: LayoutConfig, 
   viewport?: {
  width: number;
  height: number;
}, 
runtime?: LayoutRuntime): Promise<LayoutResult>;
```

Defined in: [layout/runLayout.ts:222](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/layout/runLayout.ts#L222)

Run the configured layout on graph data; returns nodes with positions.
Registered extensions and built-in functional layouts take precedence over
worker and @antv/layout execution. Worker failures fall back to the same
main-thread library path.

#### Parameters [#parameters-119]

| Parameter          | Type                                        |
| ------------------ | ------------------------------------------- |
| `data`             | [`GraphData`](#graphdata)                   |
| `config`           | [`LayoutConfig`](#layoutconfig)             |
| `viewport?`        | \{ `width`: `number`; `height`: `number`; } |
| `viewport.width?`  | `number`                                    |
| `viewport.height?` | `number`                                    |
| `runtime?`         | `LayoutRuntime`                             |

#### Returns [#returns-153]

`Promise`\<[`LayoutResult`](#layoutresult)>

***

### resolveTheme() [#resolvetheme]

```ts
function resolveTheme(theme: 
  | "light"
  | "dark"
  | {
  type: "light" | "dark";
} & Partial<ThemeTokens>): ThemeTokens;
```

Defined in: [theme.ts:82](https://github.com/antvis/G6Lite/blob/601c32f1f647f5688f6b52f9d5e0ee7b5c41a2a3/src/theme.ts#L82)

Resolve theme option to a full ThemeTokens object.
String -> preset; object -> preset + overrides.

#### Parameters [#parameters-120]

| Parameter | Type                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `theme`   | \| `"light"` \| `"dark"` \| \{ `type`: `"light"` \| `"dark"`; } & `Partial`\<[`ThemeTokens`](#themetokens)> |

#### Returns [#returns-154]

[`ThemeTokens`](#themetokens)
