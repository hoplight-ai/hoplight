# Hoplight Site MVP Handoff

**Owner:** Whit Pendergast
**Deadline:** 3 hours from session start (July 1 2026)
**Repo:** `~/code/hoplight-site`
**Stack:** Next.js + TypeScript + Tailwind (custom CSS in `src/app/globals.css`)
**Deploy:** Push to main, Vercel auto-deploys. Live at https://hoplight-rouge.vercel.app

---

## MVP Scope

Ship three pages: **Home (/)**, **About (/about)**, **Services (/services)**. Everything else stays but gets hidden from nav or deprioritized. The site currently builds and deploys. Do not break the build.

---

## 1. Color Palette: Black to Navy

The site is currently true-black (`#0C0C0C`) with gold accents on a cream surface. Whit wants it shifted to a **deep navy** palette, inspired by the PME one-pager design (screenshots attached to session, showing navy cards with gold type and cream paper).

**What to change in `globals.css` `:root`:**

| Variable | Current | Target | Notes |
|----------|---------|--------|-------|
| `--ink` | `#0C0C0C` | `#0F1B2D` | Deep navy, not pure black |
| `--ink-mid` | `#1A1A1A` | `#162640` | Mid navy for cards/sections |
| `--ink-soft` | `#3A3A3A` | `#2A3F5F` | Softer navy for body text on light bg |
| `--slate` | `#0C0C0C` | `#0F1B2D` | Alias, match --ink |

Gold, surface/paper, stone variables stay the same. The `.hero`, `.slate`, nav header, tool cards, and all dark sections will pick up the navy automatically through the CSS variables.

**Additional spot checks after variable swap:**
- Nav header background: `rgba(12,12,12,0.97)` on line ~109 of globals.css needs to become navy-based: `rgba(15,27,45,0.97)`
- `.hero` background uses `var(--ink)` so it auto-updates
- `.tool-card` background `#1A1A1A` and `.tc-bar` background `#222` are hardcoded; update to navy equivalents
- Any other hardcoded `#0C0C0C`, `#1A1A1A`, `#222` values in globals.css need the navy equivalent
- Mobile nav background `#0C0C0C` also hardcoded

**Do a search for all hardcoded dark hex values in globals.css** and replace with the navy equivalents. The gold accent system stays exactly the same.

---

## 2. Screenshot Images (Replace CSS Placeholders)

The homepage has CSS-only placeholder "tool cards" in the hero and work-cards sections. Replace them with actual screenshot images.

**Screenshots available** (these were uploaded in the Cowork session and need to be saved to `public/screenshots/` or equivalent):
- AGIS search interface (purple header, world map, search box) - use for the AGIS work card
- PME one-pager (Four Auditable Layers cards + Recursive Loop section) - use for the PME work card

**Hero section** (`src/app/(main)/page.tsx` lines 37-73): The `.hero-stack` div contains two fake `.tool-card` divs. Replace with actual `<Image>` components or `<img>` tags showing real product screenshots. Keep the stacked/overlapping visual treatment but use real images instead of CSS rectangles. Use the AGIS screenshot for one, and either the PME one-pager or another screenshot for the second.

**Work cards section** (lines 219-266): The `.wcard-img` divs contain `.wcard-mock` CSS browser windows. Replace with `<Image>` components using the real screenshots. AGIS screenshot for the AGIS card, PME screenshot for the PME card.

**Image handling:** Save screenshots to `public/screenshots/`, use Next.js `<Image>` with appropriate sizing. These should be displayed at roughly 16:9 aspect ratio in the cards.

NOTE: The screenshot files need to be copied from the Cowork uploads into the repo's public directory. They are at these paths in the Cowork session:
- Check `~/code/hoplight-site/` for any images already placed there
- If not present, Whit will need to drop the screenshot files into `public/screenshots/` manually, or they can be fetched from the Cowork uploads

---

## 3. Nav Changes

**File:** `src/components/Nav.tsx`

Current nav links array (line 9-18):
```tsx
const links = [
  { href: '/services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/tools/which-ai', label: 'LLM Guide' },
  { href: '/faq', label: 'FAQ' },
];
```

**Change to:**
```tsx
const links = [
  { href: '/services', label: 'Services' },
  // { href: '/work', label: 'Work' },  // hidden for MVP
  { href: '/about', label: 'About' },
  { href: '/tools/which-ai', label: 'LLM Guide' },
  { href: '/faq', label: 'FAQ' },
];
```

Hide Work from nav. Page still accessible via direct URL but not in navigation.

---

## 4. Home Page Copy Updates

**File:** `src/app/(main)/page.tsx`

All changes below are relative to the current file state.

### 4a. Hero: Remove email button
Line 34: Remove `<a className="btn-outline" href="mailto:whit@hoplight.ai">whit@hoplight.ai</a>`

### 4b. "Who we work with" strip
The `.aud-strip` section is fine content-wise. In `globals.css`, increase the font size of `.aud-list span` from `0.82rem` to `1rem` and `.aud-label` from `0.74rem` to `0.82rem`. Consider bumping padding.

