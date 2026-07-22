import {
  createDataUpdates,
  createPositionUpdates,
  generateGraphData,
} from '../datasets/generate.js';

function createModel(DataModel, theme, data) {
  const model = new DataModel({ theme });
  model.replaceData(data.nodes, data.edges);
  model.getChanges();
  return model;
}

export async function createDataModelSuite(mode) {
  const [{ DataModel }, { resolveTheme }] = await Promise.all([
    import('../../../dist/dataModel.js'),
    import('../../../dist/theme.js'),
  ]);
  const theme = resolveTheme('light');
  const tier = mode === 'full' ? 'small' : 'tiny';
  const nodeCount = mode === 'full' ? 1000 : 100;
  const data = generateGraphData(nodeCount, 3);
  const updateCount = Math.min(nodeCount, mode === 'full' ? 1000 : 100);
  const positionsA = createPositionUpdates(data, updateCount, 1);
  const positionsB = createPositionUpdates(data, updateCount, -1);
  const dataUpdatesA = createDataUpdates(data, updateCount, 1);
  const dataUpdatesB = createDataUpdates(data, updateCount, 2);

  const replaceModel = createModel(DataModel, theme, data);
  const positionModel = createModel(DataModel, theme, data);
  const dataModel = createModel(DataModel, theme, data);
  const stateModel = createModel(DataModel, theme, data);
  const transactionModel = createModel(DataModel, theme, data);
  const addedNodes = Array.from({ length: Math.min(100, nodeCount) }, (_, index) => ({
    id: `added-${index}`,
    x: index,
    y: -index,
    data: { source: 'benchmark' },
  }));
  const addedNodeIds = addedNodes.map((node) => node.id);
  let positionToggle = false;
  let dataToggle = false;
  let stateToggle = false;

  return {
    name: 'data-model',
    cases: [
      {
        name: `${tier}/construct-and-replace-data`,
        fn() {
          const model = new DataModel({ theme });
          model.replaceData(data.nodes, data.edges);
          model.getChanges();
        },
        metadata: { scope: 'internal', tier, operation: 'construct-and-replace-data' },
      },
      {
        name: `${tier}/replace-data`,
        fn() {
          replaceModel.replaceData(data.nodes, data.edges);
          replaceModel.getChanges();
        },
        metadata: { scope: 'internal', tier, operation: 'replace-data' },
      },
      {
        name: `${tier}/update-node-positions-${updateCount}`,
        fn() {
          positionToggle = !positionToggle;
          positionModel.updateNodePositions(positionToggle ? positionsA : positionsB);
          positionModel.getChanges();
        },
        metadata: { scope: 'internal', tier, operation: 'update-node-positions' },
      },
      {
        name: `${tier}/update-node-data-${updateCount}`,
        fn() {
          dataToggle = !dataToggle;
          dataModel.updateNodeDataBatch(dataToggle ? dataUpdatesA : dataUpdatesB);
          dataModel.getChanges();
        },
        metadata: { scope: 'internal', tier, operation: 'update-node-data' },
      },
      {
        name: `${tier}/toggle-node-state-${updateCount}`,
        fn() {
          stateToggle = !stateToggle;
          for (let index = 0; index < updateCount; index++) {
            stateModel.setNodeState(String(index), 'selected', stateToggle);
          }
          stateModel.getChanges();
        },
        metadata: { scope: 'internal', tier, operation: 'toggle-node-state' },
      },
      {
        name: `${tier}/add-remove-nodes-${addedNodes.length}`,
        fn() {
          transactionModel.addNodes(addedNodes);
          transactionModel.getChanges();
          transactionModel.removeNodes(addedNodeIds);
          transactionModel.getChanges();
        },
        metadata: { scope: 'internal', tier, operation: 'add-remove-nodes' },
      },
      {
        name: `${tier}/neighbor-query`,
        fn() {
          transactionModel.getNeighborNodes(String(Math.floor(nodeCount / 2)));
        },
        metadata: { scope: 'internal', tier, operation: 'neighbor-query' },
      },
    ],
  };
}
