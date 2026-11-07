// Feedback and anonymous usage for the Hoplight tools, the logic behind POST /api/signal. Whit,
// 2026-11-07: "before i share them i want a way for users to give me feedback and for user actions to
// be logged anonymized. queries and setting etc."
//
// What is kept, per signal: the tool, the action, a few flat settings (props), the feedback text and,
// only if the person typed one, a contact; a visitor hash that changes every day; country and region
// from Vercel's network headers; the page path without its query; the time. What is never kept: the
// IP address (it only salts the hash), the user agent, the query string, cookies. Email addresses and
// phone numbers are cut out of the props and the message before anything leaves this site; the
// contact field is the one place an email may stay, because the person put it there to be answered.
//
// The anonymous hash copies the recipe in ai-election-errors/api/report.js: sha256 of a salt, the
// UTC day and the address, first 16 hex characters. Same visitor, same day, same hash; next day, a new
// one, so nothing links a visitor across days.
//
// Pure functions of their inputs, so node --test can run them (scripts/signal.test.mjs); the route
// file only wires them to the request. Its one import is node:crypto, so the test loads it as written.

import { createHash } from 'node:crypto';

export const ACTION_RE = /^[a-z0-9_.-]{1,64}$/;
const PROP_KEY_RE = /^[a-zA-Z0-9_.-]{1,40}$/;
export const PROPS_MAX = 2048;
export const MESSAGE_MAX = 2000;
export const CONTACT_MAX = 200;
export const BODY_MAX = 8192;

/** The external tools allowed to post here from their own sites. */
export const EXTERNAL_ORIGINS = [
  'https://gut-check-hoplight.vercel.app',
  'https://rumi-rouge.vercel.app',
  'https://letters-ten-eta.vercel.app',
];

export type Props = Record<string, string | number | boolean>;

export interface Signal {
  kind: 'event' | 'feedback';
  tool: string;
  action: string;
  props: Props;
  message: string | null;
  contact: string | null;
  path: string | null;
}

export interface Forwarded extends Signal {
  visitor_hash: string | null;
  country: string | null;
  region: string | null;
  at: string;
}

// ---- scrubbing -------------------------------------------------------------------------------

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}/gi;
// North American numbers in their usual shapes, and any "+" international number of 8 to 15 digits.
const PHONE_NA_RE = /(?<![\w+])(?:\+?1[\s.-]?)?(?:\(\d{3}\)\s?|\d{3}[\s.-]?)\d{3}[\s.-]?\d{4}(?!\w)/g;
const PHONE_INTL_RE = /\+\d{1,3}(?:[\s.-]?\(?\d{1,4}\)?){2,5}(?!\w)/g;

/** Replaces email addresses with [email] and phone numbers with [phone]. */
export function scrub(text: string): string {
  return text
    .replace(EMAIL_RE, '[email]')
    .replace(PHONE_INTL_RE, (m) => (m.replace(/\D/g, '').length >= 8 ? '[phone]' : m))
    .replace(PHONE_NA_RE, '[phone]');
}

// ---- validation ------------------------------------------------------------------------------

type Parsed = { ok: true; signal: Signal } | { ok: false; error: string };

