// Canonical site facts. Ratified by Whit 2026-07-12/13.
export const FACTS = {
  rct: {
    n: '3,006',
    date: 'August 2025',
    // CORRECTED 2026-08-21. This read 'randomized controlled trial, voter-file matched', which
    // describes a stronger and more expensive design than the one that was run. The study's own
    // Methodology section on /research is the reference and says: "3,006 US adults (weighted to
    // 3,004), fielded August 19-20, 2025. 60.9% voter-file match rate." That is a GENERAL ADULT
    // SAMPLE with a match-rate statistic attached. "Voter-file-matched RCT" reads as "we drew the
    // sample from the voter file", which is the kind of claim a sophisticated buyer checks.
    // The match rate is a good fact. It is just a different sentence, so it lives in its own field.
    method: 'randomized controlled trial',
    matchRate: '60.9%', // share of the sample matched to a voter file — sample quality, NOT design
    liftVsBaseline: '26', // points over a no-message baseline — the ONLY lift track for public copy
  },
  // REMOVED 2026-08-30 (lane site1). This held the measurement-tradition and subscale counts, which
  // the site's own wording rule in scripts/verify.sh forbids putting in public copy. Nothing in src/
  // read this entry, so it was a disclosure with no consumer. The counts stay out of the repo.
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
