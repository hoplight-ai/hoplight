// A drawn arrow for tiles and rows that open somewhere. Decorative: the tile's own title names the
// destination, so it carries no words and a screen reader skips it.
export default function Arrow({ className = 'arrow' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
