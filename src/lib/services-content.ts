// What the three shapes of the Services page say, in one place, so /services, /services-b and /services-c
// draw on the same lines. Whit, 2026-10-21: "mock up 15- i need to see what you mean" (overexplaining is the
// problem), so every line here is cut from an existing line and none is added.
//
// The four step titles were approved by the owner on 2026-07-12 and 2026-07-13 and stand on main's services
// page under "Start with the thing people hate doing every week. Solve that first." The sentence under each
// is main's own, shortened. Step 04 keeps only the first sentence of main's copy.
// The Why and What lines are the owner's stump speech, verbatim.

import { FACTS } from '@/lib/facts';

export const METHOD_H1 = 'Start with the thing people hate doing every week. Solve that first.';

export const STEPS = [
  { title: 'Sentiment and stack audit', text: 'What are people already using, what are they afraid of, and where is the shadow AI.' },
  { title: 'Build for real pain points', text: 'Bespoke beats a generic training on Claude every time.' },
  { title: 'Upskill, don’t just train', text: 'You have an intern with access to everything ever written, who starts fresh every morning unless you build the infrastructure.' },
  { title: 'Stand it up so it’s yours', text: 'We help you build the maintenance muscle in-house.' },
];

export const WHY = [
  'The most revolutionary technology in recent history just landed in our laps, and the billionaire class and CEO response has been AI austerity.',
  'Our orientation to AI needs to be figuring out how to drive AI abundance, such that folks are incentivized to keep their people, to train their people up, to 10x their revenue, not 2x it.',
];

export const WHAT = ['I am incredible at identifying high value, culturally viable applications of AI.', 'Not just the what but the how.'];

export const HOW = `${STEPS.map((s) => s.title).join(', ')}.`;

export const SITE_LINE = 'AI strategy for labor, advocacy, and mission-driven organizations.';

export const CAPABILITIES = [
  {
    title: 'Governance and threat assessment',
    text: `Where AI fits, the guardrails that keep trust, and who already touches your data. Zero compliance incidents across ${FACTS.company.adSpend} in regulated-industry ad spend.`,
  },
  {
    title: 'Capacity building',
    text: 'Conversation-first training. A 10-module AI curriculum, built and delivered.',
  },
  {
    title: 'Custom systems',
    text: 'Systems built to your workflow, made to run after we leave.',
  },
  {
    title: 'AI visibility',
    text: 'How you show up when a language model writes the answer.',
  },
];
