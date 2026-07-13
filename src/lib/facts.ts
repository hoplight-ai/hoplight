// Canonical site facts. Ratified by Whit 2026-07-12/13.
export const FACTS = {
  rct: {
    n: '3,006',
    date: 'August 2025',
    method: 'randomized controlled trial, voter-file matched',
    liftVsBaseline: '26', // points over a no-message baseline — the ONLY lift track for public copy
  },
  engine: { traditions: '22', subscales: '110' },
  agis: { jurisdictions: '2,100+', sources: '31,900+' },
  company: {
    systems: '130+',
    roas: '4x',
    adSpend: '$1M+',
    pilotFailure: '95%', // MIT: enterprise AI pilots with zero return
    compliance: 'zero compliance incidents across $1M+ in regulated-industry ad spend',
  },
  map: { from: '365', to: '226' },
  founder: 'leads AI strategy for one of North America\'s largest unions',
} as const;
