import { getLexical } from './lexical';
import { $createInlineMathNode } from './nodes/InlineMathNode';
import { $createBlockMathNode } from './nodes/BlockMathNode';

function getActiveEditor(): any | null {
  const editor = (window as unknown as {
    __nimbalyst_extensions?: { lexicalEditor?: any };
  }).__nimbalyst_extensions?.lexicalEditor;
  return editor ?? null;
}

function insertNode(create: () => any) {
  const editor = getActiveEditor();
  if (!editor) {
    console.warn('[katex-math] No active Lexical editor; cannot insert math node.');
    return;
  }
  const lex = getLexical();
  editor.update(() => {
    const selection = lex.$getSelection();
    if (!selection || !lex.$isRangeSelection(selection)) {
      return;
    }
    const node = create();
    lex.$insertNodes([node]);
  });
}

export function handleInsertInlineMath() {
  insertNode(() => $createInlineMathNode(''));
}

export function handleInsertBlockMath() {
  insertNode(() => $createBlockMathNode(''));
}
