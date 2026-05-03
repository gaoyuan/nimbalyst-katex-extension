import './styles.css';

import type { ExtensionContext } from '@nimbalyst/extension-sdk';

import { InlineMathNode } from './nodes/InlineMathNode';
import { BlockMathNode } from './nodes/BlockMathNode';
import { INLINE_MATH_TRANSFORMER } from './transformers/inlineMathTransformer';
import {
  BLOCK_MATH_TRANSFORMER,
  BLOCK_MATH_TRANSFORMER_INLINE,
} from './transformers/blockMathTransformer';
import { handleInsertInlineMath, handleInsertBlockMath } from './slashCommands';
import { aiTools as aiToolsList } from './aiTools';

// The host reads `nodes`, `transformers`, `slashCommandHandlers`, and
// `aiTools` exports and merges them into the Markdown editor's node set,
// transformer pipeline, slash-command registry, and AI tool registry.

export const nodes = {
  InlineMathNode,
  BlockMathNode,
};

export const transformers = {
  // Order matters: the host's `findOutermostTextMatchTransformer` iterates
  // text-match transformers and prefers the FIRST recorded match unless a
  // later one is strictly wider. We register `$$...$$` before `$...$` so
  // the inline transformer never claims part of a display-math expression.
  BLOCK_MATH_INLINE_TRANSFORMER: BLOCK_MATH_TRANSFORMER_INLINE,
  BLOCK_MATH_TRANSFORMER,
  INLINE_MATH_TRANSFORMER,
};

export const slashCommandHandlers = {
  handleInsertInlineMath,
  handleInsertBlockMath,
};

export const aiTools = aiToolsList;

export function activate(_context: ExtensionContext) {
  // No host-level setup required: nodes and transformers register
  // themselves through the manifest contributions above.
  console.log('[katex-math] activated');
}

export function deactivate() {
  console.log('[katex-math] deactivated');
}

export {
  InlineMathNode,
  BlockMathNode,
  INLINE_MATH_TRANSFORMER,
  BLOCK_MATH_TRANSFORMER,
};
export {
  $createInlineMathNode,
  $isInlineMathNode,
} from './nodes/InlineMathNode';
export {
  $createBlockMathNode,
  $isBlockMathNode,
} from './nodes/BlockMathNode';
