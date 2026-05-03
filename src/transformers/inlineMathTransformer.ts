import {
  InlineMathNode,
  $createInlineMathNode,
  $isInlineMathNode,
} from '../nodes/InlineMathNode';

// Matches `$...$` but not `$$...$$` (we lookbehind on `$`).
// - No newlines inside the math
// - No empty `$$` (requires at least one non-`$` char)
// - Avoids matching prices like "$5" by requiring a non-space, non-digit
//   first char and a closing `$` not followed by another `$`.
const INLINE_MATH_RE = /(?<!\$)\$([^\s$][^$\n]*?[^\s$]|[^\s$])\$(?!\$)/;
const INLINE_MATH_RE_END = /(?<!\$)\$([^\s$][^$\n]*?[^\s$]|[^\s$])\$$/;

export const INLINE_MATH_TRANSFORMER = {
  dependencies: [InlineMathNode],
  type: 'text-match' as const,
  trigger: '$',
  importRegExp: INLINE_MATH_RE,
  regExp: INLINE_MATH_RE_END,
  replace: (textNode: any, match: RegExpMatchArray) => {
    const tex = match[1];
    const node = $createInlineMathNode(tex);
    textNode.replace(node);
  },
  export: (node: unknown): string | null => {
    if (!$isInlineMathNode(node)) return null;
    return `$${node.getTeX()}$`;
  },
};
