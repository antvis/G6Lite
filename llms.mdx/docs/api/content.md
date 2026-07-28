# API 参考 (/docs/api)



# @antv/g6-gl [#antvg6-gl]

## Classes [#classes]

### EventEmitter [#eventemitter]

Defined in: [events.ts:9](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/events.ts#L9)

@antv/g6-gl
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

Defined in: [events.ts:12](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/events.ts#L12)

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

Defined in: [events.ts:21](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/events.ts#L21)

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

Defined in: [events.ts:29](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/events.ts#L29)

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

Defined in: [events.ts:37](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/events.ts#L37)

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

Defined in: [events.ts:50](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/events.ts#L50)

###### Parameters [#parameters-4]

| Parameter | Type     |
| --------- | -------- |
| `event?`  | `string` |

###### Returns [#returns-5]

`void`

***

### ~~`abstract` BaseNode~~ [#abstract-basenode]

Defined in: [extensions/node.ts:39](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L39)

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

Defined in: [extensions/node.ts:40](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L40)

###### Implementation of [#implementation-of]

[`NodeExtension`](#nodeextension).[`base`](#base-1)

##### ~~style?~~ [#style]

```ts
optional style?: Partial<NodeStyleConfig>;
```

Defined in: [extensions/node.ts:41](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L41)

###### Implementation of [#implementation-of-1]

[`NodeExtension`](#nodeextension).[`style`](#style-1)

##### ~~stateStyles?~~ [#statestyles]

```ts
optional stateStyles?: Partial<Record<string, NodeStateStyleOverride>>;
```

Defined in: [extensions/node.ts:42](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L42)

###### Implementation of [#implementation-of-2]

[`NodeExtension`](#nodeextension).[`stateStyles`](#statestyles-1)

#### Methods [#methods-1]

##### ~~getStyle()?~~ [#getstyle]

```ts
optional getStyle(_node: GraphNode): Partial<NodeStyleConfig>;
```

Defined in: [extensions/node.ts:44](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L44)

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

Defined in: [extensions/node.ts:45](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L45)

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

Defined in: [extensions/node.ts:46](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L46)

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

Defined in: [extensions/node.ts:127](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L127)

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

Defined in: [extensions/node.ts:41](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L41)

###### Inherited from [#inherited-from-1]

[`BaseNode`](#abstract-basenode).[`style`](#style-2)

##### ~~base~~ [#base-1]

```ts
base: "circle" = breathingNodeExtension.base;
```

Defined in: [extensions/node.ts:128](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L128)

###### Overrides [#overrides]

[`BaseNode`](#abstract-basenode).[`base`](#base-2)

##### ~~stateStyles~~ [#statestyles-1]

```ts
stateStyles: Partial<Record<string, NodeStateStyleOverride>> = breathingNodeStateStyles;
```

Defined in: [extensions/node.ts:129](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L129)

###### Overrides [#overrides-1]

[`BaseNode`](#abstract-basenode).[`stateStyles`](#statestyles-2)

##### ~~drawOverlay~~ [#drawoverlay-1]

```ts
drawOverlay: (ctx: CanvasRenderingContext2D, params: NodeOverlayDrawParams) => boolean = drawBreathingNodeOverlay;
```

Defined in: [extensions/node.ts:130](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L130)

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

Defined in: [extensions/node.ts:44](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L44)

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

Defined in: [extensions/node.ts:45](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L45)

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

Defined in: [graph.ts:74](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L74)

#### Constructors [#constructors-3]

##### Constructor [#constructor-3]

```ts
new Graph(options: GraphOptions): Graph;
```

Defined in: [graph.ts:108](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L108)

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

Defined in: [graph.ts:100](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L100)

###### Returns [#returns-15]

`boolean`

#### Methods [#methods-3]

##### isDestroyed() [#isdestroyed]

```ts
isDestroyed(): boolean;
```

Defined in: [graph.ts:104](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L104)

###### Returns [#returns-16]

`boolean`

##### render() [#render]

```ts
render(): Promise<void>;
```

Defined in: [graph.ts:259](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L259)

###### Returns [#returns-17]

`Promise`\<`void`>

##### destroy() [#destroy]

```ts
destroy(): void;
```

Defined in: [graph.ts:461](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L461)

###### Returns [#returns-18]

`void`

##### getCamera() [#getcamera]

```ts
getCamera(): Camera;
```

Defined in: [graph.ts:481](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L481)

Get a snapshot of the current camera. Use setCamera() to update it.

###### Returns [#returns-19]

[`Camera`](#camera-1)

##### setCamera() [#setcamera]

```ts
setCamera(partial: Partial<Camera>): void;
```

Defined in: [graph.ts:485](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L485)

###### Parameters [#parameters-12]

| Parameter | Type                              |
| --------- | --------------------------------- |
| `partial` | `Partial`\<[`Camera`](#camera-1)> |

###### Returns [#returns-20]

`void`

##### resetCamera() [#resetcamera]

```ts
resetCamera(): void;
```

Defined in: [graph.ts:492](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L492)

###### Returns [#returns-21]

`void`

##### fitView() [#fitview]

```ts
fitView(options?: number | FitViewOptions): void;
```

Defined in: [graph.ts:498](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L498)

###### Parameters [#parameters-13]

| Parameter | Type                                            | Default value |
| --------- | ----------------------------------------------- | ------------- |
| `options` | `number` \| [`FitViewOptions`](#fitviewoptions) | `0.9`         |

###### Returns [#returns-22]

`void`

##### setSize() [#setsize]

```ts
setSize(width: number, height: number): void;
```

Defined in: [graph.ts:543](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L543)

###### Parameters [#parameters-14]

| Parameter | Type     |
| --------- | -------- |
| `width`   | `number` |
| `height`  | `number` |

###### Returns [#returns-23]

`void`

##### getZoom() [#getzoom]

```ts
getZoom(): number;
```

Defined in: [graph.ts:549](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L549)

###### Returns [#returns-24]

`number`

##### zoomTo() [#zoomto]

```ts
zoomTo(zoom: number, options?: ZoomOptions): void;
```

Defined in: [graph.ts:553](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L553)

###### Parameters [#parameters-15]

| Parameter | Type                          |
| --------- | ----------------------------- |
| `zoom`    | `number`                      |
| `options` | [`ZoomOptions`](#zoomoptions) |

###### Returns [#returns-25]

`void`

##### zoomBy() [#zoomby]

```ts
zoomBy(ratio: number, options?: ZoomOptions): void;
```

Defined in: [graph.ts:575](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L575)

###### Parameters [#parameters-16]

| Parameter  | Type                          |
| ---------- | ----------------------------- |
| `ratio`    | `number`                      |
| `options?` | [`ZoomOptions`](#zoomoptions) |

###### Returns [#returns-26]

`void`

##### fitCenter() [#fitcenter]

```ts
fitCenter(): void;
```

Defined in: [graph.ts:580](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L580)

###### Returns [#returns-27]

`void`

##### getData() [#getdata]

```ts
getData(): GraphData;
```

Defined in: [graph.ts:613](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L613)

###### Returns [#returns-28]

[`GraphData`](#graphdata)

##### ~~toData()~~ [#todata]

```ts
toData(): GraphData;
```

Defined in: [graph.ts:618](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L618)

###### Returns [#returns-29]

[`GraphData`](#graphdata)

###### Deprecated [#deprecated-2]

Use getData().

##### getNodes() [#getnodes]

```ts
getNodes(): readonly NodeModel[];
```

Defined in: [graph.ts:628](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L628)

Get all read-only normalized node views.

###### Returns [#returns-30]

readonly [`NodeModel`](#nodemodel)\[]

##### getEdges() [#getedges]

```ts
getEdges(): readonly EdgeModel[];
```

Defined in: [graph.ts:633](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L633)

Get all read-only normalized edge views.

###### Returns [#returns-31]

readonly [`EdgeModel`](#edgemodel)\[]

##### screenToGraph() [#screentograph]

```ts
screenToGraph(screenX: number, screenY: number): {
  x: number;
  y: number;
};
```

Defined in: [graph.ts:693](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L693)

Convert client viewport CSS coordinates to graph coordinates.

###### Parameters [#parameters-17]

| Parameter | Type     |
| --------- | -------- |
| `screenX` | `number` |
| `screenY` | `number` |

###### Returns [#returns-32]

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

Defined in: [graph.ts:700](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L700)

Convert graph coordinates to client viewport CSS coordinates.

###### Parameters [#parameters-18]

| Parameter | Type     |
| --------- | -------- |
| `graphX`  | `number` |
| `graphY`  | `number` |

###### Returns [#returns-33]

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

##### addNode() [#addnode]

```ts
addNode(node: {
  id: string;
  x: number;
  y: number;
  data?: Record<string, unknown>;
}): void;
```

Defined in: [graph.ts:733](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L733)

Add a single node. Triggers partial process on next frame.
The node must have a unique id and x,y coordinates.

###### Parameters [#parameters-19]

| Parameter    | Type                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| `node`       | \{ `id`: `string`; `x`: `number`; `y`: `number`; `data?`: `Record`\<`string`, `unknown`>; } |
| `node.id`    | `string`                                                                                    |
| `node.x`     | `number`                                                                                    |
| `node.y`     | `number`                                                                                    |
| `node.data?` | `Record`\<`string`, `unknown`>                                                              |

###### Returns [#returns-34]

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

Defined in: [graph.ts:744](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L744)

Add multiple nodes in one batch. More efficient than calling addNode repeatedly
because it triggers a single render.

###### Parameters [#parameters-20]

| Parameter | Type                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------- |
| `nodes`   | \{ `id`: `string`; `x`: `number`; `y`: `number`; `data?`: `Record`\<`string`, `unknown`>; }\[] |

###### Returns [#returns-35]

`void`

##### removeNode() [#removenode]

```ts
removeNode(id: string): void;
```

Defined in: [graph.ts:758](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L758)

Remove a node and all its connected edges. Triggers partial process on next frame.

###### Parameters [#parameters-21]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-36]

`void`

##### removeNodes() [#removenodes]

```ts
removeNodes(ids: string[]): void;
```

Defined in: [graph.ts:769](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L769)

Remove multiple nodes and their connected edges in one batch.

###### Parameters [#parameters-22]

| Parameter | Type        |
| --------- | ----------- |
| `ids`     | `string`\[] |

###### Returns [#returns-37]

`void`

##### updateNodePosition() [#updatenodeposition]

```ts
updateNodePosition(
   id: string, 
   x: number, 
   y: number): void;
```

Defined in: [graph.ts:784](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L784)

Update a node's position. Triggers position patch on next frame —
much cheaper than full process since it only patches the position floats
in the GPU buffer.

###### Parameters [#parameters-23]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |
| `x`       | `number` |
| `y`       | `number` |

###### Returns [#returns-38]

`void`

##### updateNodePositions() [#updatenodepositions]

```ts
updateNodePositions(updates: NodePositionUpdate[]): void;
```

Defined in: [graph.ts:791](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L791)

###### Parameters [#parameters-24]

| Parameter | Type                                           |
| --------- | ---------------------------------------------- |
| `updates` | [`NodePositionUpdate`](#nodepositionupdate)\[] |

###### Returns [#returns-39]

`void`

##### updateNodeData() [#updatenodedata]

###### Call Signature [#call-signature]

```ts
updateNodeData(id: string, data: Record<string, unknown>): void;
```

Defined in: [graph.ts:804](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L804)

Update a node's custom data. May affect style if the style function depends on data.
Triggers partial process on next frame.

###### Parameters [#parameters-25]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `id`      | `string`                       |
| `data`    | `Record`\<`string`, `unknown`> |

###### Returns [#returns-40]

`void`

###### Call Signature [#call-signature-1]

```ts
updateNodeData(updates: NodeDataUpdate[]): void;
```

Defined in: [graph.ts:805](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L805)

Update a node's custom data. May affect style if the style function depends on data.
Triggers partial process on next frame.

###### Parameters [#parameters-26]

| Parameter | Type                                   |
| --------- | -------------------------------------- |
| `updates` | [`NodeDataUpdate`](#nodedataupdate)\[] |

###### Returns [#returns-41]

`void`

##### updateEdgeData() [#updateedgedata]

###### Call Signature [#call-signature-2]

```ts
updateEdgeData(id: string, data: Record<string, unknown>): void;
```

Defined in: [graph.ts:817](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L817)

###### Parameters [#parameters-27]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `id`      | `string`                       |
| `data`    | `Record`\<`string`, `unknown`> |

###### Returns [#returns-42]

`void`

###### Call Signature [#call-signature-3]

```ts
updateEdgeData(updates: EdgeDataUpdate[]): void;
```

Defined in: [graph.ts:818](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L818)

###### Parameters [#parameters-28]

| Parameter | Type                                   |
| --------- | -------------------------------------- |
| `updates` | [`EdgeDataUpdate`](#edgedataupdate)\[] |

###### Returns [#returns-43]

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

Defined in: [graph.ts:834](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L834)

Add an edge between two existing nodes. Returns the auto-generated edge ID.

###### Parameters [#parameters-29]

| Parameter      | Type                                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `edge`         | \{ `id?`: `string`; `source`: `string`; `target`: `string`; `data?`: `Record`\<`string`, `unknown`>; `states?`: [`ElementState`](#elementstate)\[]; } |
| `edge.id?`     | `string`                                                                                                                                              |
| `edge.source`  | `string`                                                                                                                                              |
| `edge.target`  | `string`                                                                                                                                              |
| `edge.data?`   | `Record`\<`string`, `unknown`>                                                                                                                        |
| `edge.states?` | [`ElementState`](#elementstate)\[]                                                                                                                    |

###### Returns [#returns-44]

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

Defined in: [graph.ts:857](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L857)

Add multiple edges in one batch. Returns the auto-generated edge IDs.

###### Parameters [#parameters-30]

| Parameter | Type                                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `edges`   | \{ `id?`: `string`; `source`: `string`; `target`: `string`; `data?`: `Record`\<`string`, `unknown`>; `states?`: [`ElementState`](#elementstate)\[]; }\[] |

###### Returns [#returns-45]

`string`\[]

##### removeEdge() [#removeedge]

```ts
removeEdge(id: string): void;
```

Defined in: [graph.ts:884](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L884)

Remove an edge by its auto-generated ID.

###### Parameters [#parameters-31]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-46]

`void`

##### removeEdges() [#removeedges]

```ts
removeEdges(ids: string[]): void;
```

Defined in: [graph.ts:895](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L895)

Remove multiple edges by their IDs.

###### Parameters [#parameters-32]

| Parameter | Type        |
| --------- | ----------- |
| `ids`     | `string`\[] |

###### Returns [#returns-47]

`void`

##### setItemState() [#setitemstate]

```ts
setItemState(
   id: string, 
   state: ElementState, 
   value: boolean): void;
```

Defined in: [graph.ts:912](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L912)

Set a state (e.g. 'active', 'selected', 'highlight') on a node or edge.
The state affects the visual style if stateStyles are configured in node/edge config.
Triggers partial process on next frame to re-resolve styles.

###### Parameters [#parameters-33]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `id`      | `string`                        |
| `state`   | [`ElementState`](#elementstate) |
| `value`   | `boolean`                       |

###### Returns [#returns-48]

`void`

##### clearItemStates() [#clearitemstates]

```ts
clearItemStates(id: string): void;
```

Defined in: [graph.ts:934](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L934)

Clear all states on a node or edge.

###### Parameters [#parameters-34]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-49]

`void`

##### getNeighborNodes() [#getneighbornodes]

```ts
getNeighborNodes(nodeId: string): string[];
```

Defined in: [graph.ts:955](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L955)

Get all neighbor node IDs of a given node.

###### Parameters [#parameters-35]

| Parameter | Type     |
| --------- | -------- |
| `nodeId`  | `string` |

###### Returns [#returns-50]

`string`\[]

##### getAdjacentEdges() [#getadjacentedges]

```ts
getAdjacentEdges(nodeId: string): {
  id: string;
  source: string;
  target: string;
}[];
```

Defined in: [graph.ts:963](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L963)

Get all edges connected to a given node.

###### Parameters [#parameters-36]

| Parameter | Type     |
| --------- | -------- |
| `nodeId`  | `string` |

###### Returns [#returns-51]

\{
`id`: `string`;
`source`: `string`;
`target`: `string`;
}\[]

##### hasNode() [#hasnode]

```ts
hasNode(id: string): boolean;
```

Defined in: [graph.ts:973](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L973)

Check if a node exists in the graph.

###### Parameters [#parameters-37]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-52]

`boolean`

##### hasEdge() [#hasedge]

```ts
hasEdge(id: string): boolean;
```

Defined in: [graph.ts:977](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L977)

###### Parameters [#parameters-38]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-53]

`boolean`

##### hasElement() [#haselement]

```ts
hasElement(id: string): boolean;
```

Defined in: [graph.ts:981](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L981)

###### Parameters [#parameters-39]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-54]

`boolean`

##### getElementData() [#getelementdata]

```ts
getElementData(id: string): ElementModel | undefined;
```

Defined in: [graph.ts:988](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L988)

Get a read-only normalized element model by ID.

###### Parameters [#parameters-40]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-55]

[`ElementModel`](#elementmodel) | `undefined`

##### getElementPosition() [#getelementposition]

```ts
getElementPosition(id: string): 
  | {
  x: number;
  y: number;
}
  | null;
```

Defined in: [graph.ts:994](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L994)

###### Parameters [#parameters-41]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-56]

\| \{
`x`: `number`;
`y`: `number`;
}
\| `null`

##### getNodeCount() [#getnodecount]

```ts
getNodeCount(): number;
```

Defined in: [graph.ts:1004](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1004)

Get the total number of nodes.

###### Returns [#returns-57]

`number`

##### getEdgeCount() [#getedgecount]

```ts
getEdgeCount(): number;
```

Defined in: [graph.ts:1011](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1011)

Get the total number of edges.

###### Returns [#returns-58]

`number`

##### findNodesByState() [#findnodesbystate]

```ts
findNodesByState(state: ElementState): string[];
```

Defined in: [graph.ts:1021](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1021)

Find all node IDs that have the given state.
Example: graph.findNodesByState('selected') → \['node1', 'node3']

###### Parameters [#parameters-42]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `state`   | [`ElementState`](#elementstate) |

###### Returns [#returns-59]

`string`\[]

##### findEdgesByState() [#findedgesbystate]

```ts
findEdgesByState(state: ElementState): string[];
```

Defined in: [graph.ts:1030](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1030)

Find all edge IDs that have the given state.
Example: graph.findEdgesByState('active') → \['e0', 'e5']

###### Parameters [#parameters-43]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `state`   | [`ElementState`](#elementstate) |

###### Returns [#returns-60]

`string`\[]

##### findCombosByState() [#findcombosbystate]

```ts
findCombosByState(state: ElementState): string[];
```

Defined in: [graph.ts:1038](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1038)

Find all combo IDs that have the given state.

###### Parameters [#parameters-44]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `state`   | [`ElementState`](#elementstate) |

###### Returns [#returns-61]

`string`\[]

##### getNodePosition() [#getnodeposition]

```ts
getNodePosition(id: string): 
  | {
  x: number;
  y: number;
}
  | null;
```

Defined in: [graph.ts:1046](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1046)

Get a node's current position. Returns null if node not found.

###### Parameters [#parameters-45]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-62]

\| \{
`x`: `number`;
`y`: `number`;
}
\| `null`

##### refresh() [#refresh]

```ts
refresh(): void;
```

Defined in: [graph.ts:1055](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1055)

Force a full re-render. Use sparingly — the scheduler handles this automatically.

###### Returns [#returns-63]

`void`

##### on() [#on-1]

```ts
on<Args>(event: string, handler: Handler<Args>): void;
```

Defined in: [graph.ts:1064](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1064)

Subscribe to an event.

###### Type Parameters [#type-parameters-4]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

###### Parameters [#parameters-46]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `event`   | `string`                       |
| `handler` | [`Handler`](#handler)\<`Args`> |

###### Returns [#returns-64]

`void`

##### off() [#off-1]

```ts
off<Args>(event: string, handler: Handler<Args>): void;
```

Defined in: [graph.ts:1070](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1070)

Unsubscribe from an event.

###### Type Parameters [#type-parameters-5]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

###### Parameters [#parameters-47]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `event`   | `string`                       |
| `handler` | [`Handler`](#handler)\<`Args`> |

###### Returns [#returns-65]

`void`

##### once() [#once-1]

```ts
once<Args>(event: string, handler: Handler<Args>): void;
```

Defined in: [graph.ts:1075](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1075)

Subscribe to an event once.

###### Type Parameters [#type-parameters-6]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

###### Parameters [#parameters-48]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `event`   | `string`                       |
| `handler` | [`Handler`](#handler)\<`Args`> |

###### Returns [#returns-66]

`void`

##### setData() [#setdata]

```ts
setData(data: GraphData, options?: SetDataOptions): Promise<void>;
```

Defined in: [graph.ts:1085](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1085)

Replace all graph data at runtime. Runs layout if configured, then triggers full re-render.

###### Parameters [#parameters-49]

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `data`    | [`GraphData`](#graphdata)           |
| `options` | [`SetDataOptions`](#setdataoptions) |

###### Returns [#returns-67]

`Promise`\<`void`>

##### updateOptions() [#updateoptions]

```ts
updateOptions(opts: Partial<Pick<GraphOptions, "node" | "edge" | "theme">>): void;
```

Defined in: [graph.ts:1131](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1131)

Update visual configuration (node/edge styles, theme) at runtime.
Triggers a full re-process to apply new styles.

###### Parameters [#parameters-50]

| Parameter | Type                                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| `opts`    | `Partial`\<`Pick`\<[`GraphOptions`](#graphoptions), `"node"` \| `"edge"` \| `"theme"`>> |

###### Returns [#returns-68]

`void`

##### setLayout() [#setlayout]

```ts
setLayout(config: LayoutConfig): void;
```

Defined in: [graph.ts:1169](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1169)

Set the layout configuration. Does not execute layout — call layout() after.

###### Parameters [#parameters-51]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `config`  | [`LayoutConfig`](#layoutconfig) |

###### Returns [#returns-69]

`void`

##### layout() [#layout]

```ts
layout(): Promise<void>;
```

Defined in: [graph.ts:1177](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1177)

Execute the current layout algorithm and update node positions.

###### Returns [#returns-70]

`Promise`\<`void`>

##### cancelLayout() [#cancellayout]

```ts
cancelLayout(): void;
```

Defined in: [graph.ts:1207](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1207)

###### Returns [#returns-71]

`void`

##### getNodeData() [#getnodedata]

```ts
getNodeData(id: string): NodeModel | undefined;
```

Defined in: [graph.ts:1215](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1215)

Get a read-only normalized node model by ID. O(1) lookup.

###### Parameters [#parameters-52]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-72]

[`NodeModel`](#nodemodel) | `undefined`

##### getEdgeData() [#getedgedata]

```ts
getEdgeData(id: string): EdgeModel | undefined;
```

Defined in: [graph.ts:1220](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1220)

Get a read-only normalized edge model by ID. O(1) lookup.

###### Parameters [#parameters-53]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-73]

[`EdgeModel`](#edgemodel) | `undefined`

##### batchSetState() [#batchsetstate]

```ts
batchSetState(items: {
  id: string;
  state: ElementState;
  value: boolean;
}[]): void;
```

Defined in: [graph.ts:1229](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1229)

Set states on multiple items in a single batch, triggering only one render.

###### Parameters [#parameters-54]

| Parameter | Type                                                                                  |
| --------- | ------------------------------------------------------------------------------------- |
| `items`   | \{ `id`: `string`; `state`: [`ElementState`](#elementstate); `value`: `boolean`; }\[] |

###### Returns [#returns-74]

`void`

##### setElementStates() [#setelementstates]

###### Call Signature [#call-signature-4]

```ts
setElementStates(id: string, states: ElementState[]): void;
```

Defined in: [graph.ts:1251](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1251)

###### Parameters [#parameters-55]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `id`      | `string`                           |
| `states`  | [`ElementState`](#elementstate)\[] |

###### Returns [#returns-75]

`void`

###### Call Signature [#call-signature-5]

```ts
setElementStates(stateMap: Record<string, ElementState[]>): void;
```

Defined in: [graph.ts:1252](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1252)

###### Parameters [#parameters-56]

| Parameter  | Type                                                    |
| ---------- | ------------------------------------------------------- |
| `stateMap` | `Record`\<`string`, [`ElementState`](#elementstate)\[]> |

###### Returns [#returns-76]

`void`

##### getItemStates() [#getitemstates]

```ts
getItemStates(id: string): ElementState[];
```

Defined in: [graph.ts:1283](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1283)

Get all active states on a node or edge.

###### Parameters [#parameters-57]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-77]

[`ElementState`](#elementstate)\[]

##### hideItem() [#hideitem]

```ts
hideItem(id: string): void;
```

Defined in: [graph.ts:1297](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1297)

Hide a node or edge (sets opacity to 0 via 'hidden' state).

###### Parameters [#parameters-58]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-78]

`void`

##### showItem() [#showitem]

```ts
showItem(id: string): void;
```

Defined in: [graph.ts:1304](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1304)

Show a previously hidden node or edge.

###### Parameters [#parameters-59]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-79]

`void`

##### focusItem() [#focusitem]

```ts
focusItem(id: string | string[], padding?: number): void;
```

Defined in: [graph.ts:1313](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1313)

Move the viewport to center on the specified node(s) without changing zoom.
The padding parameter remains in the beta-compatible signature but does
not alter the current center-only behavior.

###### Parameters [#parameters-60]

| Parameter | Type                    | Default value |
| --------- | ----------------------- | ------------- |
| `id`      | `string` \| `string`\[] | `undefined`   |
| `padding` | `number`                | `20`          |

###### Returns [#returns-80]

`void`

##### collapseCombo() [#collapsecombo]

```ts
collapseCombo(comboId: string): void;
```

Defined in: [graph.ts:1343](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1343)

###### Parameters [#parameters-61]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-81]

`void`

##### expandCombo() [#expandcombo]

```ts
expandCombo(comboId: string): void;
```

Defined in: [graph.ts:1357](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1357)

###### Parameters [#parameters-62]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-82]

`void`

##### toggleCombo() [#togglecombo]

```ts
toggleCombo(comboId: string): void;
```

Defined in: [graph.ts:1371](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1371)

###### Parameters [#parameters-63]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-83]

`void`

##### getComboData() [#getcombodata]

```ts
getComboData(id: string): ComboModel | undefined;
```

Defined in: [graph.ts:1383](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1383)

Get a read-only normalized combo model by ID.

###### Parameters [#parameters-64]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-84]

[`ComboModel`](#combomodel) | `undefined`

##### setComboState() [#setcombostate]

```ts
setComboState(
   comboId: string, 
   state: ElementState, 
   value: boolean): void;
```

Defined in: [graph.ts:1387](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1387)

###### Parameters [#parameters-65]

| Parameter | Type                            |
| --------- | ------------------------------- |
| `comboId` | `string`                        |
| `state`   | [`ElementState`](#elementstate) |
| `value`   | `boolean`                       |

###### Returns [#returns-85]

`void`

##### clearComboStates() [#clearcombostates]

```ts
clearComboStates(comboId: string): void;
```

Defined in: [graph.ts:1393](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1393)

###### Parameters [#parameters-66]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-86]

`void`

##### getComboStates() [#getcombostates]

```ts
getComboStates(comboId: string): ElementState[];
```

Defined in: [graph.ts:1399](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1399)

###### Parameters [#parameters-67]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-87]

[`ElementState`](#elementstate)\[]

##### getComboChildren() [#getcombochildren]

```ts
getComboChildren(id: string): {
  nodes: string[];
  combos: string[];
};
```

Defined in: [graph.ts:1404](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1404)

###### Parameters [#parameters-68]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-88]

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

Defined in: [graph.ts:1413](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1413)

###### Parameters [#parameters-69]

| Parameter | Type     |
| --------- | -------- |
| `nodeId`  | `string` |

###### Returns [#returns-89]

`string` | `undefined`

##### addToCombo() [#addtocombo]

```ts
addToCombo(nodeId: string, comboId: string): void;
```

Defined in: [graph.ts:1417](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1417)

###### Parameters [#parameters-70]

| Parameter | Type     |
| --------- | -------- |
| `nodeId`  | `string` |
| `comboId` | `string` |

###### Returns [#returns-90]

`void`

##### removeFromCombo() [#removefromcombo]

```ts
removeFromCombo(nodeId: string): void;
```

Defined in: [graph.ts:1429](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1429)

###### Parameters [#parameters-71]

| Parameter | Type     |
| --------- | -------- |
| `nodeId`  | `string` |

###### Returns [#returns-91]

`void`

##### createCombo() [#createcombo]

```ts
createCombo(combo: ComboData, childNodeIds?: string[]): void;
```

Defined in: [graph.ts:1440](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1440)

###### Parameters [#parameters-72]

| Parameter       | Type                      |
| --------------- | ------------------------- |
| `combo`         | [`ComboData`](#combodata) |
| `childNodeIds?` | `string`\[]               |

###### Returns [#returns-92]

`void`

##### removeCombo() [#removecombo]

```ts
removeCombo(comboId: string): void;
```

Defined in: [graph.ts:1458](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/graph.ts#L1458)

###### Parameters [#parameters-73]

| Parameter | Type     |
| --------- | -------- |
| `comboId` | `string` |

###### Returns [#returns-93]

`void`

## Interfaces [#interfaces]

### DragCanvasOptions [#dragcanvasoptions]

Defined in: [behaviors/dragCanvas.ts:11](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/dragCanvas.ts#L11)

#### Properties [#properties-2]

##### ignoreModifierKeys? [#ignoremodifierkeys]

```ts
optional ignoreModifierKeys?: boolean;
```

Defined in: [behaviors/dragCanvas.ts:13](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/dragCanvas.ts#L13)

Keep modifier-key gestures available for brush/lasso selection. Default: true.

***

### HoverHighlightConfig [#hoverhighlightconfig]

Defined in: [behaviors/hoverHighlight.ts:16](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/hoverHighlight.ts#L16)

#### Properties [#properties-3]

##### type [#type]

```ts
type: string;
```

Defined in: [behaviors/hoverHighlight.ts:17](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/hoverHighlight.ts#L17)

##### degree? [#degree]

```ts
optional degree?: number;
```

Defined in: [behaviors/hoverHighlight.ts:18](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/hoverHighlight.ts#L18)

##### inactiveState? [#inactivestate]

```ts
optional inactiveState?: string;
```

Defined in: [behaviors/hoverHighlight.ts:19](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/hoverHighlight.ts#L19)

***

### BehaviorConfig [#behaviorconfig]

Defined in: [behaviors/index.ts:47](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/index.ts#L47)

#### Indexable [#indexable]

```ts
[key: string]: unknown
```

#### Properties [#properties-4]

##### type [#type-1]

```ts
type: string;
```

Defined in: [behaviors/index.ts:48](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/index.ts#L48)

***

### LassoSelectOptions [#lassoselectoptions]

Defined in: [behaviors/lassoSelect.ts:19](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/lassoSelect.ts#L19)

#### Properties [#properties-5]

##### key? [#key]

```ts
optional key?: "shift" | "ctrl" | null;
```

Defined in: [behaviors/lassoSelect.ts:21](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/lassoSelect.ts#L21)

Modifier key to activate. Default: null (always active)

##### throttleMs? [#throttlems]

```ts
optional throttleMs?: number;
```

Defined in: [behaviors/lassoSelect.ts:23](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/lassoSelect.ts#L23)

Throttle interval for real-time selection during drag (ms). Default: 100

***

### TooltipContext [#tooltipcontext]

Defined in: [behaviors/tooltip.ts:23](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L23)

#### Properties [#properties-6]

##### itemType [#itemtype]

```ts
itemType: "node" | "edge";
```

Defined in: [behaviors/tooltip.ts:24](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L24)

##### nodeId? [#nodeid]

```ts
optional nodeId?: string;
```

Defined in: [behaviors/tooltip.ts:25](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L25)

##### edgeId? [#edgeid]

```ts
optional edgeId?: string;
```

Defined in: [behaviors/tooltip.ts:26](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L26)

##### edgeIndex? [#edgeindex]

```ts
optional edgeIndex?: number;
```

Defined in: [behaviors/tooltip.ts:27](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L27)

##### source? [#source]

```ts
optional source?: string;
```

Defined in: [behaviors/tooltip.ts:28](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L28)

##### target? [#target]

```ts
optional target?: string;
```

Defined in: [behaviors/tooltip.ts:29](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L29)

##### data? [#data]

```ts
optional data?: Record<string, unknown>;
```

Defined in: [behaviors/tooltip.ts:30](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L30)

##### event [#event]

```ts
event: MouseEvent;
```

Defined in: [behaviors/tooltip.ts:31](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L31)

***

### TooltipOptions [#tooltipoptions]

Defined in: [behaviors/tooltip.ts:34](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L34)

#### Properties [#properties-7]

##### trigger? [#trigger]

```ts
optional trigger?: "click" | "hover";
```

Defined in: [behaviors/tooltip.ts:36](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L36)

Trigger mode. Default: 'hover'.

##### getContent? [#getcontent]

```ts
optional getContent?: (ctx: TooltipContext) => string | HTMLElement;
```

Defined in: [behaviors/tooltip.ts:42](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L42)

Build the tooltip body. A custom string is treated as trusted HTML for
backward compatibility; escape untrusted values or return an HTMLElement
whose textContent you control.

###### Parameters [#parameters-74]

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `ctx`     | [`TooltipContext`](#tooltipcontext) |

###### Returns [#returns-94]

`string` | `HTMLElement`

##### enable? [#enable]

```ts
optional enable?: (ctx: TooltipContext) => boolean;
```

Defined in: [behaviors/tooltip.ts:44](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L44)

Gate display per element. Return false to suppress. Default: always show.

###### Parameters [#parameters-75]

| Parameter | Type                                |
| --------- | ----------------------------------- |
| `ctx`     | [`TooltipContext`](#tooltipcontext) |

###### Returns [#returns-95]

`boolean`

##### offset? [#offset]

```ts
optional offset?: [number, number];
```

Defined in: [behaviors/tooltip.ts:46](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L46)

Pixel offset \[dx, dy] from the pointer. Default: \[10, 10].

##### delay? [#delay]

```ts
optional delay?: number;
```

Defined in: [behaviors/tooltip.ts:48](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L48)

Hover debounce in ms before show. Default: 80.

##### className? [#classname]

```ts
optional className?: string;
```

Defined in: [behaviors/tooltip.ts:50](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L50)

Overlay class name. Default: 'g6lite-tooltip'.

##### container? [#container]

```ts
optional container?: HTMLElement;
```

Defined in: [behaviors/tooltip.ts:52](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/tooltip.ts#L52)

DOM mount and collision boundary. Defaults to document.body.

***

### ExtensionNodeData [#extensionnodedata]

Defined in: [extensions/contracts.ts:17](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L17)

Read-only node snapshot exposed to extensions.

#### Properties [#properties-8]

##### id [#id]

```ts
readonly id: string;
```

Defined in: [extensions/contracts.ts:18](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L18)

##### name? [#name]

```ts
readonly optional name?: string;
```

Defined in: [extensions/contracts.ts:19](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L19)

##### x [#x-4]

```ts
readonly x: number;
```

Defined in: [extensions/contracts.ts:20](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L20)

##### y [#y-4]

```ts
readonly y: number;
```

Defined in: [extensions/contracts.ts:21](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L21)

##### data? [#data-1]

```ts
readonly optional data?: Readonly<Record<string, unknown>>;
```

Defined in: [extensions/contracts.ts:22](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L22)

##### states [#states]

```ts
readonly states: readonly ElementState[];
```

Defined in: [extensions/contracts.ts:23](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L23)

***

### ExtensionEdgeData [#extensionedgedata]

Defined in: [extensions/contracts.ts:27](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L27)

Read-only edge snapshot exposed to extensions.

#### Properties [#properties-9]

##### id [#id-1]

```ts
readonly id: string;
```

Defined in: [extensions/contracts.ts:28](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L28)

##### source [#source-1]

```ts
readonly source: string;
```

Defined in: [extensions/contracts.ts:29](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L29)

##### target [#target-1]

```ts
readonly target: string;
```

Defined in: [extensions/contracts.ts:30](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L30)

##### data? [#data-2]

```ts
readonly optional data?: Readonly<Record<string, unknown>>;
```

Defined in: [extensions/contracts.ts:31](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L31)

##### states [#states-1]

```ts
readonly states: readonly ElementState[];
```

Defined in: [extensions/contracts.ts:32](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L32)

***

### ExtensionDataContext [#extensiondatacontext]

Defined in: [extensions/contracts.ts:35](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L35)

#### Methods [#methods-4]

##### getNode() [#getnode]

```ts
getNode(id: string): ExtensionNodeData | undefined;
```

Defined in: [extensions/contracts.ts:36](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L36)

###### Parameters [#parameters-76]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-96]

[`ExtensionNodeData`](#extensionnodedata) | `undefined`

##### getEdge() [#getedge]

```ts
getEdge(id: string): ExtensionEdgeData | undefined;
```

Defined in: [extensions/contracts.ts:37](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L37)

###### Parameters [#parameters-77]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-97]

[`ExtensionEdgeData`](#extensionedgedata) | `undefined`

##### getNodeIds() [#getnodeids]

```ts
getNodeIds(): string[];
```

Defined in: [extensions/contracts.ts:38](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L38)

###### Returns [#returns-98]

`string`\[]

##### getEdgeIds() [#getedgeids]

```ts
getEdgeIds(): string[];
```

Defined in: [extensions/contracts.ts:39](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L39)

###### Returns [#returns-99]

`string`\[]

##### updateNode() [#updatenode]

```ts
updateNode(id: string, data: Record<string, unknown>): void;
```

Defined in: [extensions/contracts.ts:40](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L40)

###### Parameters [#parameters-78]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `id`      | `string`                       |
| `data`    | `Record`\<`string`, `unknown`> |

###### Returns [#returns-100]

`void`

##### updateEdge() [#updateedge]

```ts
updateEdge(id: string, data: Record<string, unknown>): void;
```

Defined in: [extensions/contracts.ts:41](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L41)

###### Parameters [#parameters-79]

| Parameter | Type                           |
| --------- | ------------------------------ |
| `id`      | `string`                       |
| `data`    | `Record`\<`string`, `unknown`> |

###### Returns [#returns-101]

`void`

***

### ExtensionStateContext [#extensionstatecontext]

Defined in: [extensions/contracts.ts:44](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L44)

#### Methods [#methods-5]

##### set() [#set]

```ts
set(id: string, states: ElementState[]): void;
```

Defined in: [extensions/contracts.ts:45](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L45)

###### Parameters [#parameters-80]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `id`      | `string`                           |
| `states`  | [`ElementState`](#elementstate)\[] |

###### Returns [#returns-102]

`void`

##### setAll() [#setall]

```ts
setAll(stateMap: Record<string, ElementState[]>): void;
```

Defined in: [extensions/contracts.ts:46](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L46)

###### Parameters [#parameters-81]

| Parameter  | Type                                                    |
| ---------- | ------------------------------------------------------- |
| `stateMap` | `Record`\<`string`, [`ElementState`](#elementstate)\[]> |

###### Returns [#returns-103]

`void`

##### get() [#get]

```ts
get(id: string): ElementState[];
```

Defined in: [extensions/contracts.ts:47](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L47)

###### Parameters [#parameters-82]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-104]

[`ElementState`](#elementstate)\[]

##### clear() [#clear]

```ts
clear(id: string): void;
```

Defined in: [extensions/contracts.ts:48](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L48)

###### Parameters [#parameters-83]

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

###### Returns [#returns-105]

`void`

***

### ExtensionViewportContext [#extensionviewportcontext]

Defined in: [extensions/contracts.ts:51](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L51)

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

Defined in: [extensions/contracts.ts:52](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L52)

###### Parameters [#parameters-84]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `point`   | \{ `x`: `number`; `y`: `number`; } |
| `point.x` | `number`                           |
| `point.y` | `number`                           |

###### Returns [#returns-106]

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

Defined in: [extensions/contracts.ts:53](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L53)

###### Parameters [#parameters-85]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `point`   | \{ `x`: `number`; `y`: `number`; } |
| `point.x` | `number`                           |
| `point.y` | `number`                           |

###### Returns [#returns-107]

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

Defined in: [extensions/contracts.ts:54](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L54)

###### Returns [#returns-108]

`number`

***

### ExtensionContext [#extensioncontext]

Defined in: [extensions/contracts.ts:57](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L57)

#### Properties [#properties-10]

##### ~~graph~~ [#graph-1]

```ts
graph: Graph;
```

Defined in: [extensions/contracts.ts:59](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L59)

###### Deprecated [#deprecated-3]

Use data, state, viewport, and requestRender instead.

##### data [#data-3]

```ts
data: ExtensionDataContext;
```

Defined in: [extensions/contracts.ts:60](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L60)

##### state [#state]

```ts
state: ExtensionStateContext;
```

Defined in: [extensions/contracts.ts:61](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L61)

##### viewport [#viewport]

```ts
viewport: ExtensionViewportContext;
```

Defined in: [extensions/contracts.ts:62](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L62)

#### Methods [#methods-7]

##### requestRender() [#requestrender]

```ts
requestRender(): void;
```

Defined in: [extensions/contracts.ts:63](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L63)

###### Returns [#returns-109]

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

Defined in: [extensions/contracts.ts:65](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L65)

###### Parameters [#parameters-86]

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

###### ~~x~~ [#x-7]

```ts
x: number;
```

###### ~~y~~ [#y-7]

```ts
y: number;
```

###### Deprecated [#deprecated-4]

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

Defined in: [extensions/contracts.ts:67](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L67)

###### Parameters [#parameters-87]

| Parameter | Type                               |
| --------- | ---------------------------------- |
| `point`   | \{ `x`: `number`; `y`: `number`; } |
| `point.x` | `number`                           |
| `point.y` | `number`                           |

###### Returns [#returns-111]

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

###### Deprecated [#deprecated-5]

Use viewport.graphToScreen.

##### ~~getZoom()~~ [#getzoom-2]

```ts
getZoom(): number;
```

Defined in: [extensions/contracts.ts:69](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L69)

###### Returns [#returns-112]

`number`

###### Deprecated [#deprecated-6]

Use viewport.getZoom.

##### isDestroyed() [#isdestroyed-1]

```ts
isDestroyed(): boolean;
```

Defined in: [extensions/contracts.ts:70](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L70)

###### Returns [#returns-113]

`boolean`

***

### Extension [#extension]

Defined in: [extensions/contracts.ts:73](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L73)

#### Extended by [#extended-by-1]

* [`BehaviorExtension`](#behaviorextension)
* [`LayoutExtension`](#layoutextension)
* [`PluginExtension`](#pluginextension)
* [`TransformExtension`](#transformextension)

#### Type Parameters [#type-parameters-7]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `TOptions`     | `Record`\<`string`, `unknown`> |

#### Methods [#methods-8]

##### init()? [#init]

```ts
optional init(context: ExtensionContext, options: TOptions): void;
```

Defined in: [extensions/contracts.ts:74](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L74)

###### Parameters [#parameters-88]

| Parameter | Type                                    |
| --------- | --------------------------------------- |
| `context` | [`ExtensionContext`](#extensioncontext) |
| `options` | `TOptions`                              |

###### Returns [#returns-114]

`void`

##### update()? [#update]

```ts
optional update(options: Partial<TOptions>): void;
```

Defined in: [extensions/contracts.ts:75](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L75)

###### Parameters [#parameters-89]

| Parameter | Type                   |
| --------- | ---------------------- |
| `options` | `Partial`\<`TOptions`> |

###### Returns [#returns-115]

`void`

##### destroy()? [#destroy-1]

```ts
optional destroy(): void;
```

Defined in: [extensions/contracts.ts:76](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L76)

###### Returns [#returns-116]

`void`

***

### LayoutExtension [#layoutextension]

Defined in: [extensions/contracts.ts:79](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L79)

#### Extends [#extends-1]

* [`Extension`](#extension)\<`TOptions`>

#### Type Parameters [#type-parameters-8]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `TOptions`     | `Record`\<`string`, `unknown`> |

#### Methods [#methods-9]

##### init()? [#init-1]

```ts
optional init(context: ExtensionContext, options: TOptions): void;
```

Defined in: [extensions/contracts.ts:74](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L74)

###### Parameters [#parameters-90]

| Parameter | Type                                    |
| --------- | --------------------------------------- |
| `context` | [`ExtensionContext`](#extensioncontext) |
| `options` | `TOptions`                              |

###### Returns [#returns-117]

`void`

###### Inherited from [#inherited-from-4]

[`Extension`](#extension).[`init`](#init)

##### update()? [#update-1]

```ts
optional update(options: Partial<TOptions>): void;
```

Defined in: [extensions/contracts.ts:75](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L75)

###### Parameters [#parameters-91]

| Parameter | Type                   |
| --------- | ---------------------- |
| `options` | `Partial`\<`TOptions`> |

###### Returns [#returns-118]

`void`

###### Inherited from [#inherited-from-5]

[`Extension`](#extension).[`update`](#update)

##### destroy()? [#destroy-2]

```ts
optional destroy(): void;
```

Defined in: [extensions/contracts.ts:76](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L76)

###### Returns [#returns-119]

`void`

###### Inherited from [#inherited-from-6]

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

Defined in: [extensions/contracts.ts:80](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L80)

###### Parameters [#parameters-92]

| Parameter         | Type                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `data`            | [`GraphData`](#graphdata)                                                                                 |
| `context`         | \{ `width`: `number`; `height`: `number`; `signal?`: `AbortSignal`; `options`: `Readonly`\<`TOptions`>; } |
| `context.width`   | `number`                                                                                                  |
| `context.height`  | `number`                                                                                                  |
| `context.signal?` | `AbortSignal`                                                                                             |
| `context.options` | `Readonly`\<`TOptions`>                                                                                   |

###### Returns [#returns-120]

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

Defined in: [extensions/contracts.ts:95](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L95)

#### Extends [#extends-2]

* [`Extension`](#extension)\<`TOptions`>

#### Type Parameters [#type-parameters-9]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `TOptions`     | `Record`\<`string`, `unknown`> |

#### Methods [#methods-10]

##### init()? [#init-2]

```ts
optional init(context: ExtensionContext, options: TOptions): void;
```

Defined in: [extensions/contracts.ts:74](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L74)

###### Parameters [#parameters-93]

| Parameter | Type                                    |
| --------- | --------------------------------------- |
| `context` | [`ExtensionContext`](#extensioncontext) |
| `options` | `TOptions`                              |

###### Returns [#returns-121]

`void`

###### Inherited from [#inherited-from-7]

[`Extension`](#extension).[`init`](#init)

##### update()? [#update-2]

```ts
optional update(options: Partial<TOptions>): void;
```

Defined in: [extensions/contracts.ts:75](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L75)

###### Parameters [#parameters-94]

| Parameter | Type                   |
| --------- | ---------------------- |
| `options` | `Partial`\<`TOptions`> |

###### Returns [#returns-122]

`void`

###### Inherited from [#inherited-from-8]

[`Extension`](#extension).[`update`](#update)

##### destroy()? [#destroy-3]

```ts
optional destroy(): void;
```

Defined in: [extensions/contracts.ts:76](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L76)

###### Returns [#returns-123]

`void`

###### Inherited from [#inherited-from-9]

[`Extension`](#extension).[`destroy`](#destroy)

##### getEvents() [#getevents]

```ts
getEvents(): Record<string, (event: GraphElementEvent) => void>;
```

Defined in: [extensions/contracts.ts:96](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L96)

###### Returns [#returns-124]

`Record`\<`string`, (`event`: [`GraphElementEvent`](#graphelementevent)) => `void`>

***

### TransformExtension [#transformextension]

Defined in: [extensions/contracts.ts:99](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L99)

#### Extends [#extends-3]

* [`Extension`](#extension)\<`TOptions`>

#### Type Parameters [#type-parameters-10]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `TOptions`     | `Record`\<`string`, `unknown`> |

#### Methods [#methods-11]

##### init()? [#init-3]

```ts
optional init(context: ExtensionContext, options: TOptions): void;
```

Defined in: [extensions/contracts.ts:74](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L74)

###### Parameters [#parameters-95]

| Parameter | Type                                    |
| --------- | --------------------------------------- |
| `context` | [`ExtensionContext`](#extensioncontext) |
| `options` | `TOptions`                              |

###### Returns [#returns-125]

`void`

###### Inherited from [#inherited-from-10]

[`Extension`](#extension).[`init`](#init)

##### update()? [#update-3]

```ts
optional update(options: Partial<TOptions>): void;
```

Defined in: [extensions/contracts.ts:75](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L75)

###### Parameters [#parameters-96]

| Parameter | Type                   |
| --------- | ---------------------- |
| `options` | `Partial`\<`TOptions`> |

###### Returns [#returns-126]

`void`

###### Inherited from [#inherited-from-11]

[`Extension`](#extension).[`update`](#update)

##### destroy()? [#destroy-4]

```ts
optional destroy(): void;
```

Defined in: [extensions/contracts.ts:76](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L76)

###### Returns [#returns-127]

`void`

###### Inherited from [#inherited-from-12]

[`Extension`](#extension).[`destroy`](#destroy)

##### beforeRender()? [#beforerender]

```ts
optional beforeRender(data: GraphData): GraphData;
```

Defined in: [extensions/contracts.ts:102](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L102)

###### Parameters [#parameters-97]

| Parameter | Type                      |
| --------- | ------------------------- |
| `data`    | [`GraphData`](#graphdata) |

###### Returns [#returns-128]

[`GraphData`](#graphdata)

***

### PluginExtension [#pluginextension]

Defined in: [extensions/contracts.ts:105](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L105)

#### Extends [#extends-4]

* [`Extension`](#extension)\<`TOptions`>

#### Type Parameters [#type-parameters-11]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `TOptions`     | `Record`\<`string`, `unknown`> |

#### Methods [#methods-12]

##### init()? [#init-4]

```ts
optional init(context: ExtensionContext, options: TOptions): void;
```

Defined in: [extensions/contracts.ts:74](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L74)

###### Parameters [#parameters-98]

| Parameter | Type                                    |
| --------- | --------------------------------------- |
| `context` | [`ExtensionContext`](#extensioncontext) |
| `options` | `TOptions`                              |

###### Returns [#returns-129]

`void`

###### Inherited from [#inherited-from-13]

[`Extension`](#extension).[`init`](#init)

##### update()? [#update-4]

```ts
optional update(options: Partial<TOptions>): void;
```

Defined in: [extensions/contracts.ts:75](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L75)

###### Parameters [#parameters-99]

| Parameter | Type                   |
| --------- | ---------------------- |
| `options` | `Partial`\<`TOptions`> |

###### Returns [#returns-130]

`void`

###### Inherited from [#inherited-from-14]

[`Extension`](#extension).[`update`](#update)

##### destroy()? [#destroy-5]

```ts
optional destroy(): void;
```

Defined in: [extensions/contracts.ts:76](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L76)

###### Returns [#returns-131]

`void`

###### Inherited from [#inherited-from-15]

[`Extension`](#extension).[`destroy`](#destroy)

##### mount()? [#mount]

```ts
optional mount(container: HTMLElement): void;
```

Defined in: [extensions/contracts.ts:106](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L106)

###### Parameters [#parameters-100]

| Parameter   | Type          |
| ----------- | ------------- |
| `container` | `HTMLElement` |

###### Returns [#returns-132]

`void`

***

### EdgeExtension [#edgeextension]

Defined in: [extensions/contracts.ts:110](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L110)

Immutable edge rendering descriptor; Graph owns all runtime state.

#### Properties [#properties-11]

##### base? [#base-2]

```ts
optional base?: "line" | "arc" | "polyline" | "cubic";
```

Defined in: [extensions/contracts.ts:111](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L111)

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

Defined in: [extensions/contracts.ts:112](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L112)

##### stateStyles? [#statestyles-2]

```ts
optional stateStyles?: Partial<Record<string, EdgeStateStyleOverride>>;
```

Defined in: [extensions/contracts.ts:113](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L113)

#### Methods [#methods-13]

##### getStyle()? [#getstyle-2]

```ts
optional getStyle(
   source: GraphNode, 
   target: GraphNode, 
edge: GraphEdge): Partial<NonNullable<EdgeConfig["style"]>>;
```

Defined in: [extensions/contracts.ts:114](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L114)

###### Parameters [#parameters-101]

| Parameter | Type                      |
| --------- | ------------------------- |
| `source`  | [`GraphNode`](#graphnode) |
| `target`  | [`GraphNode`](#graphnode) |
| `edge`    | [`GraphEdge`](#graphedge) |

###### Returns [#returns-133]

`Partial`\<`NonNullable`\<[`EdgeConfig`](#edgeconfig)\[`"style"`]>>

***

### DecorationMeasureParams [#decorationmeasureparams]

Defined in: [extensions/contracts.ts:121](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L121)

#### Extended by [#extended-by-2]

* [`DecorationDrawParams`](#decorationdrawparams)

#### Type Parameters [#type-parameters-12]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Properties [#properties-12]

##### ctx [#ctx]

```ts
ctx: CanvasRenderingContext2D;
```

Defined in: [extensions/contracts.ts:122](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L122)

##### node [#node]

```ts
node: GraphNode;
```

Defined in: [extensions/contracts.ts:123](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L123)

##### data [#data-4]

```ts
data: T;
```

Defined in: [extensions/contracts.ts:124](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L124)

##### dpr [#dpr]

```ts
dpr: number;
```

Defined in: [extensions/contracts.ts:125](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L125)

##### zoom [#zoom]

```ts
zoom: number;
```

Defined in: [extensions/contracts.ts:126](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L126)

##### nodeWidth [#nodewidth]

```ts
nodeWidth: number;
```

Defined in: [extensions/contracts.ts:128](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L128)

Final node dimensions in Canvas backing-store pixels.

##### nodeHeight [#nodeheight]

```ts
nodeHeight: number;
```

Defined in: [extensions/contracts.ts:130](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L130)

Final node dimensions in Canvas backing-store pixels.

***

### DecorationDrawParams [#decorationdrawparams]

Defined in: [extensions/contracts.ts:133](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L133)

#### Extends [#extends-5]

* [`DecorationMeasureParams`](#decorationmeasureparams)\<`T`>

#### Type Parameters [#type-parameters-13]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Properties [#properties-13]

##### ctx [#ctx-1]

```ts
ctx: CanvasRenderingContext2D;
```

Defined in: [extensions/contracts.ts:122](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L122)

###### Inherited from [#inherited-from-16]

[`DecorationMeasureParams`](#decorationmeasureparams).[`ctx`](#ctx)

##### node [#node-1]

```ts
node: GraphNode;
```

Defined in: [extensions/contracts.ts:123](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L123)

###### Inherited from [#inherited-from-17]

[`DecorationMeasureParams`](#decorationmeasureparams).[`node`](#node)

##### data [#data-5]

```ts
data: T;
```

Defined in: [extensions/contracts.ts:124](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L124)

###### Inherited from [#inherited-from-18]

[`DecorationMeasureParams`](#decorationmeasureparams).[`data`](#data-4)

##### dpr [#dpr-1]

```ts
dpr: number;
```

Defined in: [extensions/contracts.ts:125](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L125)

###### Inherited from [#inherited-from-19]

[`DecorationMeasureParams`](#decorationmeasureparams).[`dpr`](#dpr)

##### zoom [#zoom-1]

```ts
zoom: number;
```

Defined in: [extensions/contracts.ts:126](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L126)

###### Inherited from [#inherited-from-20]

[`DecorationMeasureParams`](#decorationmeasureparams).[`zoom`](#zoom)

##### nodeWidth [#nodewidth-1]

```ts
nodeWidth: number;
```

Defined in: [extensions/contracts.ts:128](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L128)

Final node dimensions in Canvas backing-store pixels.

###### Inherited from [#inherited-from-21]

[`DecorationMeasureParams`](#decorationmeasureparams).[`nodeWidth`](#nodewidth)

##### nodeHeight [#nodeheight-1]

```ts
nodeHeight: number;
```

Defined in: [extensions/contracts.ts:130](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L130)

Final node dimensions in Canvas backing-store pixels.

###### Inherited from [#inherited-from-22]

[`DecorationMeasureParams`](#decorationmeasureparams).[`nodeHeight`](#nodeheight)

##### layout [#layout-1]

```ts
layout: Readonly<LabelLayout>;
```

Defined in: [extensions/contracts.ts:134](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L134)

***

### DecorationRenderer [#decorationrenderer]

Defined in: [extensions/contracts.ts:138](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L138)

Stateless decoration content renderer; LabelLayerRenderer owns positioning and scheduling.

#### Type Parameters [#type-parameters-14]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Methods [#methods-14]

##### measure() [#measure]

```ts
measure(params: DecorationMeasureParams<T>): LabelLayout;
```

Defined in: [extensions/contracts.ts:139](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L139)

###### Parameters [#parameters-102]

| Parameter | Type                                                        |
| --------- | ----------------------------------------------------------- |
| `params`  | [`DecorationMeasureParams`](#decorationmeasureparams)\<`T`> |

###### Returns [#returns-134]

[`LabelLayout`](#labellayout)

##### draw() [#draw]

```ts
draw(params: DecorationDrawParams<T>): void;
```

Defined in: [extensions/contracts.ts:140](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L140)

###### Parameters [#parameters-103]

| Parameter | Type                                                  |
| --------- | ----------------------------------------------------- |
| `params`  | [`DecorationDrawParams`](#decorationdrawparams)\<`T`> |

###### Returns [#returns-135]

`void`

***

### NodeOverlayDrawParams [#nodeoverlaydrawparams]

Defined in: [extensions/node.ts:6](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L6)

#### Properties [#properties-14]

##### node [#node-2]

```ts
node: GraphNode & {
  x: number;
  y: number;
};
```

Defined in: [extensions/node.ts:7](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L7)

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

Defined in: [extensions/node.ts:8](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L8)

##### y [#y-10]

```ts
y: number;
```

Defined in: [extensions/node.ts:9](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L9)

##### nodeSize [#nodesize]

```ts
nodeSize: number;
```

Defined in: [extensions/node.ts:10](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L10)

##### dpr [#dpr-2]

```ts
dpr: number;
```

Defined in: [extensions/node.ts:11](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L11)

##### zoom [#zoom-2]

```ts
zoom: number;
```

Defined in: [extensions/node.ts:12](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L12)

##### camera [#camera]

```ts
camera: Camera;
```

Defined in: [extensions/node.ts:13](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L13)

##### time [#time]

```ts
time: number;
```

Defined in: [extensions/node.ts:14](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L14)

***

### NodeBoundaryAnchorParams [#nodeboundaryanchorparams]

Defined in: [extensions/node.ts:17](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L17)

#### Properties [#properties-15]

##### node [#node-3]

```ts
node: GraphNode;
```

Defined in: [extensions/node.ts:18](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L18)

##### placement [#placement]

```ts
placement: "top" | "bottom" | "left" | "right";
```

Defined in: [extensions/node.ts:19](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L19)

##### crossOffsetRatio [#crossoffsetratio]

```ts
crossOffsetRatio: number;
```

Defined in: [extensions/node.ts:20](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L20)

##### width [#width]

```ts
width: number;
```

Defined in: [extensions/node.ts:21](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L21)

##### height [#height]

```ts
height: number;
```

Defined in: [extensions/node.ts:22](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L22)

##### borderRadius [#borderradius]

```ts
borderRadius: number;
```

Defined in: [extensions/node.ts:23](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L23)

***

### NodeExtension [#nodeextension]

Defined in: [extensions/node.ts:26](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L26)

#### Properties [#properties-16]

##### base? [#base-3]

```ts
optional base?: "circle" | "rect";
```

Defined in: [extensions/node.ts:27](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L27)

##### style? [#style-3]

```ts
optional style?: Partial<NodeStyleConfig>;
```

Defined in: [extensions/node.ts:28](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L28)

##### stateStyles? [#statestyles-3]

```ts
optional stateStyles?: Partial<Record<string, NodeStateStyleOverride>>;
```

Defined in: [extensions/node.ts:29](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L29)

##### getStyle? [#getstyle-3]

```ts
optional getStyle?: (node: GraphNode) => Partial<NodeStyleConfig>;
```

Defined in: [extensions/node.ts:30](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L30)

###### Parameters [#parameters-104]

| Parameter | Type                      |
| --------- | ------------------------- |
| `node`    | [`GraphNode`](#graphnode) |

###### Returns [#returns-136]

`Partial`\<[`NodeStyleConfig`](#nodestyleconfig)>

##### getBoundaryAnchor? [#getboundaryanchor-2]

```ts
optional getBoundaryAnchor?: (params: NodeBoundaryAnchorParams) => {
  x: number;
  y: number;
};
```

Defined in: [extensions/node.ts:32](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L32)

Returns a screen-space offset from the node center to its visual boundary.

###### Parameters [#parameters-105]

| Parameter | Type                                                    |
| --------- | ------------------------------------------------------- |
| `params`  | [`NodeBoundaryAnchorParams`](#nodeboundaryanchorparams) |

###### Returns [#returns-137]

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

Defined in: [extensions/node.ts:33](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L33)

###### Parameters [#parameters-106]

| Parameter | Type                                              |
| --------- | ------------------------------------------------- |
| `ctx`     | `CanvasRenderingContext2D`                        |
| `params`  | [`NodeOverlayDrawParams`](#nodeoverlaydrawparams) |

###### Returns [#returns-138]

`boolean` | `void`

***

### Camera [#camera-1]

Defined in: [renderer/camera.ts:5](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/renderer/camera.ts#L5)

2D pan + zoom camera for graph space -> NDC.

#### Properties [#properties-17]

##### x [#x-12]

```ts
x: number;
```

Defined in: [renderer/camera.ts:6](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/renderer/camera.ts#L6)

##### y [#y-12]

```ts
y: number;
```

Defined in: [renderer/camera.ts:7](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/renderer/camera.ts#L7)

##### zoom [#zoom-3]

```ts
zoom: number;
```

Defined in: [renderer/camera.ts:8](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/renderer/camera.ts#L8)

***

### NodeData [#nodedata]

Defined in: [types.ts:7](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L7)

Extended payload attached to a node.

#### Extends [#extends-6]

* `Record`\<`string`, `unknown`>

#### Indexable [#indexable-1]

```ts
[key: string]: unknown
```

#### Properties [#properties-18]

##### cluster? [#cluster]

```ts
optional cluster?: string;
```

Defined in: [types.ts:8](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L8)

***

### GraphNode [#graphnode]

Defined in: [types.ts:12](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L12)

Node: at least id; optional name and data.

#### Properties [#properties-19]

##### id [#id-2]

```ts
id: string;
```

Defined in: [types.ts:13](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L13)

##### name? [#name-1]

```ts
optional name?: string;
```

Defined in: [types.ts:14](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L14)

##### data? [#data-6]

```ts
optional data?: NodeData;
```

Defined in: [types.ts:15](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L15)

##### x? [#x-13]

```ts
optional x?: number;
```

Defined in: [types.ts:16](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L16)

##### y? [#y-13]

```ts
optional y?: number;
```

Defined in: [types.ts:17](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L17)

##### fx? [#fx]

```ts
optional fx?: number;
```

Defined in: [types.ts:18](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L18)

##### fy? [#fy]

```ts
optional fy?: number;
```

Defined in: [types.ts:19](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L19)

##### states? [#states-2]

```ts
optional states?: ElementState[];
```

Defined in: [types.ts:20](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L20)

##### comboId? [#comboid]

```ts
optional comboId?: string;
```

Defined in: [types.ts:21](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L21)

***

### NodeDataUpdate [#nodedataupdate]

Defined in: [types.ts:34](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L34)

#### Properties [#properties-20]

##### id [#id-3]

```ts
id: string;
```

Defined in: [types.ts:35](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L35)

##### data [#data-7]

```ts
data: Record<string, unknown>;
```

Defined in: [types.ts:36](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L36)

***

### EdgeDataUpdate [#edgedataupdate]

Defined in: [types.ts:39](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L39)

#### Properties [#properties-21]

##### id [#id-4]

```ts
id: string;
```

Defined in: [types.ts:40](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L40)

##### data? [#data-8]

```ts
optional data?: Record<string, unknown>;
```

Defined in: [types.ts:41](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L41)

##### source? [#source-2]

```ts
optional source?: string;
```

Defined in: [types.ts:42](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L42)

##### target? [#target-2]

```ts
optional target?: string;
```

Defined in: [types.ts:43](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L43)

***

### ViewportPoint [#viewportpoint]

Defined in: [types.ts:46](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L46)

#### Properties [#properties-22]

##### x [#x-14]

```ts
x: number;
```

Defined in: [types.ts:47](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L47)

##### y [#y-14]

```ts
y: number;
```

Defined in: [types.ts:48](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L48)

***

### ZoomOptions [#zoomoptions]

Defined in: [types.ts:51](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L51)

#### Properties [#properties-23]

##### center? [#center]

```ts
optional center?: ViewportPoint;
```

Defined in: [types.ts:53](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L53)

Client/screen coordinate that remains visually fixed while zooming.

##### minZoom? [#minzoom]

```ts
optional minZoom?: number;
```

Defined in: [types.ts:54](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L54)

##### maxZoom? [#maxzoom]

```ts
optional maxZoom?: number;
```

Defined in: [types.ts:55](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L55)

***

### FitViewOptions [#fitviewoptions]

Defined in: [types.ts:58](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L58)

#### Properties [#properties-24]

##### padding? [#padding]

```ts
optional padding?: number | [number, number, number, number];
```

Defined in: [types.ts:60](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L60)

CSS-like padding in viewport pixels.

##### minZoom? [#minzoom-1]

```ts
optional minZoom?: number;
```

Defined in: [types.ts:61](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L61)

##### maxZoom? [#maxzoom-1]

```ts
optional maxZoom?: number;
```

Defined in: [types.ts:62](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L62)

***

### SetDataOptions [#setdataoptions]

Defined in: [types.ts:65](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L65)

#### Properties [#properties-25]

##### fitView? [#fitview-1]

```ts
optional fitView?: number | boolean | FitViewOptions;
```

Defined in: [types.ts:67](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L67)

Auto-fit after replacement. false preserves the current camera.

***

### NodePositionUpdate [#nodepositionupdate]

Defined in: [types.ts:70](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L70)

#### Properties [#properties-26]

##### id [#id-5]

```ts
id: string;
```

Defined in: [types.ts:71](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L71)

##### x [#x-15]

```ts
x: number;
```

Defined in: [types.ts:72](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L72)

##### y [#y-15]

```ts
y: number;
```

Defined in: [types.ts:73](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L73)

***

### GraphPoint [#graphpoint]

Defined in: [types.ts:76](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L76)

#### Properties [#properties-27]

##### x [#x-16]

```ts
x: number;
```

Defined in: [types.ts:77](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L77)

##### y [#y-16]

```ts
y: number;
```

Defined in: [types.ts:78](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L78)

***

### GraphElementEvent [#graphelementevent]

Defined in: [types.ts:81](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L81)

#### Type Parameters [#type-parameters-15]

| Type Parameter | Default type                   |
| -------------- | ------------------------------ |
| `T`            | `Record`\<`string`, `unknown`> |

#### Properties [#properties-28]

##### targetType [#targettype]

```ts
targetType: "node" | "edge" | "combo" | "canvas";
```

Defined in: [types.ts:82](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L82)

##### targetId? [#targetid]

```ts
optional targetId?: string;
```

Defined in: [types.ts:83](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L83)

##### data? [#data-9]

```ts
optional data?: T;
```

Defined in: [types.ts:84](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L84)

##### client [#client]

```ts
client: GraphPoint;
```

Defined in: [types.ts:85](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L85)

##### canvas [#canvas]

```ts
canvas: GraphPoint;
```

Defined in: [types.ts:86](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L86)

##### graph [#graph-2]

```ts
graph: GraphPoint;
```

Defined in: [types.ts:87](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L87)

##### nativeEvent [#nativeevent]

```ts
nativeEvent: MouseEvent | WheelEvent;
```

Defined in: [types.ts:88](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L88)

##### ~~event~~ [#event-1]

```ts
event: MouseEvent | WheelEvent;
```

Defined in: [types.ts:90](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L90)

###### Deprecated [#deprecated-7]

Use nativeEvent.

##### nodeId? [#nodeid-1]

```ts
optional nodeId?: string;
```

Defined in: [types.ts:92](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L92)

Compatibility fields for existing consumers.

##### edgeId? [#edgeid-1]

```ts
optional edgeId?: string;
```

Defined in: [types.ts:93](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L93)

##### comboId? [#comboid-1]

```ts
optional comboId?: string;
```

Defined in: [types.ts:94](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L94)

##### edgeIndex? [#edgeindex-1]

```ts
optional edgeIndex?: number;
```

Defined in: [types.ts:95](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L95)

##### source? [#source-3]

```ts
optional source?: string;
```

Defined in: [types.ts:96](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L96)

##### target? [#target-3]

```ts
optional target?: string;
```

Defined in: [types.ts:97](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L97)

***

### GraphEdge [#graphedge]

Defined in: [types.ts:107](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L107)

Edge: at least source and target (node ids); optional data and states.

#### Properties [#properties-29]

##### id? [#id-6]

```ts
optional id?: string;
```

Defined in: [types.ts:108](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L108)

##### source [#source-4]

```ts
source: string;
```

Defined in: [types.ts:109](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L109)

##### target [#target-4]

```ts
target: string;
```

Defined in: [types.ts:110](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L110)

##### data? [#data-10]

```ts
optional data?: EdgeData;
```

Defined in: [types.ts:111](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L111)

##### states? [#states-3]

```ts
optional states?: ElementState[];
```

Defined in: [types.ts:112](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L112)

***

### NodeModel [#nodemodel]

Defined in: [types.ts:119](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L119)

Read-only normalized node view returned by Graph query APIs.
The view is backed by Graph; update it through Graph data/state APIs.

#### Properties [#properties-30]

##### id [#id-7]

```ts
readonly id: string;
```

Defined in: [types.ts:120](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L120)

##### name? [#name-2]

```ts
readonly optional name?: string;
```

Defined in: [types.ts:121](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L121)

##### x [#x-17]

```ts
readonly x: number;
```

Defined in: [types.ts:122](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L122)

##### y [#y-17]

```ts
readonly y: number;
```

Defined in: [types.ts:123](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L123)

##### data? [#data-11]

```ts
readonly optional data?: Readonly<Record<string, unknown>>;
```

Defined in: [types.ts:124](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L124)

##### states [#states-4]

```ts
readonly states: ReadonlySet<ElementState>;
```

Defined in: [types.ts:125](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L125)

***

### EdgeModel [#edgemodel]

Defined in: [types.ts:132](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L132)

Read-only normalized edge view returned by Graph query APIs.
The view is backed by Graph; update it through Graph data/state APIs.

#### Properties [#properties-31]

##### id [#id-8]

```ts
readonly id: string;
```

Defined in: [types.ts:133](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L133)

##### source [#source-5]

```ts
readonly source: string;
```

Defined in: [types.ts:134](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L134)

##### target [#target-5]

```ts
readonly target: string;
```

Defined in: [types.ts:135](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L135)

##### data? [#data-12]

```ts
readonly optional data?: Readonly<Record<string, unknown>>;
```

Defined in: [types.ts:136](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L136)

##### states [#states-5]

```ts
readonly states: ReadonlySet<ElementState>;
```

Defined in: [types.ts:137](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L137)

***

### ParallelEdgesConfig [#paralleledgesconfig]

Defined in: [types.ts:141](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L141)

Configuration for automatic same-endpoint edge separation.

#### Properties [#properties-32]

##### enabled? [#enabled]

```ts
optional enabled?: boolean;
```

Defined in: [types.ts:142](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L142)

##### offset? [#offset-1]

```ts
optional offset?: number;
```

Defined in: [types.ts:144](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L144)

Offset step in graph coordinates. Defaults to 20.

##### mergeBy? [#mergeby]

```ts
optional mergeBy?: ("source" | "target")[];
```

Defined in: [types.ts:146](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L146)

Grouping fields. Currently only source/target grouping is supported.

##### includeReverse? [#includereverse]

```ts
optional includeReverse?: boolean;
```

Defined in: [types.ts:148](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L148)

Whether A->B and B->A belong to the same separation group. Defaults to true.

##### minOffset? [#minoffset]

```ts
optional minOffset?: number;
```

Defined in: [types.ts:150](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L150)

Clamp minimum absolute offset for non-center parallel edges. Defaults to 0.

##### maxOffset? [#maxoffset]

```ts
optional maxOffset?: number;
```

Defined in: [types.ts:152](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L152)

Clamp maximum absolute offset. Defaults to 80.

***

### GraphData [#graphdata]

Defined in: [types.ts:169](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L169)

Graph data: nodes, edges, and optional combos.

#### Properties [#properties-33]

##### nodes [#nodes-1]

```ts
nodes: GraphNode[];
```

Defined in: [types.ts:170](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L170)

##### edges [#edges]

```ts
edges: GraphEdge[];
```

Defined in: [types.ts:171](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L171)

##### combos? [#combos-1]

```ts
optional combos?: ComboData[];
```

Defined in: [types.ts:172](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L172)

***

### NodeStateStyleOverride [#nodestatestyleoverride]

Defined in: [types.ts:179](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L179)

Style overrides applied per node state.

#### Properties [#properties-34]

##### fill? [#fill]

```ts
optional fill?: string;
```

Defined in: [types.ts:180](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L180)

##### stroke? [#stroke]

```ts
optional stroke?: string;
```

Defined in: [types.ts:181](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L181)

##### strokeWidth? [#strokewidth]

```ts
optional strokeWidth?: number;
```

Defined in: [types.ts:182](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L182)

##### opacity? [#opacity]

```ts
optional opacity?: number;
```

Defined in: [types.ts:183](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L183)

##### haloWidth? [#halowidth]

```ts
optional haloWidth?: number;
```

Defined in: [types.ts:184](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L184)

***

### NodeBadgeItem [#nodebadgeitem]

Defined in: [types.ts:197](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L197)

#### Properties [#properties-35]

##### kind [#kind]

```ts
kind: NodeBadgeKind;
```

Defined in: [types.ts:198](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L198)

##### value? [#value]

```ts
optional value?: string | number;
```

Defined in: [types.ts:199](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L199)

##### text? [#text]

```ts
optional text?: string;
```

Defined in: [types.ts:200](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L200)

##### icon? [#icon]

```ts
optional icon?: string;
```

Defined in: [types.ts:201](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L201)

##### iconFontFamily? [#iconfontfamily]

```ts
optional iconFontFamily?: string;
```

Defined in: [types.ts:202](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L202)

##### fill? [#fill-1]

```ts
optional fill?: string;
```

Defined in: [types.ts:203](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L203)

##### color? [#color]

```ts
optional color?: string;
```

Defined in: [types.ts:204](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L204)

***

### ResolvedLabelStyle [#resolvedlabelstyle]

Defined in: [types.ts:214](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L214)

Final, function-free label style passed to a custom label renderer.

#### Properties [#properties-36]

##### labelFontSize [#labelfontsize]

```ts
labelFontSize: number;
```

Defined in: [types.ts:216](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L216)

Canvas backing-store pixels after DPR/zoom conversion.

##### labelFontFamily [#labelfontfamily]

```ts
labelFontFamily: string;
```

Defined in: [types.ts:217](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L217)

##### labelFontWeight [#labelfontweight]

```ts
labelFontWeight: string;
```

Defined in: [types.ts:218](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L218)

##### labelColor [#labelcolor]

```ts
labelColor: string;
```

Defined in: [types.ts:219](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L219)

##### labelPlacement [#labelplacement]

```ts
labelPlacement: "center" | "top" | "bottom" | "left" | "right" | "start" | "end";
```

Defined in: [types.ts:220](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L220)

##### labelOffsetX [#labeloffsetx]

```ts
labelOffsetX: number;
```

Defined in: [types.ts:222](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L222)

Canvas backing-store pixels after DPR/zoom conversion.

##### labelOffsetY [#labeloffsety]

```ts
labelOffsetY: number;
```

Defined in: [types.ts:224](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L224)

Canvas backing-store pixels after DPR/zoom conversion.

##### labelBackground [#labelbackground]

```ts
labelBackground: string | false;
```

Defined in: [types.ts:225](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L225)

##### labelBackgroundPadding [#labelbackgroundpadding]

```ts
labelBackgroundPadding: number;
```

Defined in: [types.ts:227](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L227)

Canvas backing-store pixels after DPR/zoom conversion.

##### labelMaxWidth [#labelmaxwidth]

```ts
labelMaxWidth: number;
```

Defined in: [types.ts:229](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L229)

Canvas backing-store pixels after DPR/zoom conversion; 0 means unlimited.

##### labelAutoRotate [#labelautorotate]

```ts
labelAutoRotate: boolean;
```

Defined in: [types.ts:230](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L230)

***

### LabelLayout [#labellayout]

Defined in: [types.ts:234](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L234)

Measurement result returned by a custom label renderer.

#### Type Parameters [#type-parameters-16]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Properties [#properties-37]

##### width [#width-1]

```ts
width: number;
```

Defined in: [types.ts:236](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L236)

Full visual width in Canvas backing-store pixels.

##### height [#height-1]

```ts
height: number;
```

Defined in: [types.ts:238](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L238)

Full visual height in Canvas backing-store pixels.

##### data? [#data-13]

```ts
optional data?: T;
```

Defined in: [types.ts:240](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L240)

Renderer-owned data passed from measure() to draw() for the same label.

***

### NodeLabelParams [#nodelabelparams]

Defined in: [types.ts:252](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L252)

Custom label renderer context for a node label.

#### Extends [#extends-7]

* `LabelParamsBase`

#### Properties [#properties-38]

##### ctx [#ctx-2]

```ts
ctx: CanvasRenderingContext2D;
```

Defined in: [types.ts:244](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L244)

###### Inherited from [#inherited-from-23]

```ts
LabelParamsBase.ctx
```

##### text [#text-1]

```ts
text: string;
```

Defined in: [types.ts:245](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L245)

###### Inherited from [#inherited-from-24]

```ts
LabelParamsBase.text
```

##### style [#style-4]

```ts
style: Readonly<ResolvedLabelStyle>;
```

Defined in: [types.ts:246](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L246)

###### Inherited from [#inherited-from-25]

```ts
LabelParamsBase.style
```

##### dpr [#dpr-3]

```ts
dpr: number;
```

Defined in: [types.ts:247](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L247)

###### Inherited from [#inherited-from-26]

```ts
LabelParamsBase.dpr
```

##### zoom [#zoom-4]

```ts
zoom: number;
```

Defined in: [types.ts:248](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L248)

###### Inherited from [#inherited-from-27]

```ts
LabelParamsBase.zoom
```

##### type [#type-2]

```ts
type: "node";
```

Defined in: [types.ts:253](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L253)

##### item [#item]

```ts
item: GraphNode;
```

Defined in: [types.ts:254](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L254)

##### node [#node-4]

```ts
node: GraphNode;
```

Defined in: [types.ts:255](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L255)

***

### EdgeLabelParams [#edgelabelparams]

Defined in: [types.ts:259](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L259)

Custom label renderer context for an edge label.

#### Extends [#extends-8]

* `LabelParamsBase`

#### Properties [#properties-39]

##### ctx [#ctx-3]

```ts
ctx: CanvasRenderingContext2D;
```

Defined in: [types.ts:244](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L244)

###### Inherited from [#inherited-from-28]

```ts
LabelParamsBase.ctx
```

##### text [#text-2]

```ts
text: string;
```

Defined in: [types.ts:245](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L245)

###### Inherited from [#inherited-from-29]

```ts
LabelParamsBase.text
```

##### style [#style-5]

```ts
style: Readonly<ResolvedLabelStyle>;
```

Defined in: [types.ts:246](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L246)

###### Inherited from [#inherited-from-30]

```ts
LabelParamsBase.style
```

##### dpr [#dpr-4]

```ts
dpr: number;
```

Defined in: [types.ts:247](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L247)

###### Inherited from [#inherited-from-31]

```ts
LabelParamsBase.dpr
```

##### zoom [#zoom-5]

```ts
zoom: number;
```

Defined in: [types.ts:248](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L248)

###### Inherited from [#inherited-from-32]

```ts
LabelParamsBase.zoom
```

##### type [#type-3]

```ts
type: "edge";
```

Defined in: [types.ts:260](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L260)

##### item [#item-1]

```ts
item: GraphEdge;
```

Defined in: [types.ts:261](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L261)

##### edge [#edge]

```ts
edge: GraphEdge;
```

Defined in: [types.ts:262](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L262)

##### source [#source-6]

```ts
source: GraphNode;
```

Defined in: [types.ts:263](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L263)

##### target [#target-6]

```ts
target: GraphNode;
```

Defined in: [types.ts:264](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L264)

***

### LabelRenderer [#labelrenderer]

Defined in: [types.ts:276](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L276)

Shared custom label renderer protocol for node and edge labels.

#### Type Parameters [#type-parameters-17]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Methods [#methods-15]

##### measure() [#measure-1]

```ts
measure(params: LabelMeasureParams): LabelLayout<T>;
```

Defined in: [types.ts:277](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L277)

###### Parameters [#parameters-107]

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `params`  | [`LabelMeasureParams`](#labelmeasureparams) |

###### Returns [#returns-139]

[`LabelLayout`](#labellayout)\<`T`>

##### draw() [#draw-1]

```ts
draw(params: LabelDrawParams<T>): void;
```

Defined in: [types.ts:278](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L278)

###### Parameters [#parameters-108]

| Parameter | Type                                        |
| --------- | ------------------------------------------- |
| `params`  | [`LabelDrawParams`](#labeldrawparams)\<`T`> |

###### Returns [#returns-140]

`void`

***

### NodeDecorationConfig [#nodedecorationconfig]

Defined in: [types.ts:281](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L281)

#### Type Parameters [#type-parameters-18]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Properties [#properties-40]

##### renderer [#renderer]

```ts
renderer: string;
```

Defined in: [types.ts:282](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L282)

##### placement? [#placement-1]

```ts
optional placement?: NodeStyleValue<NodeDecorationPlacement>;
```

Defined in: [types.ts:283](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L283)

##### attachment? [#attachment]

```ts
optional attachment?: NodeDecorationAttachment;
```

Defined in: [types.ts:285](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L285)

Defaults to `boundary`, which centers the decoration on the node edge.

##### anchor? [#anchor]

```ts
optional anchor?: NodeDecorationAnchor;
```

Defined in: [types.ts:287](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L287)

Which edge of the decoration box is aligned to the node-side anchor.

##### crossOffsetRatio? [#crossoffsetratio-1]

```ts
optional crossOffsetRatio?: NodeStyleValue<number>;
```

Defined in: [types.ts:289](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L289)

Cross-axis offset relative to the node width/height.

##### boundaryOverlap? [#boundaryoverlap]

```ts
optional boundaryOverlap?: NodeStyleValue<number | "half-badge">;
```

Defined in: [types.ts:291](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L291)

With `anchor: start`, overlap by CSS pixels or half the boundary-adjacent badge height.

##### layout? [#layout-2]

```ts
optional layout?: "single" | "stack";
```

Defined in: [types.ts:293](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L293)

Enables engine-managed vertical item stacking.

##### items? [#items]

```ts
optional items?: T[] | ((node: GraphNode) => T[]);
```

Defined in: [types.ts:294](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L294)

##### sort? [#sort]

```ts
optional sort?: "none" | "width-desc";
```

Defined in: [types.ts:295](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L295)

##### maxVisible? [#maxvisible]

```ts
optional maxVisible?: number;
```

Defined in: [types.ts:296](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L296)

##### overflow? [#overflow]

```ts
optional overflow?: "clip" | "hover-expand";
```

Defined in: [types.ts:297](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L297)

##### overflowData? [#overflowdata]

```ts
optional overflowData?: 
  | T
  | ((hiddenCount: number, node: GraphNode) => T);
```

Defined in: [types.ts:298](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L298)

##### itemGap? [#itemgap]

```ts
optional itemGap?: number;
```

Defined in: [types.ts:299](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L299)

##### offsetX? [#offsetx]

```ts
optional offsetX?: number;
```

Defined in: [types.ts:300](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L300)

##### offsetY? [#offsety]

```ts
optional offsetY?: number;
```

Defined in: [types.ts:301](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L301)

##### data? [#data-14]

```ts
optional data?: T | ((node: GraphNode) => T);
```

Defined in: [types.ts:302](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L302)

***

### NodeStyleConfig [#nodestyleconfig]

Defined in: [types.ts:305](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L305)

#### Properties [#properties-41]

##### fill? [#fill-2]

```ts
optional fill?: NodeStyleValue<string>;
```

Defined in: [types.ts:306](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L306)

##### size? [#size]

```ts
optional size?: NodeStyleValue<number>;
```

Defined in: [types.ts:307](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L307)

##### width? [#width-2]

```ts
optional width?: NodeStyleValue<number>;
```

Defined in: [types.ts:308](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L308)

##### height? [#height-2]

```ts
optional height?: NodeStyleValue<number>;
```

Defined in: [types.ts:309](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L309)

##### stroke? [#stroke-1]

```ts
optional stroke?: NodeStyleValue<string>;
```

Defined in: [types.ts:310](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L310)

##### strokeWidth? [#strokewidth-1]

```ts
optional strokeWidth?: NodeStyleValue<number>;
```

Defined in: [types.ts:311](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L311)

##### opacity? [#opacity-1]

```ts
optional opacity?: NodeStyleValue<number>;
```

Defined in: [types.ts:312](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L312)

##### borderRadius? [#borderradius-1]

```ts
optional borderRadius?: NodeStyleValue<number>;
```

Defined in: [types.ts:313](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L313)

##### label? [#label]

```ts
optional label?: NodeStyleValue<string | false>;
```

Defined in: [types.ts:314](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L314)

##### labelFontSize? [#labelfontsize-1]

```ts
optional labelFontSize?: NodeStyleValue<number>;
```

Defined in: [types.ts:315](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L315)

##### labelFontFamily? [#labelfontfamily-1]

```ts
optional labelFontFamily?: NodeStyleValue<string>;
```

Defined in: [types.ts:316](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L316)

##### labelFontWeight? [#labelfontweight-1]

```ts
optional labelFontWeight?: NodeStyleValue<string>;
```

Defined in: [types.ts:317](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L317)

##### labelColor? [#labelcolor-1]

```ts
optional labelColor?: NodeStyleValue<string>;
```

Defined in: [types.ts:318](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L318)

##### labelPlacement? [#labelplacement-1]

```ts
optional labelPlacement?: NodeStyleValue<LabelPlacement>;
```

Defined in: [types.ts:319](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L319)

##### labelOffsetX? [#labeloffsetx-1]

```ts
optional labelOffsetX?: NodeStyleValue<number>;
```

Defined in: [types.ts:320](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L320)

##### labelOffsetY? [#labeloffsety-1]

```ts
optional labelOffsetY?: NodeStyleValue<number>;
```

Defined in: [types.ts:321](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L321)

##### labelBackground? [#labelbackground-1]

```ts
optional labelBackground?: NodeStyleValue<string | false>;
```

Defined in: [types.ts:322](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L322)

##### labelBackgroundPadding? [#labelbackgroundpadding-1]

```ts
optional labelBackgroundPadding?: NodeStyleValue<number>;
```

Defined in: [types.ts:323](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L323)

##### labelMaxWidth? [#labelmaxwidth-1]

```ts
optional labelMaxWidth?: NodeStyleValue<number>;
```

Defined in: [types.ts:324](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L324)

##### icon? [#icon-1]

```ts
optional icon?: NodeStyleValue<string | false>;
```

Defined in: [types.ts:325](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L325)

##### iconWidth? [#iconwidth]

```ts
optional iconWidth?: NodeStyleValue<number>;
```

Defined in: [types.ts:326](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L326)

##### iconHeight? [#iconheight]

```ts
optional iconHeight?: NodeStyleValue<number>;
```

Defined in: [types.ts:327](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L327)

##### iconType? [#icontype]

```ts
optional iconType?: NodeStyleValue<"text" | "image">;
```

Defined in: [types.ts:328](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L328)

##### iconFontFamily? [#iconfontfamily-1]

```ts
optional iconFontFamily?: NodeStyleValue<string>;
```

Defined in: [types.ts:329](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L329)

##### iconFontSize? [#iconfontsize]

```ts
optional iconFontSize?: NodeStyleValue<number>;
```

Defined in: [types.ts:330](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L330)

##### iconColor? [#iconcolor]

```ts
optional iconColor?: NodeStyleValue<string>;
```

Defined in: [types.ts:331](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L331)

##### iconOffsetX? [#iconoffsetx]

```ts
optional iconOffsetX?: NodeStyleValue<number>;
```

Defined in: [types.ts:332](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L332)

##### iconOffsetY? [#iconoffsety]

```ts
optional iconOffsetY?: NodeStyleValue<number>;
```

Defined in: [types.ts:333](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L333)

***

### NodeConfig [#nodeconfig]

Defined in: [types.ts:337](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L337)

Node config: type and style (WebGL-capable only).

#### Properties [#properties-42]

##### type? [#type-4]

```ts
optional type?: 
  | string & {
}
  | "circle"
  | "rect";
```

Defined in: [types.ts:338](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L338)

##### labelRenderer? [#labelrenderer-1]

```ts
optional labelRenderer?: string;
```

Defined in: [types.ts:340](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L340)

Registered custom label renderer name.

##### decorations? [#decorations]

```ts
optional decorations?: NodeDecorationConfig<unknown>[];
```

Defined in: [types.ts:341](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L341)

##### autoExternalLabelPlacement? [#autoexternallabelplacement]

```ts
optional autoExternalLabelPlacement?: boolean;
```

Defined in: [types.ts:343](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L343)

Keeps the default node label below decorated nodes unless labelPlacement is explicit.

##### style? [#style-6]

```ts
optional style?: 
  | NodeStyleConfig
  | ((node: GraphNode) => Partial<NodeStyleConfig>);
```

Defined in: [types.ts:344](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L344)

##### stateStyles? [#statestyles-4]

```ts
optional stateStyles?: Partial<Record<ElementState, NodeStateStyleOverride>>;
```

Defined in: [types.ts:345](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L345)

***

### EdgeStateStyleOverride [#edgestatestyleoverride]

Defined in: [types.ts:352](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L352)

Style overrides applied per edge state.

#### Properties [#properties-43]

##### stroke? [#stroke-2]

```ts
optional stroke?: string;
```

Defined in: [types.ts:353](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L353)

##### lineWidth? [#linewidth]

```ts
optional lineWidth?: number;
```

Defined in: [types.ts:354](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L354)

##### opacity? [#opacity-2]

```ts
optional opacity?: number;
```

Defined in: [types.ts:355](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L355)

##### lineDash? [#linedash]

```ts
optional lineDash?: number[];
```

Defined in: [types.ts:356](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L356)

***

### EdgeConfig [#edgeconfig]

Defined in: [types.ts:360](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L360)

Edge config: type and style (WebGL-capable only).

#### Properties [#properties-44]

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

Defined in: [types.ts:361](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L361)

##### labelRenderer? [#labelrenderer-2]

```ts
optional labelRenderer?: string;
```

Defined in: [types.ts:363](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L363)

Registered custom label renderer name.

##### parallelEdges? [#paralleledges]

```ts
optional parallelEdges?: boolean | ParallelEdgesConfig;
```

Defined in: [types.ts:364](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L364)

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

Defined in: [types.ts:365](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L365)

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

Defined in: [types.ts:389](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L389)

***

### LayoutConfig [#layoutconfig]

Defined in: [types.ts:393](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L393)

Layout config: type + algorithm-specific options (aligned with @antv/layout).

#### Indexable [#indexable-2]

```ts
[key: string]: unknown
```

#### Properties [#properties-45]

##### type [#type-6]

```ts
type: string;
```

Defined in: [types.ts:394](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L394)

##### worker? [#worker]

```ts
optional worker?: boolean;
```

Defined in: [types.ts:396](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L396)

Run layout in a Web Worker to avoid blocking the main thread.

##### width? [#width-3]

```ts
optional width?: number;
```

Defined in: [types.ts:398](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L398)

Layout viewport width; defaults to the canvas width (injected by Graph).

##### height? [#height-3]

```ts
optional height?: number;
```

Defined in: [types.ts:400](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L400)

Layout viewport height; defaults to the canvas height (injected by Graph).

##### center? [#center-1]

```ts
optional center?: [number, number];
```

Defined in: [types.ts:402](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L402)

Layout center point; defaults to \[width/2, height/2].

***

### PluginOption [#pluginoption]

Defined in: [types.ts:415](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L415)

#### Indexable [#indexable-3]

```ts
[key: string]: unknown
```

#### Properties [#properties-46]

##### type [#type-7]

```ts
type: string;
```

Defined in: [types.ts:416](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L416)

***

### ThemeTokens [#themetokens]

Defined in: [types.ts:421](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L421)

Theme tokens (partial list; extend as needed).

#### Properties [#properties-47]

##### nodeFill? [#nodefill]

```ts
optional nodeFill?: string;
```

Defined in: [types.ts:422](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L422)

##### nodeSize? [#nodesize-1]

```ts
optional nodeSize?: number;
```

Defined in: [types.ts:423](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L423)

##### nodeStroke? [#nodestroke]

```ts
optional nodeStroke?: string;
```

Defined in: [types.ts:424](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L424)

##### nodeStrokeWidth? [#nodestrokewidth]

```ts
optional nodeStrokeWidth?: number;
```

Defined in: [types.ts:425](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L425)

##### edgeStroke? [#edgestroke]

```ts
optional edgeStroke?: string;
```

Defined in: [types.ts:426](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L426)

##### edgeLineWidth? [#edgelinewidth]

```ts
optional edgeLineWidth?: number;
```

Defined in: [types.ts:427](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L427)

##### canvasBackground? [#canvasbackground]

```ts
optional canvasBackground?: string;
```

Defined in: [types.ts:428](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L428)

##### edgeDefaultColor? [#edgedefaultcolor]

```ts
optional edgeDefaultColor?: string;
```

Defined in: [types.ts:429](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L429)

##### edgeCategoryPalette? [#edgecategorypalette]

```ts
optional edgeCategoryPalette?: string[];
```

Defined in: [types.ts:430](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L430)

##### edgeArrow? [#edgearrow]

```ts
optional edgeArrow?: boolean;
```

Defined in: [types.ts:431](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L431)

##### edgeStateStyles? [#edgestatestyles]

```ts
optional edgeStateStyles?: Partial<Record<ElementState, EdgeStateStyleOverride>>;
```

Defined in: [types.ts:432](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L432)

##### nodeStateStyles? [#nodestatestyles]

```ts
optional nodeStateStyles?: Partial<Record<ElementState, NodeStateStyleOverride>>;
```

Defined in: [types.ts:433](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L433)

***

### ComboData [#combodata]

Defined in: [types.ts:440](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L440)

Combo (group container) user data.

#### Properties [#properties-48]

##### id [#id-9]

```ts
id: string;
```

Defined in: [types.ts:441](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L441)

##### parentId? [#parentid]

```ts
optional parentId?: string;
```

Defined in: [types.ts:442](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L442)

##### collapsed? [#collapsed]

```ts
optional collapsed?: boolean;
```

Defined in: [types.ts:443](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L443)

##### style? [#style-8]

```ts
optional style?: Partial<ComboStyleConfig>;
```

Defined in: [types.ts:444](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L444)

##### data? [#data-15]

```ts
optional data?: Record<string, unknown>;
```

Defined in: [types.ts:445](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L445)

##### states? [#states-6]

```ts
optional states?: ElementState[];
```

Defined in: [types.ts:446](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L446)

***

### ComboStateStyleOverride [#combostatestyleoverride]

Defined in: [types.ts:453](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L453)

Style overrides applied per combo state.

#### Properties [#properties-49]

##### fill? [#fill-3]

```ts
optional fill?: ComboStyleValue<string>;
```

Defined in: [types.ts:454](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L454)

##### stroke? [#stroke-4]

```ts
optional stroke?: ComboStyleValue<string>;
```

Defined in: [types.ts:455](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L455)

##### strokeWidth? [#strokewidth-2]

```ts
optional strokeWidth?: ComboStyleValue<number>;
```

Defined in: [types.ts:456](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L456)

##### opacity? [#opacity-4]

```ts
optional opacity?: ComboStyleValue<number>;
```

Defined in: [types.ts:457](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L457)

##### borderRadius? [#borderradius-2]

```ts
optional borderRadius?: ComboStyleValue<number>;
```

Defined in: [types.ts:458](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L458)

##### label? [#label-2]

```ts
optional label?: ComboStyleValue<string | false>;
```

Defined in: [types.ts:459](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L459)

##### labelFontSize? [#labelfontsize-3]

```ts
optional labelFontSize?: ComboStyleValue<number>;
```

Defined in: [types.ts:460](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L460)

##### labelColor? [#labelcolor-3]

```ts
optional labelColor?: ComboStyleValue<string>;
```

Defined in: [types.ts:461](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L461)

***

### ComboStyleConfig [#combostyleconfig]

Defined in: [types.ts:465](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L465)

Combo style configuration.

#### Properties [#properties-50]

##### fill? [#fill-4]

```ts
optional fill?: ComboStyleValue<string>;
```

Defined in: [types.ts:466](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L466)

##### stroke? [#stroke-5]

```ts
optional stroke?: ComboStyleValue<string>;
```

Defined in: [types.ts:467](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L467)

##### strokeWidth? [#strokewidth-3]

```ts
optional strokeWidth?: ComboStyleValue<number>;
```

Defined in: [types.ts:468](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L468)

##### opacity? [#opacity-5]

```ts
optional opacity?: ComboStyleValue<number>;
```

Defined in: [types.ts:469](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L469)

##### borderRadius? [#borderradius-3]

```ts
optional borderRadius?: ComboStyleValue<number>;
```

Defined in: [types.ts:470](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L470)

##### padding? [#padding-1]

```ts
optional padding?: number | [number, number, number, number];
```

Defined in: [types.ts:471](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L471)

##### label? [#label-3]

```ts
optional label?: ComboStyleValue<string | false>;
```

Defined in: [types.ts:472](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L472)

##### labelFontSize? [#labelfontsize-4]

```ts
optional labelFontSize?: ComboStyleValue<number>;
```

Defined in: [types.ts:473](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L473)

##### labelColor? [#labelcolor-4]

```ts
optional labelColor?: ComboStyleValue<string>;
```

Defined in: [types.ts:474](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L474)

##### labelPlacement? [#labelplacement-3]

```ts
optional labelPlacement?: "center" | "top" | "bottom" | "inside";
```

Defined in: [types.ts:475](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L475)

##### collapsedType? [#collapsedtype]

```ts
optional collapsedType?: "circle" | "rect";
```

Defined in: [types.ts:476](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L476)

##### collapsedSize? [#collapsedsize]

```ts
optional collapsedSize?: ComboStyleValue<number | [number, number]>;
```

Defined in: [types.ts:477](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L477)

##### size? [#size-1]

```ts
optional size?: ComboStyleValue<number | [number, number]>;
```

Defined in: [types.ts:478](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L478)

##### count? [#count]

```ts
optional count?: 
  | string
  | boolean
  | ((combo: ComboModel) => string | boolean);
```

Defined in: [types.ts:479](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L479)

##### stateStyles? [#statestyles-6]

```ts
optional stateStyles?: Partial<Record<ElementState, ComboStateStyleOverride>>;
```

Defined in: [types.ts:480](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L480)

***

### ComboConfig [#comboconfig]

Defined in: [types.ts:484](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L484)

Combo config in GraphOptions.

#### Properties [#properties-51]

##### style? [#style-9]

```ts
optional style?: ComboStyleConfig;
```

Defined in: [types.ts:485](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L485)

***

### ComboModel [#combomodel]

Defined in: [types.ts:492](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L492)

Read-only normalized combo view returned by Graph query APIs.
The view is backed by Graph; update it through Graph data/state APIs.

#### Properties [#properties-52]

##### id [#id-10]

```ts
readonly id: string;
```

Defined in: [types.ts:493](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L493)

##### parentId? [#parentid-1]

```ts
readonly optional parentId?: string;
```

Defined in: [types.ts:494](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L494)

##### childNodeIds [#childnodeids]

```ts
readonly childNodeIds: ReadonlySet<string>;
```

Defined in: [types.ts:495](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L495)

##### childComboIds [#childcomboids]

```ts
readonly childComboIds: ReadonlySet<string>;
```

Defined in: [types.ts:496](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L496)

##### collapsed [#collapsed-1]

```ts
readonly collapsed: boolean;
```

Defined in: [types.ts:497](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L497)

##### x [#x-18]

```ts
readonly x: number;
```

Defined in: [types.ts:498](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L498)

##### y [#y-18]

```ts
readonly y: number;
```

Defined in: [types.ts:499](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L499)

##### width [#width-4]

```ts
readonly width: number;
```

Defined in: [types.ts:500](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L500)

##### height [#height-4]

```ts
readonly height: number;
```

Defined in: [types.ts:501](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L501)

##### style? [#style-10]

```ts
readonly optional style?: Readonly<Partial<ComboStyleConfig>>;
```

Defined in: [types.ts:502](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L502)

##### data? [#data-16]

```ts
readonly optional data?: Readonly<Record<string, unknown>>;
```

Defined in: [types.ts:503](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L503)

##### states [#states-7]

```ts
readonly states: ReadonlySet<ElementState>;
```

Defined in: [types.ts:504](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L504)

***

### GraphOptions [#graphoptions]

Defined in: [types.ts:527](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L527)

Full graph options.

#### Properties [#properties-53]

##### container [#container-1]

```ts
container: string | HTMLElement;
```

Defined in: [types.ts:528](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L528)

##### data [#data-17]

```ts
data: GraphData;
```

Defined in: [types.ts:529](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L529)

##### node? [#node-5]

```ts
optional node?: NodeConfig;
```

Defined in: [types.ts:530](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L530)

##### edge? [#edge-1]

```ts
optional edge?: EdgeConfig;
```

Defined in: [types.ts:531](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L531)

##### combo? [#combo]

```ts
optional combo?: ComboConfig;
```

Defined in: [types.ts:532](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L532)

##### layout? [#layout-3]

```ts
optional layout?: LayoutConfig;
```

Defined in: [types.ts:533](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L533)

##### behaviors? [#behaviors]

```ts
optional behaviors?: BehaviorOption[];
```

Defined in: [types.ts:534](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L534)

##### transforms? [#transforms]

```ts
optional transforms?: TransformOption[];
```

Defined in: [types.ts:535](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L535)

##### plugins? [#plugins]

```ts
optional plugins?: PluginOption[];
```

Defined in: [types.ts:536](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L536)

##### theme? [#theme]

```ts
optional theme?: ThemeOption;
```

Defined in: [types.ts:537](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L537)

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

Defined in: [behaviors/index.ts:34](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/behaviors/index.ts#L34)

***

### Handler [#handler]

```ts
type Handler<Args> = (...args: Args) => void;
```

Defined in: [events.ts:5](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/events.ts#L5)

Lightweight typed event emitter.

#### Type Parameters [#type-parameters-19]

| Type Parameter                |
| ----------------------------- |
| `Args` *extends* `unknown`\[] |

#### Parameters [#parameters-109]

| Parameter | Type   |
| --------- | ------ |
| ...`args` | `Args` |

#### Returns [#returns-141]

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

Defined in: [extensions/contracts.ts:13](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L13)

***

### ExtensionFactory [#extensionfactory]

```ts
type ExtensionFactory<T> = () => T;
```

Defined in: [extensions/contracts.ts:152](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L152)

Recommended registration form for stateful extensions.

#### Type Parameters [#type-parameters-20]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Returns [#returns-142]

`T`

***

### ~~ExtensionConstructor~~ [#extensionconstructor]

```ts
type ExtensionConstructor<T> = () => T;
```

Defined in: [extensions/contracts.ts:158](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L158)

#### Type Parameters [#type-parameters-21]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

#### Returns [#returns-143]

`T`

#### Deprecated [#deprecated-8]

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

Defined in: [extensions/contracts.ts:159](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/contracts.ts#L159)

#### Type Parameters [#type-parameters-22]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

***

### NodeExtensionInput [#nodeextensioninput]

```ts
type NodeExtensionInput = ExtensionInput<NodeExtension>;
```

Defined in: [extensions/node.ts:49](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L49)

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

Defined in: [layout/runLayout.ts:27](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/layout/runLayout.ts#L27)

#### Properties [#properties-54]

##### nodes [#nodes-2]

```ts
nodes: GraphNode & {
  x: number;
  y: number;
}[];
```

Defined in: [layout/runLayout.ts:27](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/layout/runLayout.ts#L27)

***

### EdgeData [#edgedata]

```ts
type EdgeData = Record<string, unknown>;
```

Defined in: [types.ts:25](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L25)

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

Defined in: [types.ts:28](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L28)

Shared state type for nodes and edges.

***

### ElementState [#elementstate]

```ts
type ElementState = 
  | BuiltInElementState
  | string & {
};
```

Defined in: [types.ts:32](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L32)

Built-in states plus application-defined state names.

***

### NodeState [#nodestate]

```ts
type NodeState = ElementState;
```

Defined in: [types.ts:101](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L101)

Node states for visual differentiation.

***

### EdgeState [#edgestate]

```ts
type EdgeState = ElementState;
```

Defined in: [types.ts:104](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L104)

Edge states for visual differentiation.

***

### NodeStyleValue [#nodestylevalue]

```ts
type NodeStyleValue<T> = T | ((node: GraphNode) => T);
```

Defined in: [types.ts:176](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L176)

Style value or function for node.

#### Type Parameters [#type-parameters-23]

| Type Parameter |
| -------------- |
| `T`            |

***

### LabelPlacement [#labelplacement-4]

```ts
type LabelPlacement = "center" | "top" | "bottom" | "left" | "right";
```

Defined in: [types.ts:188](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L188)

Label placement relative to node.

***

### NodeDecorationAttachment [#nodedecorationattachment]

```ts
type NodeDecorationAttachment = "boundary" | "outside" | "inside";
```

Defined in: [types.ts:191](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L191)

How a node decoration is attached relative to the selected node side.

***

### NodeDecorationAnchor [#nodedecorationanchor]

```ts
type NodeDecorationAnchor = "start" | "center" | "end";
```

Defined in: [types.ts:192](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L192)

***

### NodeDecorationPlacement [#nodedecorationplacement]

```ts
type NodeDecorationPlacement = LabelPlacement | "follow-label";
```

Defined in: [types.ts:193](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L193)

***

### NodeBadgeKind [#nodebadgekind]

```ts
type NodeBadgeKind = "count" | "lock" | "warning" | "favorite" | "text" | "icon";
```

Defined in: [types.ts:195](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L195)

***

### EdgeLabelPlacement [#edgelabelplacement]

```ts
type EdgeLabelPlacement = "start" | "center" | "end";
```

Defined in: [types.ts:208](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L208)

Edge label placement along the edge.

***

### LabelType [#labeltype]

```ts
type LabelType = "node" | "edge";
```

Defined in: [types.ts:211](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L211)

Label owner type shared by node and edge label renderers.

***

### LabelMeasureParams [#labelmeasureparams]

```ts
type LabelMeasureParams = 
  | NodeLabelParams
  | EdgeLabelParams;
```

Defined in: [types.ts:268](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L268)

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

Defined in: [types.ts:271](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L271)

Parameters passed to LabelRenderer.draw().

#### Type Parameters [#type-parameters-24]

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

Defined in: [types.ts:349](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L349)

Style value or function for edge (node1, node2, edge).

#### Type Parameters [#type-parameters-25]

| Type Parameter |
| -------------- |
| `T`            |

***

### BehaviorOption [#behavioroption]

```ts
type BehaviorOption = 
  | string
  | {
[key: string]: unknown;
  type: string;
};
```

Defined in: [types.ts:407](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L407)

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

Defined in: [types.ts:410](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L410)

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

Defined in: [types.ts:437](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L437)

Theme: preset name or object with type and overrides.

***

### ComboStyleValue [#combostylevalue]

```ts
type ComboStyleValue<T> = T | ((combo: ComboModel) => T);
```

Defined in: [types.ts:450](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L450)

Style value or function for combo.

#### Type Parameters [#type-parameters-26]

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

Defined in: [types.ts:508](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/types.ts#L508)

Normalized graph element model returned by Graph.getElementData().

## Functions [#functions]

### register() [#register]

#### Call Signature [#call-signature-6]

```ts
function register(
   type: "node", 
   name: string, 
   extension: NodeExtensionInput): void;
```

Defined in: [extensions/index.ts:19](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/index.ts#L19)

##### Parameters [#parameters-110]

| Parameter   | Type                                        |
| ----------- | ------------------------------------------- |
| `type`      | `"node"`                                    |
| `name`      | `string`                                    |
| `extension` | [`NodeExtensionInput`](#nodeextensioninput) |

##### Returns [#returns-144]

`void`

#### Call Signature [#call-signature-7]

```ts
function register<T>(
   type: "label", 
   name: string, 
   renderer: ExtensionInput<LabelRenderer<T>>): void;
```

Defined in: [extensions/index.ts:20](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/index.ts#L20)

##### Type Parameters [#type-parameters-27]

| Type Parameter | Default type |
| -------------- | ------------ |
| `T`            | `unknown`    |

##### Parameters [#parameters-111]

| Parameter  | Type                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| `type`     | `"label"`                                                                     |
| `name`     | `string`                                                                      |
| `renderer` | [`ExtensionInput`](#extensioninput)\<[`LabelRenderer`](#labelrenderer)\<`T`>> |

##### Returns [#returns-145]

`void`

#### Call Signature [#call-signature-8]

```ts
function register(
   type: "edge", 
   name: string, 
   extension: ExtensionInput<EdgeExtension>): void;
```

Defined in: [extensions/index.ts:25](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/index.ts#L25)

##### Parameters [#parameters-112]

| Parameter   | Type                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| `type`      | `"edge"`                                                                |
| `name`      | `string`                                                                |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`EdgeExtension`](#edgeextension)> |

##### Returns [#returns-146]

`void`

#### Call Signature [#call-signature-9]

```ts
function register(
   type: "decoration", 
   name: string, 
   extension: ExtensionInput<DecorationRenderer<unknown>>): void;
```

Defined in: [extensions/index.ts:30](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/index.ts#L30)

##### Parameters [#parameters-113]

| Parameter   | Type                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------- |
| `type`      | `"decoration"`                                                                                |
| `name`      | `string`                                                                                      |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`DecorationRenderer`](#decorationrenderer)\<`unknown`>> |

##### Returns [#returns-147]

`void`

#### Call Signature [#call-signature-10]

```ts
function register(
   type: "layout", 
   name: string, 
   extension: ExtensionInput<LayoutExtension<Record<string, unknown>>>): void;
```

Defined in: [extensions/index.ts:35](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/index.ts#L35)

##### Parameters [#parameters-114]

| Parameter   | Type                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| `type`      | `"layout"`                                                                                                   |
| `name`      | `string`                                                                                                     |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`LayoutExtension`](#layoutextension)\<`Record`\<`string`, `unknown`>>> |

##### Returns [#returns-148]

`void`

#### Call Signature [#call-signature-11]

```ts
function register(
   type: "behavior", 
   name: string, 
   extension: ExtensionInput<BehaviorExtension<Record<string, unknown>>>): void;
```

Defined in: [extensions/index.ts:40](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/index.ts#L40)

##### Parameters [#parameters-115]

| Parameter   | Type                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `type`      | `"behavior"`                                                                                                     |
| `name`      | `string`                                                                                                         |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`BehaviorExtension`](#behaviorextension)\<`Record`\<`string`, `unknown`>>> |

##### Returns [#returns-149]

`void`

#### Call Signature [#call-signature-12]

```ts
function register(
   type: "transform", 
   name: string, 
   extension: ExtensionInput<TransformExtension<Record<string, unknown>>>): void;
```

Defined in: [extensions/index.ts:45](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/index.ts#L45)

##### Parameters [#parameters-116]

| Parameter   | Type                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `type`      | `"transform"`                                                                                                      |
| `name`      | `string`                                                                                                           |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`TransformExtension`](#transformextension)\<`Record`\<`string`, `unknown`>>> |

##### Returns [#returns-150]

`void`

#### Call Signature [#call-signature-13]

```ts
function register(
   type: "plugin", 
   name: string, 
   extension: ExtensionInput<PluginExtension<Record<string, unknown>>>): void;
```

Defined in: [extensions/index.ts:50](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/index.ts#L50)

##### Parameters [#parameters-117]

| Parameter   | Type                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------ |
| `type`      | `"plugin"`                                                                                                   |
| `name`      | `string`                                                                                                     |
| `extension` | [`ExtensionInput`](#extensioninput)\<[`PluginExtension`](#pluginextension)\<`Record`\<`string`, `unknown`>>> |

##### Returns [#returns-151]

`void`

***

### ~~registerNode()~~ [#registernode]

```ts
function registerNode(name: string, extension: NodeExtensionInput): void;
```

Defined in: [extensions/node.ts:54](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/node.ts#L54)

#### Parameters [#parameters-118]

| Parameter   | Type                                        |
| ----------- | ------------------------------------------- |
| `name`      | `string`                                    |
| `extension` | [`NodeExtensionInput`](#nodeextensioninput) |

#### Returns [#returns-152]

`void`

#### Deprecated [#deprecated-9]

Use the unified register('node', name, extension) API.

***

### extensionFactory() [#extensionfactory-1]

```ts
function extensionFactory<T>(factory: ExtensionFactory<T>): ExtensionFactory<T>;
```

Defined in: [extensions/registry.ts:21](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/extensions/registry.ts#L21)

Marks a function as the preferred extension factory form.

#### Type Parameters [#type-parameters-28]

| Type Parameter |
| -------------- |
| `T`            |

#### Parameters [#parameters-119]

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `factory` | [`ExtensionFactory`](#extensionfactory)\<`T`> |

#### Returns [#returns-153]

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
   runtime?: {
  signal?: AbortSignal;
  extensionContext?: ExtensionContext;
}): Promise<LayoutResult>;
```

Defined in: [layout/runLayout.ts:69](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/layout/runLayout.ts#L69)

Run the configured layout on graph data; returns nodes with positions.
Layout options are passed through to the underlying @antv/layout algorithm.
When config.worker is true (or auto-detected for large graphs), layout runs
in a Web Worker to avoid blocking the main thread. Falls back to main-thread
layout if the Worker fails.

#### Parameters [#parameters-120]

| Parameter                   | Type                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| `data`                      | [`GraphData`](#graphdata)                                                                    |
| `config`                    | [`LayoutConfig`](#layoutconfig)                                                              |
| `viewport?`                 | \{ `width`: `number`; `height`: `number`; }                                                  |
| `viewport.width?`           | `number`                                                                                     |
| `viewport.height?`          | `number`                                                                                     |
| `runtime?`                  | \{ `signal?`: `AbortSignal`; `extensionContext?`: [`ExtensionContext`](#extensioncontext); } |
| `runtime.signal?`           | `AbortSignal`                                                                                |
| `runtime.extensionContext?` | [`ExtensionContext`](#extensioncontext)                                                      |

#### Returns [#returns-154]

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

Defined in: [theme.ts:81](https://github.com/antvis/G6Lite/blob/247cb7cb4218d3d765243d7a98565a59bcac7fdb/src/theme.ts#L81)

Resolve theme option to a full ThemeTokens object.
String -> preset; object -> preset + overrides.

#### Parameters [#parameters-121]

| Parameter | Type                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `theme`   | \| `"light"` \| `"dark"` \| \{ `type`: `"light"` \| `"dark"`; } & `Partial`\<[`ThemeTokens`](#themetokens)> |

#### Returns [#returns-155]

[`ThemeTokens`](#themetokens)
