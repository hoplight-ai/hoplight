import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { feature } from 'topojson-client';
import { geoAlbersUsa, geoPath } from 'd3-geo';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const us = JSON.parse(readFileSync(join(root, 'node_modules/us-atlas/states-10m.json'), 'utf8'));

const FIPS = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT',
  '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL',
  '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD',
  '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE',
  '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV',
  '55': 'WI', '56': 'WY',
};

const W = 960, H = 600;
const fc = feature(us, us.objects.states);
const projection = geoAlbersUsa().fitSize([W, H], fc);
const path = geoPath(projection);
const round = (d) => d.replace(/-?\d+\.\d+/g, (m) => (Math.round(parseFloat(m) * 10) / 10).toString());

const states = {};
let skipped = [];
for (const f of fc.features) {
  const ab = FIPS[String(f.id).padStart(2, '0')];
  if (!ab) { skipped.push(f.id); continue; }
  const d = path(f);
  if (!d) { skipped.push(ab); continue; }
  states[ab] = round(d);
}

writeFileSync(
  join(root, 'src/data/us-state-paths.json'),
  JSON.stringify({ viewBox: `0 0 ${W} ${H}`, states }, null, 0)
);
console.log(`wrote ${Object.keys(states).length} states. skipped:`, skipped);
