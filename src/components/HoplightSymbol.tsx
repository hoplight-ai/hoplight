// H3: Letter construction. H with gold Vesica lens as crossbar.
// Two construction circles behind stems, lens fills as crossbar.
export function HoplightSymbol({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hoplight"
    >
      {/* Two construction circles - very subtle */}
      <circle cx="22" cy="32" r="18" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
      <circle cx="42" cy="32" r="18" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
      {/* Left stem */}
      <rect x="17" y="12" width="7" height="40" rx="1" fill="currentColor" />
      {/* Right stem */}
      <rect x="40" y="12" width="7" height="40" rx="1" fill="currentColor" />
      {/* Gold Vesica lens as crossbar */}
      <ellipse cx="32" cy="32" rx="9" ry="12" fill="#E8A838" />
    </svg>
  )
}
