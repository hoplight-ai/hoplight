'use client';

import { useId, useState } from 'react';
import { sendFeedback } from '@/lib/track';

// The quiet feedback box at the foot of a tool. Whit, 2026-11-07: "before i share them i want a way
// for users to give me feedback." One question, one text box, an optional email, one outlined button
// (never filled, so the tool's own primary action stays the only filled button on the page). The
// note under it is the public promise about logging; `note={false}` where the page already says it.
//
// Left out on purpose: star ratings, thumbs, a category picker, a name field, a floating launcher,
// a modal, a toast, a character counter, any icon.

export const USAGE_NOTE = 'Anonymous usage is logged to make this better. No names, no addresses.';

/**
 * `align="rj"` lines the box up with the Revenge or Justice tool above it, which sits in its own wider
 * column (.rj-wrap), not the site's .wrap (visual review, 2026-11-07).
 */
export default function ToolFeedback({ tool, note = true, align }: { tool: string; note?: boolean; align?: 'rj' }) {
  const id = useId();
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || state === 'sending') return;
    setState('sending');
    const ok = await sendFeedback(tool, message.trim(), contact.trim());
    setState(ok ? 'sent' : 'failed');
    if (ok) {
      setMessage('');
      setContact('');
    }
  }

  return (
    <section className="tool-feedback" data-hoplight-feedback={tool} aria-labelledby={`${id}-h`}>
      <div className={align === 'rj' ? 'tool-feedback-in tool-feedback-rj' : 'wrap tool-feedback-in'}>
        {state === 'sent' ? (
          <p className="tool-feedback-thanks" role="status">
            Sent. Thank you.{' '}
            <button type="button" className="tool-feedback-again" onClick={() => setState('idle')}>
              Send another
            </button>
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <h2 id={`${id}-h`} className="tool-feedback-h">
              <label htmlFor={`${id}-m`}>Tell me what breaks</label>
            </h2>
            <textarea
              id={`${id}-m`}
              className="tool-feedback-text"
              rows={3}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <div className="tool-feedback-row">
              <label className="tool-feedback-contact" htmlFor={`${id}-c`}>
                <span>Email, if you want a reply</span>
                <input
                  id={`${id}-c`}
                  type="email"
                  autoComplete="email"
                  maxLength={200}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </label>
              <button type="submit" className="btn btn-ghost tool-feedback-send" disabled={state === 'sending' || !message.trim()}>
                {state === 'sending' ? 'Sending' : 'Send'}
              </button>
            </div>
            {state === 'failed' && (
              <p className="tool-feedback-err" role="alert">
                That did not send. Try again in a minute.
              </p>
            )}
          </form>
        )}
        {note && <p className="tool-note">{USAGE_NOTE}</p>}
      </div>
    </section>
  );
}
