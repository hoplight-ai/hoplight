import type { Metadata } from 'next';
import { Suspense } from 'react';
import IntakeForm from '@/components/IntakeForm';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Bring the thing your team hates doing. A short intake is the fastest way to see whether Hoplight is a fit. No deck required.',
  path: '/contact',
  ogDescription: 'A short intake is the fastest way to see whether Hoplight is a fit.',
});

export default function Contact() {
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <span className="label">Contact</span>
          <h1>Bring the thing your team hates doing. We&rsquo;ll start there.</h1>
          <p>A short intake is the fastest way to see whether Hoplight is a fit. No deck required.</p>
        </div>
      </div>

      <section>
        <div className="wrap">
          {/* The form is a client component. Anyone who sees this fallback (no JavaScript, a slow
              connection, a crawler) still gets a way to write, instead of a bare "Loading…". */}
          <Suspense
            fallback={
              <div className="formwrap" style={{ color: 'var(--stone-deep)' }}>
                The intake form is loading. If it does not appear, email{' '}
                <a href="mailto:whit@hoplight.ai">whit@hoplight.ai</a> and we will start there.
              </div>
            }
          >
            <IntakeForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
