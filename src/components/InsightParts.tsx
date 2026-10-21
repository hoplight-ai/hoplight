import Arrow from '@/components/Arrow';
import { SUBSTACK, type InsightItem } from '@/lib/insights-content';

// The pieces the Insights page is made of: a white card for the navy band, a ruled row for the reports,
// and the Substack link under the Writing heading.

function linkProps(item: InsightItem) {
  return item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

function OpensNewTab({ item }: { item: InsightItem }) {
  return item.external ? <span className="sr-only"> (opens in a new tab)</span> : null;
}

/** One ruled row: the title, the line under it, an arrow. */
export function RuledRow({ item }: { item: InsightItem }) {
  const body = (
    <>
      <span className="rep-title">{item.title}</span>
      <span className="rep-line">{item.line}</span>
      <Arrow className="arrow rep-arrow" />
      <OpensNewTab item={item} />
    </>
  );
  return (
    <a className="rep" href={item.href} {...linkProps(item)}>
      {body}
    </a>
  );
}

export function RuledList({ items }: { items: InsightItem[] }) {
  return (
    <ul className="rep-list">
      {items.map((item) => (
        <li key={item.title}>
          <RuledRow item={item} />
        </li>
      ))}
    </ul>
  );
}

/** A white card for the navy band. The tag carries the source and the date where there is one. */
export function Card({ item }: { item: InsightItem }) {
  const tag = item.kind === 'Essay' && item.shown ? `${item.line}, ${item.shown}` : item.shown;
  const text = item.kind === 'Essay' ? null : item.line;
  return (
    <a className="ptile" href={item.href} {...linkProps(item)}>
      {tag && <span className="ptile-tag">{tag}</span>}
      <h3>{item.title}</h3>
      {text && <p>{text}</p>}
      <Arrow className="arrow tile-arrow" />
      <OpensNewTab item={item} />
    </a>
  );
}

/** The Substack itself, under the Writing heading. */
export function SubstackLink() {
  return (
    <a className="band-link" href={SUBSTACK} target="_blank" rel="noopener noreferrer">
      Whit Pendergast on Substack<span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
