import Arrow from '@/components/Arrow';
import Lock from '@/components/Lock';
import { opensSignIn } from '@/lib/gate';
import { SUBSTACK, type InsightItem } from '@/lib/insights-content';

// The pieces the Insights page is made of: one white card for every item, and the Substack link under the
// Writing heading. A card that lands on the site's sign-in carries a small lock after its title (HOPSITE2,
// 2026-11-07; scripts/insights-lock.test.mjs).
//
// PORTSPLIT1 round five, 2026-11-07 (design review: "one Research section with one treatment"): the ruled
// Reports rows went. A report with a picture draws it on top of the same card; the picture is the tool's own
// preview card without the Hoplight band, the one its portfolio tile used, and it carries the name, so the
// title under it is for screen readers only, as on /portfolio.

function linkProps(item: InsightItem) {
  return item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

function OpensNewTab({ item }: { item: InsightItem }) {
  return item.external ? <span className="sr-only"> (opens in a new tab)</span> : null;
}

/** One white card. The tag carries the source and the date where there is one. */
export function Card({ item, eager = false }: { item: InsightItem; eager?: boolean }) {
  const tag = item.kind === 'Essay' && item.shown ? `${item.line}, ${item.shown}` : item.shown;
  const text = item.kind === 'Essay' ? null : item.line;
  const locked = opensSignIn(item.href);
  if (item.picture) {
    return (
      <a className="ptile ptile-pic" href={item.href} {...linkProps(item)}>
        <div className="ptile-img">
          <img
            src={item.picture}
            alt=""
            width={1200}
            height={630}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
        <div className="ptile-body">
          <h3 className={locked ? undefined : 'sr-only'}>
            {item.title}
            {locked && <Lock />}
          </h3>
          {text && <p>{text}</p>}
        </div>
        <Arrow className="arrow tile-arrow" />
        <OpensNewTab item={item} />
      </a>
    );
  }
  return (
    <a className="ptile" href={item.href} {...linkProps(item)}>
      {tag && <span className="ptile-tag">{tag}</span>}
      <h3>
        {item.title}
        {locked && <Lock />}
      </h3>
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
