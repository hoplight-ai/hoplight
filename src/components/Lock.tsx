// A drawn padlock, in the same hand as Arrow (16 by 16, one stroke in the text colour), on the Insights rows
// that open with the site password (HOPSITE2, 2026-11-07). It is the row's one word on that: a screen reader
// reads "sign-in required" as part of the link, and no sentence is printed.
export default function Lock({ className = 'lock' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" width="14" height="14" role="img" aria-label="sign-in required" focusable="false">
      <rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
