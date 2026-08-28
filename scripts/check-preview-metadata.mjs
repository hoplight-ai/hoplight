#!/usr/bin/env node
// Checks that a deployed Hoplight surface carries all nine link-preview / home-screen items.
//
// Usage:  node scripts/check-preview-metadata.mjs [baseUrl]
//         npm run check:preview
//         npm run check:preview -- https://hoplight-<sha>-....vercel.app
//
// Network only, no dependencies, no secrets, cwd-independent.
// Exits 1 and names every missing item. A skip is not a pass: an unreachable
// base URL is a FAILURE, never a silent success.

const BASE = (process.argv[2] || process.env.CHECK_URL || 'https://hoplight.ai').replace(/\/+$/, '');

const results = [];
let failed = 0;

function record(ok, label, detail) {
  results.push({ ok, label, detail });
  if (!ok) failed += 1;
}

// Cache-buster: hoplight.ai serves a Next prerender behind Vercel's edge cache and has been
// observed with age > 60h. A unique query string forces a MISS so we grade the new build.
const CB = `cb=${Date.now()}`;
const NO_CACHE = { 'cache-control': 'no-cache', pragma: 'no-cache' };

function bust(url) {
  return url + (url.includes('?') ? '&' : '?') + CB;
}

async function fetchText(url) {
  const res = await fetch(bust(url), { headers: NO_CACHE, redirect: 'follow' });
  return {
    res,
    body: await res.text(),
    cache: res.headers.get('x-vercel-cache'),
    age: res.headers.get('age'),
  };
}

// Reads width/height out of a PNG IHDR chunk. Returns null for anything that is not a PNG.
function pngSize(buf) {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buf.length < 24) return null;
  for (let i = 0; i < 8; i += 1) if (buf[i] !== sig[i]) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// Asserts an asset URL is reachable, is an image, and (when given) is exactly wxh.
