'use client';
import { useState } from 'react';

const ink = '#1C1813';
const gold = '#C8922A';
const stone = '#6B6457';

const voters = [
  { n: 'Voter A', col: '#B84A3E', tint: 'rgba(184,74,62,0.10)', badge: 'Reliable R voter', traits: [82, 76, 85, 71, 28] },
  { n: 'Voter B', col: '#4A6FA5', tint: 'rgba(74,111,165,0.10)', badge: 'Reliable D voter', traits: [31, 38, 29, 25, 79] },
  { n: 'Voter C', col: '#6B6457', tint: 'rgba(107,100,87,0.14)', badge: 'Sat out 2024', traits: [45, 62, 41, 58, 52] },
];

const demo = [
  ['Age', '42'], ['Race', 'White'], ['Gender', 'Male'],
  ['Income', '$72K'], ['Education', 'Some college'], ['Location', 'Suburban OH'],
];

const traitNames = [
  'Authority deference', 'Uncertainty avoidance', 'Need for closure',
  'System justification', 'Openness to experience',
];

const steps = [
  { k: 'Step 1 of 3 · The demographic profile', h: 'Demographically, these are the same voter.', badge: false, traits: false },
  { k: 'Step 2 of 3 · The behavioral split', h: 'So why do they vote three different ways?', badge: true, traits: false },
  { k: 'Step 3 of 3 · The psychographic explanation', h: 'Because they process the world three different ways.', badge: true, traits: true },
];

export default function VoterStepper() {
  const [step, setStep] = useState(0);
  const s = steps[step];
  return (
    <div style={{ background: 'var(--paper, #F4F0E7)', borderRadius: 6, padding: '2rem 1.75rem', border: '1px solid rgba(28,24,19,0.14)' }}>
      <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-deep, #946514)', marginBottom: 10 }}>
        {s.k}
      </div>
      <div style={{ fontSize: 'clamp(1.1rem, 1rem + 0.5vw, 1.35rem)', fontWeight: 500, color: ink, lineHeight: 1.25, maxWidth: '38ch', marginBottom: '1.5rem' }}>
        {s.h}
      </div>
      <div className="voter-stepper-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: '1.25rem', alignItems: 'start' }}>
        {voters.map((v) => (
          <div key={v.n} style={{ background: '#fff', border: `1px solid ${s.badge ? v.col : 'rgba(107,100,87,0.3)'}`, borderRadius: 6, padding: '18px 16px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: s.badge ? v.tint : 'rgba(107,100,87,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 14, color: s.badge ? v.col : stone, marginBottom: 12 }}>JM</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: ink, marginBottom: 10 }}>{v.n}</div>
            {demo.map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', fontSize: 13 }}>
                <span style={{ color: stone }}>{label}</span>
                <span style={{ color: ink, fontWeight: 500, textAlign: 'right' }}>{val}</span>
              </div>
            ))}
            {s.badge && (
              <div style={{ marginTop: 10 }}>
                <span style={{ background: v.tint, color: v.col, fontSize: 12.5, fontWeight: 500, padding: '5px 12px', borderRadius: 14, display: 'inline-block' }}>{v.badge}</span>
              </div>
            )}
            {s.traits && (
              <div style={{ borderTop: '1px solid rgba(107,100,87,0.2)', marginTop: 14, paddingTop: 12 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: ink, marginBottom: 8 }}>Psychographic profile</div>
                {v.traits.map((t, i) => (
                  <div key={traitNames[i]} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: ink }}>{traitNames[i]}</span>
                      <span style={{ color: ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{t}</span>
                    </div>
                    <div style={{ background: 'rgba(28,24,19,0.06)', borderRadius: 2, height: 5 }}>
                      <div style={{ width: `${t}%`, height: 5, background: v.col, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0} style={{ background: 'transparent', color: ink, border: `1px solid rgba(28,24,19,0.4)`, borderRadius: 3, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: step === 0 ? 'default' : 'pointer', opacity: step === 0 ? 0.35 : 1 }}>Back</button>
        <div style={{ display: 'flex', gap: 7 }}>
          {steps.map((_, j) => (
            <span key={j} style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: j === step ? gold : 'rgba(107,100,87,0.35)' }} />
          ))}
        </div>
        <button onClick={() => setStep(step === steps.length - 1 ? 0 : step + 1)} style={{ background: ink, color: 'var(--paper, #F4F0E7)', border: 'none', borderRadius: 3, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          {step === steps.length - 1 ? 'Start over' : 'Next'}
        </button>
      </div>
    </div>
  );
}
