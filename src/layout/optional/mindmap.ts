import type { LayoutExtension } from '../../extensions/contracts';
import { executeMindmapLayout, type MindmapLayoutOptions } from '../mindmapLayout';

const mindmap: LayoutExtension = {
  execute(data, { options }) {
    return executeMindmapLayout(data, options as MindmapLayoutOptions);
  },
};

export default mindmap;
