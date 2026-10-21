import Arrow from '@/components/Arrow';
import { SUBSTACK, type InsightItem } from '@/lib/insights-content';

// The pieces the three Insights layouts share (Whit, 2026-10-21: A bands, B one list, C two columns).
// A row or card with no href is a piece that is not published yet: it renders as plain text, no arrow.

function linkProps(item: InsightItem) {
  return item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

function OpensNewTab({ item }: { item: InsightItem }) {
  return item.external ? <span className="sr-only"> (opens in a new tab)</span> : null;
}

function When({ item }: { item: InsightItem }) {
  if (item.forthcoming) return <span className="rep-when">Forthcoming</span>;
  if (item.shown && item.iso) return <time dateTime={item.iso}>{item.shown}</time>;
  return null;
}

/** The second column of a ruled row: the line, then the date. The trial's date shows only in the dated list. */
function RowLine({ item, withDate }: { item: InsightItem; withDate: boolean }) {
  const dated = item.kind === 'Essay' || item.forthcoming;
  const showDate = withDate || dated;
  if (item.kind === 'Essay' && item.iso) {
    return (
      <span className="rep-line">
        {item.line}, <When item={item} />
      </span>
    );
  }
  return (
    <span className="rep-line">
      {item.line}
      {showDate && <> <When item={item} /></>}
    </span>
  );
}

/** One ruled row. `lead` puts the kind and the date in a first column (layout B). */
export function RuledRow({ item, lead = false, withDate = false }: { item: InsightItem; lead?: boolean; withDate?: boolean }) {
  const body = (
    <>
      {lead && (
        <span className="rep-lead">
          <span className="rep-kind">{item.kind}</span>
          <span className="rep-date">
            <When item={item} />
          </span>
        </span>
      )}
      <span className="rep-title">{item.title}</span>
      {lead ? (
        <span className="rep-line">{item.line}</span>
      ) : (
        <RowLine item={item} withDate={withDate} />
      )}
      {item.href ? <Arrow className="arrow rep-arrow" /> : <span className="rep-arrow" aria-hidden="true" />}
      <OpensNewTab item={item} />
    </>
  );
  const cls = lead ? 'rep rep-lead-row' : 'rep';
  return item.href ? (
    <a className={cls} href={item.href} {...linkProps(item)}>
      {body}
    </a>
  ) : (
    <div className={`${cls} rep-still`}>{body}</div>
  );
}

export function RuledList({ items, lead = false, withDate = false }: { items: InsightItem[]; lead?: boolean; withDate?: boolean }) {
  return (
    <ul className="rep-list">
      {items.map((item) => (
        <li key={item.title}>
          <RuledRow item={item} lead={lead} withDate={withDate} />
        </li>
      ))}
    </ul>
  );
}

/** A white card for the navy band (layout C). The tag carries the source and the date where there is one. */
export function Card({ item }: { item: InsightItem }) {
  const tag = item.forthcoming
    ? 'Forthcoming'
    : item.kind === 'Essay' && item.shown
      ? `${item.line}, ${item.shown}`
      : item.shown;
  const text = item.kind === 'Essay' && !item.forthcoming ? null : item.line;
  const body = (
    <>
      {tag && <span className="ptile-tag">{tag}</span>}
      <h3>{item.title}</h3>
      {text && <p>{text}</p>}
      {item.href && <Arrow className="arrow tile-arrow" />}
      <OpensNewTab item={item} />
    </>
  );
  return item.href ? (
    <a className="ptile" href={item.href} {...linkProps(item)}>
      {body}
    </a>
  ) : (
    <div className="ptile ptile-still">{body}</div>
  );
}

/** The Substack itself, under the Writing heading in layouts A and C. */
export function SubstackLink() {
  return (
    <a className="band-link" href={SUBSTACK} target="_blank" rel="noopener noreferrer">
      Whit Pendergast on Substack<span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