### 4c. Problem section
Line 105: Two changes in one sentence:
- "rarely the technology" becomes "rarely technology" (drop "the")
- "It's the corporate playbook" becomes "It's a stale corporate playbook"

Result: "The reason is rarely technology. It's a stale corporate playbook: buy the fancy tool..."

### 4d. Choice section header
Line 113: Change `<h2>Two ways to bring AI into an organization.</h2>` to `<h2>The Choice: Austerity or Abundance</h2>`

Line 114: Change `<p>The most revolutionary technology in recent history just landed in our laps. The billionaire and CEO response has been austerity. There&apos;s another way.</p>` to `<p>The most revolutionary technology in recent history just landed in our laps. The billionaire and CEO response has been austerity. <strong>There&apos;s another way.</strong></p>`

### 4e. Austerity card (lines 119-128)
Replace the bullet list and result text:
```tsx
<div className="ch-col bad">
  <span className="ch-tag">AI austerity</span>
  <h3>The Corporate Playbook</h3>
  <ul>
    <li>Unilaterally determine AI use cases and governance.</li>
    <li>Mandate tools from the top down.</li>
    <li>Surveil and disempower the people using it.</li>
    <li>Lay people off and cut headcounts.</li>
    <li>Call the cut an innovation.</li>
  </ul>
  <p className="ch-result">Fails because it doesn&apos;t prioritize the end user of AI: workers.</p>
</div>
```

### 4f. Abundance card (lines 129-140)
Replace:
```tsx
<div className="ch-col good">
  <span className="ch-tag">AI abundance</span>
  <h3>Building with Hoplight</h3>
  <ul>
    <li>Your team identifies the highest ROI deployments for AI.</li>
    <li>Build the tools and workflows around their priority use cases.</li>
    <li>Train your team up by meeting them where they are.</li>
    <li>Keep your people.</li>
    <li>Do more, with the same headcount, than you ever have before.</li>
  </ul>
</div>
```

### 4g. Identity section
Line 153: Change `<h2>A vertically integrated governance strategy shop.</h2>` to `<h2>Built for organizations without a Chief AI Officer.</h2>`

Line 154: The current subtext includes "Built for organizations without a Chief AI Officer." which is now the h2. Remove that phrase from the subtext to avoid duplication. The subtext should read: "Most shops offer one layer: a policy, a training, a pile of tools. Real adoption needs all three in the same room."

Line 180 (Builders description): Change "they ship every idea they have and build tools nobody asked for" to "they ship every idea they have and may build tools nobody asked for"

### 4h. Proof band
Line 207: Change "Material compliance incidents" to just "compliance incidents" (remove "Material")

After the proof band section (after line 209), add a link:
```tsx
<div className="wrap" style={{ textAlign: 'center', paddingTop: '16px' }}>
  <Link className="see-more" href="/services">See services in full &rarr;</Link>
</div>
```

### 4i. Barn Door section
Line 277: Change "Not adopting AI? You still have to engage with it." to "Not adopting AI? Governance is still essential."

### 4j. AGIS work card description
Shorten the Home page version. Drop "and 31,900+ sources" -- just say "2,100+ jurisdictions":
Current: "Query AI governance across 2,100+ jurisdictions and 31,900+ sources in plain English."
New: "Query AI governance across 2,100+ jurisdictions in plain English."
(The full stat lives on the Portfolio page.)

### 4k. PME work card description
Reverse sentence order and add "sentiment":
Current: "RCT-validated persuasion you can audit, control, and improve. 11 to 26 points net lift across conservative segments."
New: "11 to 26 points net sentiment lift across conservative segments. RCT-validated persuasion you can audit, control, and improve."

### 4l. Remove Services section from Home entirely
The condensed services section (lines ~293-300, "Where Hoplight goes to work" with the one-liner) should be **removed entirely**. The "See services in full" link after the proof band (section 4h) replaces it. Don't just condense it further -- cut the whole `<section className="svc-section">` block.

### 4m. LLM Picker callout on home page
Add a new section on the home page (between the work cards and the barn door, or between barn door and close CTA) calling out the free LLM picker tool. Something like:

```tsx
<section className="tool-promo">
  <div className="wrap">
    <div className="tool-promo-inner">
      <div>
        <span className="label">Free tool</span>
        <h2>Not sure which AI to use?</h2>
        <p>Answer a few questions about your use case and security requirements. Get a recommendation you can act on.</p>
        <Link className="btn btn-primary" href="/tools/which-ai">Try the LLM Guide &rarr;</Link>
      </div>
    </div>
  </div>
</section>
```

Style this in globals.css as a visually distinct callout, maybe with a gold-bg background or a bordered card treatment.

---

## 5. About Page Rewrite

**File:** `src/app/(main)/about/page.tsx`

