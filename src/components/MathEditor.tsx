import { useEffect, useRef, useState } from 'react';
import { MathView } from './MathView';

interface MathEditorProps {
  initialTex: string;
  displayMode: boolean;
  onCommit: (tex: string) => void;
  onCancel: () => void;
  autoFocus?: boolean;
}

export function MathEditor({
  initialTex,
  displayMode,
  onCommit,
  onCancel,
  autoFocus = true,
}: MathEditorProps) {
  const [tex, setTex] = useState(initialTex);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      try {
        inputRef.current.setSelectionRange(len, len);
      } catch {
        /* some inputs (e.g. number) don't support selection ranges */
      }
    }
  }, [autoFocus]);

  const commit = () => {
    if (tex.trim() === '') {
      onCancel();
    } else {
      onCommit(tex);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }
    if (displayMode) {
      // Block math: Cmd/Ctrl+Enter commits; plain Enter inserts newline.
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        event.stopPropagation();
        commit();
      }
      return;
    }
    // Inline math: Enter commits.
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      commit();
    }
  };

  return (
    <span
      className={`nim-katex-edit ${displayMode ? 'nim-katex-edit-block' : 'nim-katex-edit-inline'}`}
      // Editor input lives inside the Lexical tree as a decorator,
      // so we stop propagation to keep Lexical from stealing focus/keys.
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {displayMode ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          className="nim-katex-edit-textarea"
          value={tex}
          onChange={(e) => setTex(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          rows={Math.max(2, tex.split('\n').length)}
          placeholder="\\sum_{i=1}^{n} i"
          spellCheck={false}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          className="nim-katex-edit-input"
          type="text"
          value={tex}
          onChange={(e) => setTex(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          placeholder="E = mc^2"
          spellCheck={false}
          size={Math.max(8, tex.length + 2)}
        />
      )}
      {tex.trim() && (
        <span className="nim-katex-edit-preview">
          <MathView tex={tex} displayMode={displayMode} />
        </span>
      )}
    </span>
  );
}