function cleanPath(v: unknown): string | null {
  if (typeof v !== 'string' || !v.startsWith('/')) return null;
  const bare = v.split(/[?#]/)[0].slice(0, 200);
  return /^\/[\w\-./~%]*$/.test(bare) ? bare : null;
}

/** Checks a signal's shape and cleans it. `tools` is the set of tool slugs the site knows. */
export function parseSignal(body: unknown, tools: ReadonlySet<string>): Parsed {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'expected a JSON object' };
  const b = body as Record<string, unknown>;
  const kind = b.kind;
  if (kind !== 'event' && kind !== 'feedback') return { ok: false, error: 'kind must be event or feedback' };
  if (typeof b.tool !== 'string' || !tools.has(b.tool)) return { ok: false, error: 'unknown tool' };
  const action = b.action === undefined && kind === 'feedback' ? 'feedback' : b.action;
  if (typeof action !== 'string' || !ACTION_RE.test(action)) return { ok: false, error: 'action must be 1 to 64 of a-z 0-9 _ . -' };

  const props: Props = {};
  if (b.props !== undefined && b.props !== null) {
    if (typeof b.props !== 'object' || Array.isArray(b.props)) return { ok: false, error: 'props must be a flat object' };
    for (const [k, v] of Object.entries(b.props as Record<string, unknown>)) {
      if (!PROP_KEY_RE.test(k)) return { ok: false, error: `bad prop name ${k.slice(0, 40)}` };
      if (typeof v === 'string') props[k] = scrub(v);
      else if (typeof v === 'boolean') props[k] = v;
      else if (typeof v === 'number' && Number.isFinite(v)) props[k] = v;
      else return { ok: false, error: `prop ${k} must be a string, number or boolean` };
    }
    if (JSON.stringify(props).length > PROPS_MAX) return { ok: false, error: 'props over 2KB' };
  }

  let message: string | null = null;
  let contact: string | null = null;
  if (kind === 'feedback') {
    if (typeof b.message !== 'string' || !b.message.trim()) return { ok: false, error: 'feedback needs a message' };
    if (b.message.length > MESSAGE_MAX) return { ok: false, error: 'message over 2000 characters' };
    message = scrub(b.message.trim());
    if (b.contact !== undefined && b.contact !== null && b.contact !== '') {
      if (typeof b.contact !== 'string' || b.contact.length > CONTACT_MAX) return { ok: false, error: 'contact over 200 characters' };
      contact = b.contact.trim() || null;
    }
  } else if (b.message !== undefined || b.contact !== undefined) {
    return { ok: false, error: 'message and contact belong to feedback' };
  }

  return { ok: true, signal: { kind, tool: b.tool, action, props, message, contact, path: cleanPath(b.path) } };
}

// ---- the anonymous visitor -------------------------------------------------------------------

/** sha256(salt + UTC day + address), first 16 hex; null with no address. The address is not kept. */
export function visitorHash(ip: string, salt: string, now: Date): string | null {
  if (!ip || ip === 'unknown') return null;
  return createHash('sha256').update(salt + now.toISOString().slice(0, 10) + ip).digest('hex').slice(0, 16);
}

// ---- origins ---------------------------------------------------------------------------------

/**
 * Whether a request may post: no Origin header (not a browser page), this site's own origin, or one
 * of the external tools. Returns the origin to echo in CORS headers for an external tool, else null.
 */
export function originPolicy(origin: string | null, host: string | null): { allowed: boolean; cors: string | null } {
  if (!origin) return { allowed: true, cors: null };
  if (EXTERNAL_ORIGINS.includes(origin)) return { allowed: true, cors: origin };
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) return { allowed: true, cors: null };
  return { allowed: false, cors: null };
}

export function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return { Vary: 'Origin' };
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function refererPath(ref: string | null): string | null {
  if (!ref) return null;
  try {
    return cleanPath(new URL(ref).pathname);
  } catch {
    return null;
  }
}

// ---- the whole request, minus the network ----------------------------------------------------

export interface HandleInput {
  bodyText: string;
  header: (name: string) => string | null;
  tools: ReadonlySet<string>;
  salt: string;
  now: Date;
  /** Returns false when this visitor is over the limit for this kind. */
  allow: (kind: Signal['kind'], key: string) => boolean;
}

export interface HandleResult {
  status: number;
  body: Record<string, unknown>;
  cors: string | null;
  forward: Forwarded | null;
}

export function handleSignal(input: HandleInput): HandleResult {
  const { allowed, cors } = originPolicy(input.header('origin'), input.header('host'));
  if (!allowed) return { status: 403, body: { error: 'origin not allowed' }, cors: null, forward: null };
  if (input.bodyText.length > BODY_MAX) return { status: 413, body: { error: 'too large' }, cors, forward: null };
  let json: unknown;
  try {
    json = JSON.parse(input.bodyText);
  } catch {
    return { status: 400, body: { error: 'bad JSON' }, cors, forward: null };
  }
  const parsed = parseSignal(json, input.tools);
  if (!parsed.ok) return { status: 400, body: { error: parsed.error }, cors, forward: null };

  const ip = (input.header('x-forwarded-for') ?? '').split(',')[0].trim();
  const hash = visitorHash(ip, input.salt, input.now);
  if (!input.allow(parsed.signal.kind, hash ?? 'unknown')) return { status: 429, body: { error: 'slow down' }, cors, forward: null };

  return {
    status: 202,
    body: { ok: true },
    cors,
    forward: {
      ...parsed.signal,
      path: parsed.signal.path ?? refererPath(input.header('referer')),
      visitor_hash: hash,
      country: input.header('x-vercel-ip-country'),
      region: input.header('x-vercel-ip-country-region'),
      at: input.now.toISOString(),
    },
  };
}
