import { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  tex: string;
  displayMode: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

export function MathView({ tex, displayMode, onClick }: MathViewProps) {
  const html = useMemo(() => {
    if (!tex.trim()) return '';
    try {
      return katex.renderToString(tex, {
        displayMode,
        throwOnError: false,
        output: 'html',
        strict: 'ignore',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return `<span class="nim-katex-error">⚠️ ${escapeHtml(message)}</span>`;
    }
  }, [tex, displayMode]);

  const className = `nim-katex ${displayMode ? 'nim-katex-block' : 'nim-katex-inline'}`;
  const placeholder = displayMode ? 'Click to edit math…' : '$…$';

  if (!tex.trim()) {
    return (
      <span className={`${className} nim-katex-empty`} onClick={onClick}>
        {placeholder}
      </span>
    );
  }

  return (
    <span
      className={className}
      onClick={onClick}
      role="button"
      tabIndex={0}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
