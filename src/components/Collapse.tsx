'use client';
import { useId, useState, type ReactNode } from 'react';

function Chevron() {
  return (
    <svg className="chev-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Collapse({
  title,
  children,
  defaultOpen = false,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  return (
    <div className="collapse-item">
      <button
        type="button"
        className="collapse-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="chev"><Chevron /></span>
        <span className="ctitle">{title}</span>
      </button>
      <div id={panelId} className="collapse-panel" hidden={!open}>
        <div className="collapse-panel-inner">{children}</div>
      </div>
    </div>
  );
}
