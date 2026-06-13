import type { Metadata } from 'next';
import { Suspense } from 'react';
import IntakeForm from '@/components/IntakeForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Bring the thing your team hates doing. A short intake is the fastest way to see whether Hoplight is a fit. No deck required.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact — Hoplight',
    description: 'A short intake is the fastest way to see whether Hoplight is a fit.',
    url: 'https://hoplight.ai/contact',
  },
};

export default function Contact() {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <span className="label">Contact</span>
          <h1>Bring the thing your team hates doing. We&apos;ll start there.</h1>
          <p>A short intake is the fastest way to see whether Hoplight is a fit. No deck required.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          <Suspense fallback={<div className="formwrap" style={{ color: 'var(--stone-deep)' }}>Loading…</div>}>
            <IntakeForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