### 5a. Hero subtitle + metadata
Change "Institutional-grade AI capability" to "Enterprise-grade AI strategy" in THREE places:
- Line 23: visible hero subtitle text
- Line 7: `metadata.description` string
- Line 11: `openGraph.description` string

### 5b. Bio - Full Rewrite

Replace the current two-paragraph bio with the expanded version below. This needs to convey 20 years of cutting-edge innovation across labor, business, electoral politics, and AI, fast. The audience ranges from CEOs to union political directors to people like Pat Cloherty at American Bridge who built infrastructure after getting tired of post-election teardowns.

**NOTE:** This bio is significantly expanded beyond the redline doc. Whit gave verbal instructions to tell the full career arc. This version supersedes the redline's shorter bio.

**New bio copy:**

```
Whit leads AI strategy inside one of the largest labor unions in North America, guiding adoption, governance, and deployment across a 2-million-member organization. He founded Hoplight to fill a gap in the AI ecosystem: values-aligned, pro-growth AI adoption that centers and empowers workers.

Twenty years of building at the cutting edge. He started in the labor movement in 2010, where he built a network intelligence system for managing movement relationships and political capital during the campaign to defeat right-to-work legislation -- one of the few bright spots for labor in that political era. He left in 2015 to co-found Republic Restoratives, producers of Fascist Tears Vodka and Dissent Gin, which became the largest crowdfunded distillery in US history -- because the banks wouldn't fund them. He got the distillery registered with the FDA, pivoted it to become the second distillery in the country to produce hand sanitizer during the pandemic, and got the product listed on Amazon Prime.

From frontline congressional races to blind door-knock programs that drove turnout in New Hampshire to selling hand sanitizer in the depths of the pandemic, his career has been defined by building things other people said couldn't work. He spent the next years building AI: first to market a regulated product on a hostile ad platform at 4x return on ad spend, then to move voters in a 3,006-person randomized controlled trial.

He has no engineering background. Everything he knows about AI he learned by asking questions in natural language until the tools gave up how they work. He holds a certificate from MIT in Agentic AI for Organizational Transformation.
```

### 5c. MIT Logo
Add the MIT logo near the credential mention. Options:
- Download the MIT logo SVG and place in `public/`
- Display it inline near the certificate mention, small, as a credibility marker
- Could also be a small badge-style treatment below the bio

### 5d. Team section
Line 36: Change to just "Whit leads a team: a project manager, a bench of builders, and trusted subcontractors." (remove "Engagements ship, and they keep running after we leave.")

### 5e. About CTA
Add the lede text "Ready to talk?" before the button. Currently it's a bare button.

Change lines 46-53 to:
```tsx
<section className="slate" style={{ paddingTop: 0 }}>
  <div className="wrap">
    <hr className="rule" style={{ marginBottom: '36px' }} />
    <p className="lede">Ready to talk?</p>
    <div className="cta-row" style={{ marginTop: '24px' }}>
      <Link className="btn btn-primary" href="/contact">Start a conversation</Link>
    </div>
  </div>
</section>
```

---

## 6. Services Page

Services page is mostly done from the previous redline. One remaining check:

Confirm the CTA reads "The fastest way to scope the right engagement is a short conversation." (line 133 - already correct).

No other changes needed for MVP.

---

## 7. CSS Styling Notes

### Choice card headers
The redline calls for increasing the size of "AI AUSTERITY" / "AI ABUNDANCE" headers in the choice cards. In globals.css, find `.ch-tag` and bump its font-size, or style the `<h3>` inside `.ch-col` to be larger/bolder.

### Choice card result line
The final line in each choice card ("Fails because..." / the result of the abundance path) should read visually as the conclusion/result of the preceding bullet steps. Consider styling `.ch-result` with slightly different treatment -- maybe italic, or a top border separator, or gold accent.

---

## 8. Build & Deploy Checklist

1. Apply color palette changes in `globals.css`
2. Apply all home page copy changes
3. Apply About page bio rewrite
4. Add MIT logo to public/ and About page
5. Add LLM picker callout section to home page
6. Hide Work from nav
7. Save screenshots to `public/screenshots/` and replace CSS placeholders
8. Run `npm run build` -- fix any TS errors
9. Commit and push to main
10. Verify at https://hoplight-rouge.vercel.app

**Priority order if time is tight:** Color palette (1) > Copy changes (2,3) > Nav (6) > LLM callout (5) > Screenshots (7) > MIT logo (4)

---

## Files to Touch

| File | Changes |
|------|---------|
| `src/app/globals.css` | Color palette swap, aud-strip sizing, choice card styling |
| `src/app/(main)/page.tsx` | Hero, problem, choice, identity, proof band, barn door copy; LLM callout section; screenshot images |
| `src/app/(main)/about/page.tsx` | Hero subtitle, full bio rewrite, team copy, CTA lede |
| `src/components/Nav.tsx` | Hide Work link |
| `public/screenshots/` | Add AGIS and PME screenshots |
| `public/mit-logo.svg` | MIT credential logo (needs to be sourced) |
