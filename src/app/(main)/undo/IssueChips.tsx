import { ISSUE_BY_KEY } from '@/lib/undo/issues';
import type { IssueKey } from '@/lib/undo/issues';
import { COPY } from '@/lib/undo/copy';

// The small mono labels that say which issues a row, or an order, touches. Text only, one thin
// border, no color per issue.
export default function IssueChips({ keys, className }: { keys?: IssueKey[]; className?: string }) {
  if (!keys || keys.length === 0) return null;
  return (
    <p className={`undo-issues${className ? ` ${className}` : ''}`}>
      <span className="sr-only">{COPY.issues.chipsLabel}</span>
      {keys.map((k) => (
        <span key={k} className="undo-chip">
          {ISSUE_BY_KEY[k]?.label ?? k}
        </span>
      ))}
    </p>
  );
}
