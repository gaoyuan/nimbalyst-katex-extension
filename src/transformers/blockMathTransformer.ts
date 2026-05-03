import {
  BlockMathNode,
  $createBlockMathNode,
  $isBlockMathNode,
} from '../nodes/BlockMathNode';

const BLOCK_START = /^\$\$\s*$/;
const BLOCK_END = /^\$\$\s*$/;

// Multi-line element transformer: matches a fenced block of TeX between
// two lines that consist solely of `$$`. The body lines are concatenated
// with `\n` and stored as the node's TeX source.
//
// Falls back to a `text-match` transformer (BLOCK_MATH_TRANSFORMER_INLINE)
// for hosts whose @lexical/markdown predates `multiline-element`.
export const BLOCK_MATH_TRANSFORMER = {
  dependencies: [BlockMathNode],
  type: 'multiline-element' as const,
  regExpStart: BLOCK_START,
  regExpEnd: BLOCK_END,
  replace: (
    parentNode: any,
    _children: any[] | null,
    _startMatch: RegExpMatchArray,
    _endMatch: RegExpMatchArray | null,
    linesInBetween: string[] | null,
    _isImport: boolean
  ): boolean => {
    const tex = (linesInBetween ?? []).join('\n').trim();
    const node = $createBlockMathNode(tex);
    // `parentNode` is either the editor's RootNode (during import) or a
    // matched paragraph. RootNode forbids `.replace()` (Lexical error #53),
    // so we append. For paragraph parents this still works because the
    // paragraph will be cleaned up by the markdown import pipeline.
    if (parentNode.getType && parentNode.getType() === 'root') {
      parentNode.append(node);
    } else if (typeof parentNode.replace === 'function') {
      parentNode.replace(node);
    } else {
      parentNode.append(node);
    }
    return true;
  },
  export: (node: unknown): string | null => {
    if (!$isBlockMathNode(node)) return null;
    const tex = node.getTeX();
    return `$$\n${tex}\n$$`;
  },
};

// Single-line `$$ … $$` fallback for older transformer engines.
const SINGLE_LINE_BLOCK_RE = /\$\$([^$\n]+?)\$\$/;
const SINGLE_LINE_BLOCK_RE_END = /\$\$([^$\n]+?)\$\$$/;

export const BLOCK_MATH_TRANSFORMER_INLINE = {
  dependencies: [BlockMathNode],
  type: 'text-match' as const,
  trigger: '$',
  importRegExp: SINGLE_LINE_BLOCK_RE,
  regExp: SINGLE_LINE_BLOCK_RE_END,
  replace: (textNode: any, match: RegExpMatchArray) => {
    const tex = match[1].trim();
    textNode.replace($createBlockMathNode(tex));
  },
  export: (node: unknown): string | null => {
    if (!$isBlockMathNode(node)) return null;
    return `$$${node.getTeX().replace(/\n+/g, ' ')}$$`;
  },
};
