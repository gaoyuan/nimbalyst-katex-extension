// Thin wrapper around the Lexical APIs the host exposes via
// `window.__nimbalyst_extensions.lexical`. We don't ship `lexical` as a
// dependency - we borrow the host's instance so node classes register
// correctly and the markdown transformers cooperate with the host's editor.

declare global {
  interface Window {
    __nimbalyst_extensions?: Record<string, unknown> & {
      lexical?: LexicalAPI;
    };
  }
}

export interface LexicalAPI {
  DecoratorNode: any;
  ElementNode: any;
  TextNode: any;
  $applyNodeReplacement: <T>(node: T) => T;
  $createTextNode: (text: string) => any;
  $createParagraphNode: () => any;
  $getSelection: () => any;
  $isRangeSelection: (selection: unknown) => boolean;
  $insertNodes: (nodes: unknown[]) => void;
  COMMAND_PRIORITY_EDITOR?: number;
  createCommand?: <T>(type?: string) => T;
}

let cached: LexicalAPI | null = null;

export function getLexical(): LexicalAPI {
  if (cached) return cached;
  const api = (typeof window !== 'undefined' && window.__nimbalyst_extensions?.lexical) || null;
  if (!api) {
    throw new Error(
      '[katex-math] Lexical API not available on window.__nimbalyst_extensions.lexical. ' +
        'This extension requires Nimbalyst >= 0.58 with the markdown editor active.'
    );
  }
  cached = api;
  return api;
}

export function tryGetLexical(): LexicalAPI | null {
  try {
    return getLexical();
  } catch {
    return null;
  }
}
