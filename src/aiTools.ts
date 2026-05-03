import type { ExtensionAITool } from '@nimbalyst/extension-sdk';
import { getLexical } from './lexical';
import { $createInlineMathNode } from './nodes/InlineMathNode';
import { $createBlockMathNode } from './nodes/BlockMathNode';

const insertEquation: ExtensionAITool = {
  name: 'katex.insert_equation',
  description:
    'Insert a LaTeX math equation into the active Markdown document. ' +
    'Use displayMode=true for centered, larger block equations ($$...$$). ' +
    'Use displayMode=false for inline equations ($...$) that flow with text.',
  inputSchema: {
    type: 'object',
    properties: {
      tex: {
        type: 'string',
        description: 'The LaTeX source of the equation, without surrounding $ or $$ delimiters.',
      },
      displayMode: {
        type: 'boolean',
        description: 'true for block/display math, false for inline math. Defaults to false.',
        default: false,
      },
    },
    required: ['tex'],
  },
  handler: async (params) => {
    const tex = String(params.tex ?? '').trim();
    const displayMode = Boolean(params.displayMode);
    if (!tex) {
      return { success: false, error: 'tex must be a non-empty LaTeX string' };
    }

    const editor = (window as unknown as {
      __nimbalyst_extensions?: { lexicalEditor?: any };
    }).__nimbalyst_extensions?.lexicalEditor;

    if (!editor) {
      return {
        success: false,
        error: 'No active Lexical editor. Open a Markdown document and try again.',
      };
    }

    const lex = getLexical();
    editor.update(() => {
      const selection = lex.$getSelection();
      if (!selection || !lex.$isRangeSelection(selection)) return;
      const node = displayMode ? $createBlockMathNode(tex) : $createInlineMathNode(tex);
      lex.$insertNodes([node]);
    });

    return {
      success: true,
      message: `Inserted ${displayMode ? 'block' : 'inline'} math equation.`,
      data: { tex, displayMode },
    };
  },
};

export const aiTools: ExtensionAITool[] = [insertEquation];
