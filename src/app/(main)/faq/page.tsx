import type { Metadata } from 'next';
import Link from 'next/link';
import Collapse from '@/components/Collapse';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Straight answers to the questions mission-driven organizations actually ask before bringing AI into their work: data security, cost, policy, governance vs training, and adoption without layoffs.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — Hoplight',
    description: 'What mission-driven leaders ask before they bring AI near their work.',
    url: 'https://hoplight.ai/faq',
  },
};

const faqs: { q: string; a: string }[] = [
  {
    q: 'How do you protect our data and our members’ information?',
    a: 'We treat your data, and your members’ data, as the whole ballgame. We only build on platform tiers that give you contractual data protection, not just feature promises. Free and consumer-grade tiers can expose your inputs to model training and human review, so we never put member data, strategy documents, or internal communications on them. Before we deploy anything, you get a plain-English breakdown of exactly where your data goes, what the vendor retains, and for how long.',
  },
  {
    q: 'What if we choose the wrong tool, or the wrong direction?',
    a: 'That’s the most common way organizations burn money on AI, and it’s why engagements start with your workflows, not a product list. Tools are the last decision we make, not the first. And because we don’t resell anyone’s software, we have no stake in which platform you land on.',
  },
  {
    q: 'What if our members or staff find out we are using AI?',
    a: 'Poorly, if it’s done to them. Well, if it’s done with them. We build worker-centered: we start by asking your staff what problems they actually have, we train people up rather than around, and nothing we build is designed to surveil or replace the people it serves. That’s a stated design constraint, in writing, at the start of every engagement.',
  },
  {
    q: 'We may not want to adopt AI at all. Can you still help?',
    a: 'Then you’re not ready, and nobody here is going to push you. AI is getting embedded and mandated all around you. Working with us is the opposite of that: you set the pace, you decide what gets adopted and what doesn’t, and “not yet” is a legitimate outcome. If that’s where you land, you’ll leave knowing what being ready would take, and you won’t have bought anything you didn’t choose.',
  },
  {
    q: 'How much does an engagement cost?',
    a: 'Pricing follows the engagement. We scope it after a short intake, so the number fits the work rather than a menu. We work with organizations that have budget allocated to this, on individual consulting through full organizational builds.',
  },
  {
    q: 'What does AI strategy for a union or nonprofit actually involve?',
    a: 'It’s four things working together: governance and policy, a workforce and threat read, hands-on capacity building, and custom builds for the work your team actually does. The point isn’t a tool, it’s adoption that sticks and a posture you can defend.',
  },
  {
    q: 'How should a mission-driven organization start with AI?',
    a: 'Start with the thing your team hates doing every week, and solve that first. The a-ha moment comes when someone asks, wait, if it can do this, can it do that? Everything else follows from there.',
  },
  {
    q: 'Is it safe to use AI tools like ChatGPT with sensitive or member data?',
    a: 'Not by default. Off-the-shelf tools can retain and train on what you paste, so the first move is an access and data policy, then training on what’s safe to share. Done right, you get the upside without exposing your members.',
  },
  {
    q: 'What’s the difference between AI governance and AI training?',
    a: 'Governance is the rules: who can use what, with which data, under what policy. Training is the fluency: teaching your people to actually hold a conversation with these tools. You need both, and most organizations buy one and skip the other.',
  },
  {
    q: 'Do we need an AI policy, and what goes in it?',
    a: 'Yes, every organization touching AI needs one, even those choosing not to adopt. A workable policy covers approved tools, what data can and can’t go in, vendor review, disclosure, and a path for staff to flag shadow AI. We draft it with you.',
  },
  {
    q: 'Can AI help us without replacing our staff?',
    a: 'That’s the entire premise. The visionless move is to cut headcount and call it innovation. The better one is to keep your people, upskill them, and do far more with the team you have. We build for that.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function Faq() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <div className="page-hero">
        <div className="wrap">
          <span className="label">FAQ</span>
          <h1>The questions you&apos;re actually asking.</h1>
          <p>Plain answers to what mission-driven leaders raise before they bring AI anywhere near their work.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="cgroup">
            {faqs.map((f) => (
              <Collapse key={f.q} title={f.q}>
                {f.a}
              </Collapse>
            ))}
          </div>
        </div>
      </section>

      <section className="slate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <hr className="rule" style={{ marginBottom: '36px' }} />
          <p className="lede">Got a question that&apos;s not here?</p>
          <div className="cta-row" style={{ marginTop: '24px' }}>
            <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
