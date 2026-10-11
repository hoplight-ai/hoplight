'use client';

import { useEffect, useRef, useState } from 'react';

// Copies text to the clipboard and reads "Copied" for two seconds. If both the async clipboard and
// the old textarea route are refused, it does nothing and never claims success.
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function CopyButton({
  text,
  label,
  copiedLabel,
  className,
}: {
  /** What to copy. Left out, it copies this page's own address. */
  text?: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function onClick() {
    const ok = await copyText(text ?? window.location.href.split('#')[0]);
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" className={className} onClick={onClick} aria-live="polite">
      {copied ? copiedLabel : label}
    </button>
  );
}
