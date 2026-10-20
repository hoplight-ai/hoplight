// Issue tags for The Undo List. Each row carries one to three. The labels name WHO is affected
// or WHAT is at stake, never a side: a veteran, a rancher and a nurse should each find their
// issue here and want the item signed. Whit, 2026-10-15: "make sure they are coded in a way that
// works for all partisan ideologies ... veterans should be pissed and want these things signed,
// too." No label is a movement's name for itself, and no label is a slur for the other side.

export type IssueKey =
  | 'paycheck'
  | 'health'
  | 'veterans'
  | 'prices'
  | 'air-water'
  | 'farms-rural'
  | 'equal-treatment'
  | 'women'
  | 'lgbtq'
  | 'immigrants'
  | 'schools'
  | 'science'
  | 'checks-on-power'
  | 'government-works'
  | 'allies'
  | 'public-safety';

export interface Issue {
  key: IssueKey;
  /** Short label on a chip. */
  label: string;
  /** One line: who this is for, in plain words. */
  line: string;
  /** Words that help a tagger decide; never shown. */
  covers: string;
}

export const ISSUES: Issue[] = [
  { key: 'paycheck', label: 'Your paycheck', line: 'Wages, overtime, union rights, pensions, the right to organize.', covers: 'minimum wage, overtime, contractors, collective bargaining, federal pay, NLRB, Davis-Bacon, apprenticeships, tips' },
  { key: 'health', label: 'Your health care', line: 'Medicaid, insurance, drug prices, hospitals, vaccines, public health.', covers: 'Medicaid, ACA, Medicare, drug prices, HHS, CDC, FDA, NIH clinical, vaccines, rural hospitals, mental health, addiction' },
  { key: 'veterans', label: 'Veterans and troops', line: 'The VA, military families, the Guard, those who served.', covers: 'VA, veterans, National Guard deployments, troops, military spouses, discharged service members, defense health' },
  { key: 'prices', label: 'Prices at the register', line: 'Tariffs and what they add to cars, food, lumber, clothes and phones.', covers: 'tariffs, Section 232, Section 301, IEEPA, de minimis, consumer costs, trade deals' },
  { key: 'air-water', label: 'Clean air, water and land', line: 'Pollution limits, climate, parks, forests, wildlife.', covers: 'EPA, climate, Paris, emissions, mercury, endangered species, NEPA, monuments, public lands, forests, offshore drilling, wind, oil and gas' },
  { key: 'farms-rural', label: 'Farms and rural towns', line: 'Ranchers, growers, rural hospitals, mining and timber towns.', covers: 'USDA, SNAP retailers, beef, fishing, timber, mining, rural health fund, water for farms, broadband' },
  { key: 'equal-treatment', label: 'Equal treatment', line: 'Civil rights enforcement, voting, language access, disability, fair housing.', covers: 'civil rights, DEI, affirmative action, voting, Voting Rights Act, language access, disability, housing, HBCUs, tribes, anti-discrimination' },
  { key: 'women', label: "Women's health and safety", line: 'Reproductive care, maternal health, Title IX, pay equity.', covers: 'abortion, contraception, IVF, Title IX, maternal health, UNFPA, pay equity, domestic violence' },
  { key: 'lgbtq', label: 'LGBTQ Americans', line: 'Service, care, schools, legal recognition.', covers: 'gender identity, transgender service ban, gender-affirming care, Title IX gender, passports, marriage' },
  { key: 'immigrants', label: 'Immigrants and the border', line: 'Asylum, visas, citizenship, enforcement, the people who live here.', covers: 'birthright citizenship, asylum, deportation, ICE, visas, H-1B, refugees, Alien Enemies Act, sanctuary, border emergency' },
  { key: 'schools', label: 'Schools and students', line: 'Public schools, student loans, universities, the Education Department.', covers: 'Education Department, student loans, PSLF, Title I, universities, Harvard, school vouchers, Head Start' },
  { key: 'science', label: 'Science and research', line: 'Labs, data, weather, AI, the research that others build on.', covers: 'NIH, NSF, NOAA, NASA, AI, data, research grants, gain of function, scientific integrity, quantum' },
  { key: 'checks-on-power', label: 'Checks on power', line: 'Independent agencies, inspectors general, courts, the press, elections.', covers: 'inspectors general, independent agencies, Humphrey, DOJ independence, law firms, press, speech, elections, pardons, emoluments, Schedule F' },
  { key: 'government-works', label: 'A government that works', line: 'Civil servants, agencies that answer the phone, benefits that arrive.', covers: 'civil service, RIFs, hiring freeze, DOGE, USAID structure, agency dismantling, procurement, Social Security staffing, IRS' },
  { key: 'allies', label: "Allies and America's word", line: 'Treaties, alliances, aid, the organizations we helped build.', covers: 'withdrawals, WHO, UN bodies, NATO, foreign aid, treaties, trade deals with allies, sanctions, development policy' },
  { key: 'public-safety', label: 'Public safety', line: 'Policing, guns, disasters, drugs, the response when things go wrong.', covers: 'police, consent decrees, FEMA, disasters, wildfire, fentanyl, guns, lead ammunition, National Guard in cities, cartels' },
];

export const ISSUE_KEYS = ISSUES.map((i) => i.key) as IssueKey[];
export const ISSUE_BY_KEY: Record<IssueKey, Issue> = Object.fromEntries(ISSUES.map((i) => [i.key, i])) as Record<IssueKey, Issue>;

/** A tag file entry: the same match keys rulings use, plus one to three issue keys. */
export interface IssueTag {
  match: { eo?: number; proclamation?: number; document_number?: string; title?: string; id?: string };
  issues: IssueKey[];
}

/** A Forward Order: one omnibus order that undoes a bundle of items in one signature and names
 *  the direction it sets. "its not roll back, we must go forward" (Whit, 2026-10-15). */
export interface ForwardOrder {
  id: string;
  /** Short, forward-looking, no "restore" or "reverse" in the title. */
  title: string;
  /** One line, plain, what the order ends or rejoins: the words on its row before it opens. */
  line: string;
  /** One paragraph, plain, what the country gets. */
  purpose: string;
  issues: IssueKey[];
  /** The items this order revokes, by the same match keys. */
  items: IssueTag['match'][];
}
