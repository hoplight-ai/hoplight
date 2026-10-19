'use client';

import type { CSSProperties } from 'react';
import { COPY } from '@/lib/undo/copy';
import type { FieldBlock } from '@/lib/undo/field';
import type { IssueKey } from '@/lib/undo/issues';
import type { SlimRow } from '@/lib/undo/sections';

// The signature field: the page's one picture. One square per pen item, packed into one block per
// Forward Order. A signed square is gold. With an issue picked, squares that do not carry it fade.
// Each block is a button that opens its order. Divs only: no chart library, no SVG.
export default function SignatureField({
  blocks,
  rowById,
  signed,
  issue,
  onPick,
}: {
  blocks: FieldBlock[];
  rowById: ReadonlyMap<string, SlimRow>;
  signed: ReadonlySet<string>;
  issue: IssueKey | null;
  onPick: (id: string) => void;
}) {
  if (blocks.length === 0) return null;
  return (
    <div className="undo-field" role="group" aria-label={COPY.field.label}>
      {blocks.map((b) => {
        const done = b.ids.filter((id) => signed.has(id)).length;
        const all = done === b.ids.length;
        const hit = issue === null ? b.ids.length : b.ids.filter((id) => rowById.get(id)?.issues?.includes(issue)).length;
        return (
          <button
            key={b.id}
            type="button"
            className={`undo-block${all ? ' is-signed' : ''}${issue !== null && hit === 0 ? ' is-off' : ''}`}
            style={{ '--cols': b.cols } as CSSProperties}
            aria-label={COPY.field.block(b.n, b.title, b.ids.length, done)}
            onClick={() => onPick(b.id)}
          >
            <span className="undo-cells" aria-hidden="true">
              {b.ids.map((id, i) => {
                const row = rowById.get(id);
                const on = signed.has(id);
                const off = issue !== null && !row?.issues?.includes(issue);
                return (
                  <span
                    key={id}
                    className={`undo-cell${on ? ' is-on' : ''}${off ? ' is-off' : ''}`}
                    style={{ transitionDelay: `${Math.min(i, 48) * 10}ms` }}
                    title={row?.title}
                  />
                );
              })}
            </span>
            <span className="undo-block-n" aria-hidden="true">
              {b.n > 0 ? String(b.n).padStart(2, '0') : '+'}
              <span className="undo-block-count">
                {done > 0 ? `${done}/${b.ids.length}` : b.ids.length}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
