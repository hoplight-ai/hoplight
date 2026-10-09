import type { Instrument, UndoRow } from './types';
// The explicit .ts extension is deliberate: scripts/undo-classify.test.mjs loads this file with
// Node's native TypeScript support, which does not resolve extensionless relative imports.
import { autoRow } from './classify.ts';

// Live feed for The Undo List (hoplight.ai/undo): presidential documents signed by the second
// Trump administration, from the Federal Register API (no key). Three requests, one per document
// type. The mapper is pure; the fetcher never throws, so a dead feed costs the page its live rows
// and nothing else.

const API = 'https://www.federalregister.gov/api/v1/documents.json';
const SINCE = '2025-01-20';
const FIELDS = [
  'title',
  'executive_order_number',
  'proclamation_number',
  'signing_date',
  'publication_date',
  'citation',
  'document_number',
  'html_url',
  'pdf_url',
  'disposition_notes',
  'subtype',
  'topics',
];
const MAX_PAGES = 10;
const TIMEOUT_MS = 20_000;

type FeedInstrument = Extract<Instrument, 'executive_order' | 'proclamation' | 'memorandum'>;
const FEED_INSTRUMENTS: FeedInstrument[] = ['executive_order', 'proclamation', 'memorandum'];

export function federalRegisterUrl(instrument: FeedInstrument): string {
  const parts = [
    'conditions[president][]=donald-trump',
    'conditions[type][]=PRESDOCU',
    `conditions[presidential_document_type][]=${instrument}`,
    `conditions[signing_date][gte]=${SINCE}`,
    'per_page=1000',
    'order=newest',
    ...FIELDS.map((f) => `fields[]=${f}`),
  ];
  return `${API}?${parts.join('&')}`;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function numberText(v: unknown): string | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return str(v);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// Maps one page of Federal Register JSON to rows placed automatically by instrument type. Anything
// that is not shaped like a result is skipped rather than guessed at.
export function rowsFromFederalRegister(json: unknown, instrument: Instrument): UndoRow[] {
  if (!isRecord(json) || !Array.isArray(json.results)) return [];
  const rows: UndoRow[] = [];
  for (const item of json.results) {
    if (!isRecord(item)) continue;
    const id = str(item.document_number);
    const title = str(item.title);
    const date = str(item.signing_date) ?? str(item.publication_date);
    if (!id || !title || !date) continue;

    let number: string | undefined;
    if (instrument === 'executive_order') {
      const n = numberText(item.executive_order_number);
      if (n) number = `EO ${n}`;
    } else if (instrument === 'proclamation') {
      const n = numberText(item.proclamation_number);
      if (n) number = `Proclamation ${n}`;
    }

    const url = str(item.html_url);
    const topics = Array.isArray(item.topics)
      ? item.topics.filter((t): t is string => typeof t === 'string' && t.length > 0)
      : [];

    rows.push(
      autoRow({
        id,
        title,
        instrument,
        date,
        number,
        topics: topics.length ? topics : undefined,
        disposition: str(item.disposition_notes),
        sources: url ? [{ label: 'Federal Register', url }] : [],
      }),
    );
  }
  return rows;
}

async function fetchInstrument(instrument: FeedInstrument): Promise<UndoRow[]> {
  const rows: UndoRow[] = [];
  let url: string | undefined = federalRegisterUrl(instrument);
  for (let page = 0; url && page < MAX_PAGES; page += 1) {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`${instrument}: HTTP ${res.status}`);
    const json: unknown = await res.json();
    rows.push(...rowsFromFederalRegister(json, instrument));
    url = isRecord(json) ? str(json.next_page_url) : undefined;
  }
  return rows;
}

// Never throws. On any failure the list is empty and ok is false: a half-fetched feed would put
// executive orders on the page without the memoranda beside them and read as complete.
export async function fetchFederalRegisterRows(): Promise<{ rows: UndoRow[]; ok: boolean; error?: string }> {
  try {
    const lists = await Promise.all(FEED_INSTRUMENTS.map((i) => fetchInstrument(i)));
    const seen = new Set<string>();
    const rows: UndoRow[] = [];
    for (const row of lists.flat()) {
      if (seen.has(row.id)) continue;
      seen.add(row.id);
      rows.push(row);
    }
    return { rows, ok: true };
  } catch (err) {
    const cause = err instanceof Error && err.cause instanceof Error ? ` (${err.cause.message})` : '';
    const message = err instanceof Error ? err.message : String(err);
    return { rows: [], ok: false, error: `${message}${cause}` };
  }
}
