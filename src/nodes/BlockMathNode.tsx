import { useState } from 'react';
import { getLexical } from '../lexical';
import { MathView } from '../components/MathView';
import { MathEditor } from '../components/MathEditor';

const TYPE = 'block-math';

export interface SerializedBlockMathNode {
  type: typeof TYPE;
  version: 1;
  tex: string;
}

const lex = getLexical();

export class BlockMathNode extends lex.DecoratorNode {
  __tex: string;

  static getType() {
    return TYPE;
  }

  static clone(node: BlockMathNode) {
    return new BlockMathNode(node.__tex, node.__key);
  }

  constructor(tex: string, key?: string) {
    super(key);
    this.__tex = tex;
  }

  getTeX(): string {
    return this.__tex;
  }

  setTeX(tex: string): void {
    const writable = this.getWritable() as BlockMathNode;
    writable.__tex = tex;
  }

  isInline(): boolean {
    return false;
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'nim-katex-host nim-katex-host-block';
    div.setAttribute('data-katex-source', this.__tex);
    return div;
  }

  updateDOM(): false {
    return false;
  }

  exportJSON(): SerializedBlockMathNode {
    return { type: TYPE, version: 1, tex: this.__tex };
  }

  static importJSON(serialized: SerializedBlockMathNode): BlockMathNode {
    return $createBlockMathNode(serialized.tex);
  }

  getTextContent(): string {
    return `$$\n${this.__tex}\n$$`;
  }

  decorate() {
    return <BlockMathDecorator nodeKey={this.getKey()} initialTex={this.__tex} />;
  }
}

function BlockMathDecorator({
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
    if (!editor) return;
    editor.update(() => {
      const node = editor.getEditorState()._nodeMap.get(nodeKey) as BlockMathNode | undefined;
      if (node && $isBlockMathNode(node)) {
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
        displayMode={true}
        onCommit={commit}
        onCancel={cancel}
      />
    );
  }

  return (
    <MathView
      tex={tex}
      displayMode={true}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
    />
  );
}

export function $createBlockMathNode(tex: string): BlockMathNode {
  return lex.$applyNodeReplacement(new BlockMathNode(tex));
}

export function $isBlockMathNode(node: unknown): node is BlockMathNode {
  return node instanceof BlockMathNode;
}
