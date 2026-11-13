import type { LayoutExtension } from '../../extensions/contracts';
import { executeIndentedLayout, type IndentedLayoutOptions } from '../indentedLayout';

const indented: LayoutExtension = {
  execute(data, { options }) {
    return executeIndentedLayout(data, options as IndentedLayoutOptions);
  },
};

export default indented;
