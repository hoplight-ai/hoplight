// The links in the header and the footer, in one place so scripts/nav.test.mjs can read them.
// Whit, 2026-10-19 and 2026-10-20: Products, Insights, Services, FAQ and About, plus the Contact button.
// Nothing here may be a path behind the sign-in (src/lib/gate.ts); the test fails if one comes back.

export type SiteLink = { href: string; label: string };

export const NAV_LINKS: SiteLink[] = [
  { href: '/products', label: 'Products' },
  { href: '/insights', label: 'Insights' },
  { href: '/services', label: 'Services' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
];

export const CONTACT_LINK: SiteLink = { href: '/contact', label: 'Contact' };

export const FOOTER_LINKS: SiteLink[] = [
  { href: 'mailto:whit@hoplight.ai', label: 'whit@hoplight.ai' },
  { href: 'https://www.linkedin.com/in/whit-pendergast/', label: 'LinkedIn' },
];
