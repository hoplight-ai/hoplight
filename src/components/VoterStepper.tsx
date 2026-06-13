'use client';
import { useState } from 'react';

const ink = '#1C1813';
const gold = '#C8922A';
const stone = '#574F40';

type Voter = {
  n: string;
  col: string;
  tint: string;
  psych: [string, string][];
  motivator: string;
};

const voters: Voter[] = [
  {
    n: 'Voter A',
    col: '#B84A3E',
    tint: 'rgba(184,74,62,0.10)',
    psych: [
      ['Worldview', 'Order and tradition keep life stable'],
      ['Values', 'Family, faith, duty'],
      ['Trusts', 'People close to home'],
      ['Reads as threat', 'Disorder and disrespect'],
      ['Sense of control', 'High at home, low over the country'],
    ],
    motivator: 'Speak to security and respect. Lead with what stays steady, not with statistics.',
  },
  {
    n: 'Voter B',
    col: '#4A6FA5',
    tint: 'rgba(74,111,165,0.10)',
    psych: [
      ['Worldview', 'The system is rigged and needs fixing'],
      ['Values', 'Fairness, dignity, a fair shot'],
      ['Trusts', 'Lived experience over institutions'],
      ['Reads as threat', 'Being used and left behind'],
      ['Sense of control', 'Low, and tired of being told otherwise'],
    ],
    motivator: 'Name the rigging and show who is accountable. Skip the both-sides framing.',
  },
  {
    n: 'Voter C',
    col: '#7A6E55',
    tint: 'rgba(122,110,85,0.14)',
    psych: [
      ['Worldview', 'Politics is noise that rarely pays off'],
      ['Values', 'Stability, family, getting by'],
      ['Trusts', 'What they can see working'],
      ['Reads as threat', 'One more broken promise'],
      ['Sense of control', 'Stretched thin, eyes on the bills'],
    ],
    motivator: 'Show one concrete change they will actually feel. Abstractions lose them.',
  },
];

const demo: [string, string][] = [
  ['Age', '42'], ['Race', 'White'], ['Gender', 'Male'],
  ['Income', '$72K'], ['Education', 'Some college'], ['Location', 'Suburban OH'],
];

const steps = [
  { k: 'Step 1 of 3 · Same demographics', h: 'On paper, these are the same voter.', psych: false, motivator: false },
  { k: 'Step 2 of 3 · Different psychographics', h: 'But they make sense of the world three different ways.', psych: true, motivator: false },
  { k: 'Step 3 of 3 · Different motivators', h: 'So each one needs a different thing to move. One message cannot reach all three.', psych: true, motivator: true },
];

export default function VoterStepper() {
  const [step, setStep] = useState(0);
  const s = steps[step];
  const focusRing = { outline: 'none' };

  return (
    <div style={{ background: 'var(--paper)', borderRadius: 6, padding: '2rem 1.75rem', border: '1px solid rgba(28,24,19,0.14)' }}>
      <div
        style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#845810', marginBottom: 10 }}
        aria-live="polite"
      >
        {s.k}
      </div>
      <div style={{ fontSize: 'clamp(1.1rem, 1rem + 0.5vw, 1.35rem)', fontWeight: 500, color: ink, lineHeight: 1.25, maxWidth: '42ch', marginBottom: '1.5rem' }}>
        {s.h}
      </div>
      <div className="voter-stepper-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: '1.25rem', alignItems: 'start' }}>
        {voters.map((v) => (
          <div key={v.n} style={{ background: '#fff', border: `1px solid ${s.psych ? v.col : 'rgba(87,79,64,0.3)'}`, borderRadius: 6, padding: '18px 16px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: s.psych ? v.tint : 'rgba(87,79,64,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 14, color: s.psych ? v.col : stone, marginBottom: 12 }}>JM</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: ink, marginBottom: 10 }}>{v.n}</div>
            {demo.map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', fontSize: 13 }}>
                <span style={{ color: stone }}>{label}</span>
                <span style={{ color: ink, fontWeight: 500, textAlign: 'right' }}>{val}</span>
              </div>
            ))}
            {s.psych && (
              <div style={{ borderTop: `1px solid ${v.tint}`, marginTop: 14, paddingTop: 12 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: v.col, marginBottom: 8 }}>Psychographic profile</div>
                {v.psych.map(([label, val]) => (
                  <div key={label} style={{ marginBottom: 9 }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: stone, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, color: ink, lineHeight: 1.3 }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
            {s.motivator && (
              <div style={{ marginTop: 12, background: v.tint, borderRadius: 6, padding: '12px 12px' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: v.col, fontWeight: 500, marginBottom: 4 }}>What moves them</div>
                <div style={{ fontSize: 13, color: ink, lineHeight: 1.35 }}>{v.motivator}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <button
          className="stepper-btn"
          onClick={() => step > 0 && setStep(step - 1)}
          disabled={step === 0}
          aria-label="Previous step"
          style={{ ...focusRing, background: 'transparent', color: ink, border: '1px solid rgba(28,24,19,0.4)', borderRadius: 3, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: step === 0 ? 'default' : 'pointer', opacity: step === 0 ? 0.35 : 1 }}
        >
          Back
        </button>
        <div style={{ display: 'flex', gap: 7 }} aria-hidden="true">
          {steps.map((_, j) => (
            <span key={j} style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: j === step ? gold : 'rgba(87,79,64,0.35)' }} />
          ))}
        </div>
        <button
          className="stepper-btn"
          onClick={() => setStep(step === steps.length - 1 ? 0 : step + 1)}
          aria-label={step === steps.length - 1 ? 'Start over' : 'Next step'}
          style={{ ...focusRing, background: ink, color: '#F4F0E7', border: 'none', borderRadius: 3, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
        >
          {step === steps.length - 1 ? 'Start over' : 'Next'}
        </button>
      </div>
    </div>
  );
}
