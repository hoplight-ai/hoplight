'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// TODO(whit): split 30/15 links — provide the 30-min and 15-min Calendly links.
const CALENDLY_30 = 'https://calendly.com/whitpendergast';
const CALENDLY_15 = 'https://calendly.com/whitpendergast';

type Branch = 'client' | 'talent';

const FIT = ['Trainer', 'Facilitator', 'Builder', 'Other'] as const;
const BUDGET = ['Yes, allocated', 'Actively scoping it', 'Not yet, exploring'] as const;

function Err({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <div className="err" id={id} role="alert">
      {msg}
    </div>
  );
}

export default function IntakeForm() {
  const params = useSearchParams();
  const initialBranch: Branch | null = params.get('path') === 'talent' ? 'talent' : null;

  const [branch, setBranch] = useState<Branch | null>(initialBranch);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [result, setResult] = useState<{ branch: Branch; budget?: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // identity
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState('');

  // client
  const [cToday, setCToday] = useState('');
  const [cSixMonths, setCSixMonths] = useState('');
  const [cBudget, setCBudget] = useState('');
  const [cHate, setCHate] = useState('');

  // talent
  const [fit, setFit] = useState<string[]>([]);
  const [fitOther, setFitOther] = useState('');
  const [tWhy, setTWhy] = useState('');
  const [tTeach, setTTeach] = useState('');
  const [tShipped, setTShipped] = useState('');
  const [tSkillBuilder, setTSkillBuilder] = useState('');
  const [tSkillTrainer, setTSkillTrainer] = useState('');
  const [tAvail, setTAvail] = useState('');
  const [tLocation, setTLocation] = useState('');
  const [tLink, setTLink] = useState('');
  const [tWork, setTWork] = useState('');

  const toggleFit = (f: string) =>
    setFit((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  const isTrainer = fit.includes('Trainer') || fit.includes('Facilitator');
  const isBuilder = fit.includes('Builder');

  function validateIdentity() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'Please enter your first name.';
    if (!lastName.trim()) e.lastName = 'Please enter your last name.';
    if (!email.trim()) e.email = 'Please enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Please enter a valid email.';
    if (!org.trim()) e.org = 'Please enter your organization.';
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!branch) return;
    const eMap = validateIdentity();
    if (branch === 'client') {
      if (!cBudget) eMap.cBudget = 'Please choose one.';
    } else {
      if (fit.length === 0) eMap.fit = 'Please select at least one.';
    }
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) return;

    const fields: Record<string, string | string[]> = {
      'First name': firstName.trim(),
      'Last name': lastName.trim(),
      Email: email.trim(),
      Organization: org.trim(),
    };

    if (branch === 'client') {
      fields['Where they are with AI today'] = cToday.trim();
      fields['Where they want to be in six months'] = cSixMonths.trim();
      fields['Budget'] = cBudget;
      fields['The thing the team hates doing'] = cHate.trim();
    } else {
      fields['Fit'] = fitOther && fit.includes('Other') ? [...fit, `Other: ${fitOther.trim()}`] : fit;
      fields['Why this work, why values-aligned'] = tWhy.trim();
      if (isTrainer) fields['What they teach now, and to whom'] = tTeach.trim();
      if (isBuilder) fields['What they have shipped'] = tShipped.trim();
      if (isBuilder) fields['Skill check (builder)'] = tSkillBuilder.trim();
      if (isTrainer) fields['Skill check (trainer/facilitator)'] = tSkillTrainer.trim();
      fields['Availability'] = tAvail.trim();
      fields['Location and timezone'] = tLocation.trim();
      fields['LinkedIn or portfolio'] = tLink.trim();
      fields['What they want to work on'] = tWork.trim();
    }

    setStatus('submitting');
    try {
      await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch, fields }),
      });
    } catch {
      // The form never breaks for the user; we still confirm receipt.
    }
    setResult({ branch, budget: cBudget });
    setStatus('done');
  }

  // ---- Success ----
  if (status === 'done' && result) {
    if (result.branch === 'client') {
      const fast = result.budget === 'Yes, allocated' || result.budget === 'Actively scoping it';
      const link = fast ? CALENDLY_30 : CALENDLY_15;
      const length = fast ? '30-minute' : '15-minute';
      return (
        <div className="success">
          <h2>Got it. Let&apos;s find a time.</h2>
          <p>Thanks, {firstName || 'there'}. Your intake is in. The fastest next step is a {length} call to scope the fit.</p>
          <div className="cta-row" style={{ marginTop: '24px' }}>
            <a className="btn btn-primary" href={link} target="_blank" rel="noopener noreferrer">Book your {length} call</a>
          </div>
        </div>
      );
    }
    return (
      <div className="success">
        <h2>Thanks for reaching out.</h2>
        <p>We read every one of these. If there&apos;s a fit, you&apos;ll hear from us directly at {email}.</p>
      </div>
    );
  }

  // ---- Gate ----
  if (!branch) {
    return (
      <div className="formwrap">
        <p style={{ color: 'var(--ink-soft)', fontSize: '1.1rem', marginBottom: '20px' }}>
          Are you here to bring Hoplight into your organization, or to work with Hoplight?
        </p>
        <div className="gate" role="group" aria-label="What brings you here">
          <button type="button" className="gate-btn" aria-pressed={false} onClick={() => setBranch('client')}>
            <span className="gt">Hire Hoplight</span>
            <span className="gd">Bring AI strategy, governance, or a build into your organization.</span>
          </button>
          <button type="button" className="gate-btn" aria-pressed={false} onClick={() => setBranch('talent')}>
            <span className="gt">Work with Hoplight</span>
            <span className="gd">Join the bench as a trainer, facilitator, or builder.</span>
          </button>
        </div>
      </div>
    );
  }

  // ---- Form ----
  return (
    <form className="formwrap" onSubmit={submit} noValidate>
      <button type="button" className="form-back" onClick={() => { setBranch(null); setErrors({}); }}>
        &larr; Change answer
      </button>

      <p style={{ color: 'var(--ink-soft)', fontSize: '1.05rem', marginBottom: '28px' }}>
        {branch === 'client'
          ? 'Bringing Hoplight into your organization. A few questions and we’ll take it from there.'
          : 'Working with Hoplight. Show us what you can do, not just what you’d rate yourself.'}
      </p>

      {/* Identity */}
      <div className="form-row">
        <div className="field">
          <label htmlFor="firstName">First name</label>
          <input id="firstName" type="text" autoComplete="given-name" value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-invalid={!!errors.firstName} aria-describedby="firstName-err" />
          <Err id="firstName-err" msg={errors.firstName} />
        </div>
        <div className="field">
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" type="text" autoComplete="family-name" value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            aria-invalid={!!errors.lastName} aria-describedby="lastName-err" />
          <Err id="lastName-err" msg={errors.lastName} />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email} aria-describedby="email-err" />
          <Err id="email-err" msg={errors.email} />
        </div>
        <div className="field">
          <label htmlFor="org">Organization</label>
          <input id="org" type="text" autoComplete="organization" value={org}
            onChange={(e) => setOrg(e.target.value)}
            aria-invalid={!!errors.org} aria-describedby="org-err" />
          <Err id="org-err" msg={errors.org} />
        </div>
      </div>

      {branch === 'client' ? (
        <>
          <div className="field">
            <label htmlFor="cToday">Where is your organization with AI today?</label>
            <textarea id="cToday" value={cToday} onChange={(e) => setCToday(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cSix">Where would you like it to be in six months?</label>
            <textarea id="cSix" value={cSixMonths} onChange={(e) => setCSixMonths(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cBudget">Is there budget allocated for this work?</label>
            <select id="cBudget" value={cBudget} onChange={(e) => setCBudget(e.target.value)}
              aria-invalid={!!errors.cBudget} aria-describedby="cBudget-err">
              <option value="">Select one…</option>
              {BUDGET.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <Err id="cBudget-err" msg={errors.cBudget} />
          </div>
          <div className="field">
            <label htmlFor="cHate">What&apos;s the one thing your team hates doing every week?</label>
            <textarea id="cHate" value={cHate} onChange={(e) => setCHate(e.target.value)} />
          </div>
        </>
      ) : (
        <>
          <div className="field">
            <span className="label" style={{ display: 'block', marginBottom: '10px', textTransform: 'none', letterSpacing: '0', fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 500, color: 'var(--ink)' }}>Which fits you? Select all that apply.</span>
            <div className="checks" role="group" aria-label="Which fits you" aria-describedby="fit-err">
              {FIT.map((f) => (
                <label key={f} className="check">
                  <input type="checkbox" checked={fit.includes(f)} onChange={() => toggleFit(f)} />
                  <span>{f}</span>
                </label>
              ))}
            </div>
            <Err id="fit-err" msg={errors.fit} />
            {fit.includes('Other') && (
              <div className="field" style={{ marginTop: '12px' }}>
                <label htmlFor="fitOther">Please explain</label>
                <input id="fitOther" type="text" value={fitOther} onChange={(e) => setFitOther(e.target.value)} />
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="tWhy">Why this work, and why values-aligned?</label>
            <textarea id="tWhy" value={tWhy} onChange={(e) => setTWhy(e.target.value)} />
          </div>

          {isTrainer && (
            <div className="field">
              <label htmlFor="tTeach">What do you teach now, and to whom? <span className="hint">(it doesn&apos;t have to be AI-related)</span></label>
              <textarea id="tTeach" value={tTeach} onChange={(e) => setTTeach(e.target.value)} />
            </div>
          )}
          {isBuilder && (
            <div className="field">
              <label htmlFor="tShipped">What have you shipped? Link it.</label>
              <textarea id="tShipped" value={tShipped} onChange={(e) => setTShipped(e.target.value)} />
            </div>
          )}

          {(isBuilder || isTrainer) && (
            <div className="field">
              <span className="label" style={{ display: 'block', marginBottom: '10px', textTransform: 'none', letterSpacing: '0', fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 500, color: 'var(--ink)' }}>Show us, don&apos;t tell us.</span>
              {isBuilder && (
                <div className="field">
                  <label htmlFor="tSkillB">Link the most capable thing you&apos;ve built with AI, and name the stack.</label>
                  <textarea id="tSkillB" value={tSkillBuilder} onChange={(e) => setTSkillBuilder(e.target.value)} />
                </div>
              )}
              {isTrainer && (
                <div className="field">
                  <label htmlFor="tSkillT">Describe a session you&apos;ve run and what people could do afterward that they couldn&apos;t before.</label>
                  <textarea id="tSkillT" value={tSkillTrainer} onChange={(e) => setTSkillTrainer(e.target.value)} />
                </div>
              )}
            </div>
          )}

          <div className="field">
            <label htmlFor="tAvail">Availability <span className="hint">(hours, project vs ongoing)</span></label>
            <textarea id="tAvail" value={tAvail} onChange={(e) => setTAvail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="tLoc">Location and timezone</label>
            <input id="tLoc" type="text" value={tLocation} onChange={(e) => setTLocation(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="tLink">LinkedIn or portfolio</label>
            <input id="tLink" type="url" autoComplete="url" value={tLink} onChange={(e) => setTLink(e.target.value)} placeholder="https://" />
          </div>
          <div className="field">
            <label htmlFor="tWork">What would you want to work on?</label>
            <textarea id="tWork" value={tWork} onChange={(e) => setTWork(e.target.value)} />
          </div>
        </>
      )}

      <div className="cta-row" style={{ marginTop: '8px' }}>
        <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Send intake'}
        </button>
      </div>
      <p className="form-note">We read every submission. No spam, no list.</p>
    </form>
  );
}
