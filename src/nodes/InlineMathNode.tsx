import { useState } from 'react';
import { getLexical } from '../lexical';
import { MathView } from '../components/MathView';
import { MathEditor } from '../components/MathEditor';

const TYPE = 'inline-math';

export interface SerializedInlineMathNode {
  type: typeof TYPE;
  version: 1;
  tex: string;
}

const lex = getLexical();

export class InlineMathNode extends lex.DecoratorNode {
  __tex: string;

  static getType() {
    return TYPE;
  }

  static clone(node: InlineMathNode) {
    return new InlineMathNode(node.__tex, node.__key);
  }

  constructor(tex: string, key?: string) {
    super(key);
    this.__tex = tex;
  }

  getTeX(): string {
    return this.__tex;
  }

  setTeX(tex: string): void {
    const writable = this.getWritable() as InlineMathNode;
    writable.__tex = tex;
  }

  isInline(): boolean {
    return true;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'nim-katex-host nim-katex-host-inline';
    span.setAttribute('data-katex-source', this.__tex);
    return span;
  }

  updateDOM(): false {
    return false;
  }

  exportJSON(): SerializedInlineMathNode {
    return { type: TYPE, version: 1, tex: this.__tex };
  }

  static importJSON(serialized: SerializedInlineMathNode): InlineMathNode {
    return $createInlineMathNode(serialized.tex);
  }

  // Plain-text export keeps the dollar-sign syntax so copy/paste stays
  // round-trippable into other markdown editors.
  getTextContent(): string {
    return `$${this.__tex}$`;
  }

  decorate() {
    return <InlineMathDecorator nodeKey={this.getKey()} initialTex={this.__tex} />;
  }
}

function InlineMathDecorator({
  nodeKey,
  initialTex,
}: {
  nodeKey: string;
  initialTex: string;
}) {
  const [editing, setEditing] = useState(initialTex.trim() === '');
  const [tex, setTex] = useState(initialTex);

  const updateNodeTeX = (next: string) => {
    const editor = (window as unknown as {
      __nimbalyst_extensions?: { lexicalEditor?: any };
    }).__nimbalyst_extensions?.lexicalEditor;
    // The host's active editor is exposed via __nimbalyst_extensions.lexicalEditor
    // (mirrors how datamodellm reaches into the editor for INSERT_DATAMODEL_COMMAND).
    if (!editor) return;
    editor.update(() => {
      const node = editor.getEditorState()._nodeMap.get(nodeKey) as InlineMathNode | undefined;
      if (node && $isInlineMathNode(node)) {
        node.setTeX(next);
      }
    });
  };

  const commit = (next: string) => {
    setTex(next);
    setEditing(false);
    updateNodeTeX(next);
  };

  const cancel = () => {
    if (tex.trim() === '') {
      // Empty + cancel = remove the node
      const editor = (window as unknown as {
        __nimbalyst_extensions?: { lexicalEditor?: any };
      }).__nimbalyst_extensions?.lexicalEditor;
      if (editor) {
        editor.update(() => {
          const node = editor.getEditorState()._nodeMap.get(nodeKey);
          node?.remove();
        });
      }
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <MathEditor
        initialTex={tex}
        displayMode={false}
        onCommit={commit}
        onCancel={cancel}
      />
    );
  }

  return (
    <MathView
      tex={tex}
      displayMode={false}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    />
  );
}

export function $createInlineMathNode(tex: string): InlineMathNode {
  return lex.$applyNodeReplacement(new InlineMathNode(tex));
}

export function $isInlineMathNode(node: unknown): node is InlineMathNode {
  return node instanceof InlineMathNode;
}