async function checkImage(label, url, want) {
  let res;
  try {
    res = await fetch(bust(url), { headers: NO_CACHE, redirect: 'follow' });
  } catch (err) {
    record(false, label, `fetch threw: ${err.message}`);
    return;
  }
  if (res.status !== 200) {
    record(false, label, `${url} -> HTTP ${res.status}`);
    return;
  }
  const ct = res.headers.get('content-type') || '';
  if (!/^image\//i.test(ct)) {
    record(false, label, `${url} -> 200 but content-type "${ct}" is not an image type`);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (want) {
    const size = pngSize(buf);
    if (!size) {
      record(false, label, `${url} -> not a readable PNG, cannot confirm ${want.w}x${want.h}`);
      return;
    }
    if (size.w !== want.w || size.h !== want.h) {
      record(false, label, `${url} -> ${size.w}x${size.h}, expected ${want.w}x${want.h}`);
      return;
    }
    record(true, label, `${url} -> 200 ${ct}, ${size.w}x${size.h}`);
    return;
  }
  record(true, label, `${url} -> 200 ${ct}`);
}

function metaByName(html, name) {
  const re = new RegExp(`<meta[^>]*name=["']${name}["'][^>]*>`, 'i');
  const tag = html.match(re)?.[0];
  return tag ? tag.match(/content=["']([^"']*)["']/i)?.[1] ?? null : null;
}

function metaByProperty(html, prop) {
  const re = new RegExp(`<meta[^>]*property=["']${prop}["'][^>]*>`, 'i');
  const tag = html.match(re)?.[0];
  return tag ? tag.match(/content=["']([^"']*)["']/i)?.[1] ?? null : null;
}

function linkHref(html, rel) {
  const re = new RegExp(`<link[^>]*rel=["']${rel}["'][^>]*>`, 'i');
  const tag = html.match(re)?.[0];
  return tag ? tag.match(/href=["']([^"']*)["']/i)?.[1] ?? null : null;
}

function absolutize(href) {
  if (!href) return null;
  return new URL(href, BASE + '/').toString();
}

async function main() {
  console.log(`preview-metadata check -> ${BASE}`);

  let page;
  try {
    page = await fetchText(BASE + '/');
  } catch (err) {
    console.log(`FAIL  page fetch  ${BASE}/ threw: ${err.message}`);
    console.log('\n1 failed, 0 passed');
    process.exit(1);
  }
  if (page.res.status !== 200) {
    console.log(`FAIL  page fetch  ${BASE}/ -> HTTP ${page.res.status}`);
    console.log('\n1 failed, 0 passed');
    process.exit(1);
  }
  console.log(`  fetched ${page.body.length} bytes  x-vercel-cache=${page.cache ?? 'n/a'}  age=${page.age ?? 'n/a'}  (?${CB} appended)`);
  // Measured 2026-08-28: Vercel's prerender cache keys on the matched path, so a query
  // string does NOT bust the HTML. Static assets do bust. Report the truth rather than
  // claiming a bust that did not happen - a stale HIT can pass a check on old bytes.
  if (page.cache === 'HIT' && Number(page.age) > 300) {
    console.log(`  WARNING: the HTML came from the edge cache and is ${page.age}s old. A query string does not bust the prerender cache. To grade a fresh build, probe the deployment's own *.vercel.app URL, or re-run once the alias has moved.`);
  }
  const html = page.body;

  // --- 1. NAME -----------------------------------------------------------
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
  record(Boolean(title), 'name: <title>', title || 'absent');

  const ogTitle = metaByProperty(html, 'og:title');
  record(Boolean(ogTitle), 'name: og:title', ogTitle || 'absent');

  const appleTitle = metaByName(html, 'apple-mobile-web-app-title');
  record(Boolean(appleTitle), 'name: apple-mobile-web-app-title', appleTitle || 'absent');

  // --- 2. PREVIEW TEXT ---------------------------------------------------
  const desc = metaByName(html, 'description');
  record(Boolean(desc), 'preview text: meta description', desc ? `${desc.slice(0, 60)}...` : 'absent');

  const ogDesc = metaByProperty(html, 'og:description');
  record(Boolean(ogDesc), 'preview text: og:description', ogDesc ? `${ogDesc.slice(0, 60)}...` : 'absent');

  // --- 3. PREVIEW IMAGE --------------------------------------------------
  const ogImage = metaByProperty(html, 'og:image');
  if (!ogImage) {
    record(false, 'preview image: og:image present', 'absent');
  } else if (!/^https:\/\//i.test(ogImage)) {
    // THE TRAP: a relative og:image renders as a blank card in iMessage, silently.
    record(false, 'preview image: og:image is an absolute https URL', `"${ogImage}" is relative - renders blank in iMessage`);
  } else {
    record(true, 'preview image: og:image is an absolute https URL', ogImage);
    await checkImage('preview image: og:image fetches 200 as a 1200x630 image', ogImage, { w: 1200, h: 630 });
  }

  const twCard = metaByName(html, 'twitter:card');
  record(twCard === 'summary_large_image', 'preview image: twitter:card = summary_large_image', twCard || 'absent');

  // --- 4. HOME-SCREEN ICON ----------------------------------------------
  const apple = absolutize(linkHref(html, 'apple-touch-icon'));
  if (!apple) {
    record(false, 'home-screen icon: apple-touch-icon link', 'absent');
  } else {
    record(true, 'home-screen icon: apple-touch-icon link', apple);
    await checkImage('home-screen icon: apple-touch-icon fetches 200 as a 180x180 image', apple, { w: 180, h: 180 });
  }

  await checkImage('home-screen icon: favicon.ico fetches 200', BASE + '/favicon.ico');

  // --- 5. MANIFEST -------------------------------------------------------
  const manifestHref = absolutize(linkHref(html, 'manifest'));
  if (!manifestHref) {
    record(false, 'manifest: <link rel="manifest"> in the served HTML', 'absent');
  } else {
    record(true, 'manifest: <link rel="manifest"> in the served HTML', manifestHref);
    let mres;
    let manifest = null;
    try {
      mres = await fetch(bust(manifestHref), { headers: NO_CACHE, redirect: 'follow' });
      if (mres.status !== 200) {
        record(false, 'manifest: fetches 200', `${manifestHref} -> HTTP ${mres.status}`);
      } else {
        const raw = await mres.text();
        try {
          manifest = JSON.parse(raw);
          record(true, 'manifest: fetches 200 and parses as JSON', `${raw.length} bytes, content-type ${mres.headers.get('content-type')}`);
        } catch (err) {
          record(false, 'manifest: fetches 200 and parses as JSON', `parse error: ${err.message}`);
        }
      }
    } catch (err) {
      record(false, 'manifest: fetches 200', `fetch threw: ${err.message}`);
    }

    if (manifest) {
      for (const key of ['name', 'short_name', 'start_url', 'theme_color', 'background_color']) {
        record(Boolean(manifest[key]), `manifest: ${key}`, manifest[key] ? String(manifest[key]) : 'absent');
      }
      record(manifest.display === 'standalone', 'manifest: display = standalone', manifest.display || 'absent');

      const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
      for (const size of [192, 512]) {
        const icon = icons.find((i) => String(i.sizes || '').split(/\s+/).includes(`${size}x${size}`));
        if (!icon) {
          record(false, `manifest: icon declared at ${size}x${size}`, `no icons entry with sizes "${size}x${size}"`);
          continue;
        }
        record(true, `manifest: icon declared at ${size}x${size}`, icon.src);
        await checkImage(
          `manifest: ${size}x${size} icon fetches 200 as a ${size}x${size} image`,
          absolutize(icon.src),
          { w: size, h: size },
        );
      }
    }
  }

  // --- 6. STANDALONE LAUNCH ---------------------------------------------
  const capable = metaByName(html, 'apple-mobile-web-app-capable');
  record(capable === 'yes', 'standalone: apple-mobile-web-app-capable = yes', capable || 'absent');

  // --- report ------------------------------------------------------------
  console.log('');
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.label}  ${r.detail}`);
  }
  const passed = results.length - failed;
  console.log(`\n${failed} failed, ${passed} passed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(`check crashed: ${err.stack || err.message}`);
  process.exit(2);
});
