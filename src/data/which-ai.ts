// The facts behind the Which AI tool (/tools/which-ai): every plan, price and data term it shows,
// the day they were last checked, and the pages they were checked against. The tool reads this file
// and nothing else for them, so a refresh edits this file only.
//
// Whit, 2026-11-09: "it's definitely out of date because we have new models that have been released.
// The prices for things have been updated. I'm sure the security terms have been updated and we
// probably need to set up some sort of schedule task that goes about refreshing this tool."
//
// The monthly refresh (scripts/which-ai-refresh.md says how) re-reads every page in SOURCES, edits the
// rows that moved, sets CHECKED_AT, and runs scripts/which-ai-data.test.mjs, which fails when a row is
// malformed or the check is older than REFRESH_DAYS.
//
// Rules for a row: a cell says what the company's own page says, in two or three words. Red means the
// data can be trained on or kept long by default; yellow means it is kept or reviewed but the person has a
// control; green means a contract or an admin setting keeps it out of training. Where the company's page
// says nothing, the cell says "Not stated" in yellow, never a guess.

export const CHECKED_AT = '2026-11-09';
export const REFRESH_DAYS = 45;

export type Level = 'red' | 'yellow' | 'green';
export type Cell = { level: Level; text: string };
export type Tier = { name: string; price: string; cells: Cell[] };
export type Platform = { name: string; company: string; models: string; tiers: Tier[] };

// The model family each product runs today, in the plainest name that will not age in a month.
export const EXPOSURE: { columns: string[]; platforms: Platform[] } = {
  columns: ['Training', 'Retention', 'Human review', 'Opt-out'],
  platforms: [
    {
      name: 'ChatGPT', company: 'OpenAI', models: 'GPT-6 family',
      tiers: [
        { name: 'Free / Go', price: 'Free, $8/mo', cells: [ { level: 'red', text: 'By default' }, { level: 'red', text: 'Until you delete' }, { level: 'yellow', text: 'May review' }, { level: 'yellow', text: 'Manual toggle' } ]},
        { name: 'Plus / Pro', price: '$20, from $100/mo', cells: [ { level: 'red', text: 'By default' }, { level: 'red', text: 'Until you delete' }, { level: 'yellow', text: 'May review' }, { level: 'yellow', text: 'Manual toggle' } ]},
        { name: 'Business', price: '$25/user', cells: [ { level: 'green', text: 'Never' }, { level: 'green', text: 'Admin controls' }, { level: 'yellow', text: 'Safety only' }, { level: 'green', text: 'Automatic' } ]},
        { name: 'Enterprise', price: 'Custom', cells: [ { level: 'green', text: 'Never' }, { level: 'green', text: 'Custom terms' }, { level: 'green', text: 'No' }, { level: 'green', text: 'Automatic' } ]}
      ]
    },
    {
      name: 'Claude', company: 'Anthropic', models: 'Claude 5 family (Opus, Sonnet, Fable)',
      tiers: [
        { name: 'Free', price: 'Free', cells: [ { level: 'red', text: 'Unless you opt out' }, { level: 'red', text: 'Up to 5 yrs if on' }, { level: 'yellow', text: 'Flagged chats' }, { level: 'yellow', text: 'Manual toggle' } ]},
        { name: 'Pro / Max / Ultra', price: '$20 to $200/mo', cells: [ { level: 'red', text: 'Unless you opt out' }, { level: 'red', text: 'Up to 5 yrs if on' }, { level: 'yellow', text: 'Flagged chats' }, { level: 'yellow', text: 'Manual toggle' } ]},
        { name: 'Team', price: '$25/user', cells: [ { level: 'green', text: 'None by default' }, { level: 'yellow', text: 'No custom controls' }, { level: 'yellow', text: 'Safety only' }, { level: 'green', text: 'Automatic' } ]},
        { name: 'Enterprise', price: '$20/seat + usage', cells: [ { level: 'green', text: 'None by default' }, { level: 'green', text: 'Custom controls' }, { level: 'green', text: 'No' }, { level: 'green', text: 'Automatic' } ]}
      ]
    },
    {
      name: 'Gemini', company: 'Google', models: 'Gemini 4 family',
      tiers: [
        { name: 'Free / AI Plus', price: 'Free, $4.99/mo', cells: [ { level: 'red', text: 'Improves products' }, { level: 'yellow', text: '18 mo default' }, { level: 'red', text: 'Kept up to 3 yrs' }, { level: 'yellow', text: 'Keep Activity off' } ]},
        { name: 'AI Pro / Ultra', price: '$19.99, from $99.99/mo', cells: [ { level: 'red', text: 'Improves products' }, { level: 'yellow', text: '18 mo default' }, { level: 'red', text: 'Kept up to 3 yrs' }, { level: 'yellow', text: 'Keep Activity off' } ]},
        { name: 'Workspace', price: 'Org plan', cells: [ { level: 'green', text: 'Not used' }, { level: 'green', text: 'Admin-set' }, { level: 'green', text: 'Not without permission' }, { level: 'green', text: 'Automatic' } ]},
        { name: 'Gemini Enterprise', price: 'From $21/seat', cells: [ { level: 'green', text: 'Not used' }, { level: 'green', text: 'Org policy' }, { level: 'yellow', text: 'Not stated' }, { level: 'green', text: 'Automatic' } ]}
      ]
    },
    {
      name: 'Perplexity', company: 'Perplexity AI', models: 'Routes to several companies\' models',
      tiers: [
        { name: 'Free', price: 'Free', cells: [ { level: 'red', text: 'By default' }, { level: 'yellow', text: 'Not stated' }, { level: 'yellow', text: 'Not stated' }, { level: 'yellow', text: 'Future data only' } ]},
        { name: 'Pro / Max', price: '$20, $200/mo', cells: [ { level: 'red', text: 'By default' }, { level: 'yellow', text: 'Not stated' }, { level: 'yellow', text: 'Not stated' }, { level: 'yellow', text: 'Future data only' } ]},
        { name: 'Enterprise', price: 'From $40/seat', cells: [ { level: 'green', text: 'Never' }, { level: 'green', text: 'Configurable (Max)' }, { level: 'green', text: 'Admin controls' }, { level: 'green', text: 'Automatic' } ]}
      ]
    }
  ]
};

// Where to switch training off on a personal plan, per tool the result screen can name.
export const OPT_OUT_NOTES: Record<string, string> = {
  'Perplexity': 'Perplexity Pro: Settings > turn off AI data retention. It only covers what you send from then on; earlier data stays.',
  'Claude': 'Claude Pro: Settings > Privacy > turn off "Help improve Claude", or use an incognito chat. Paid does not mean private by default.',
  'ChatGPT': 'ChatGPT Plus: Settings > Data Controls > turn off "Improve the model for everyone", or use a Temporary Chat.',
  'Gemini': 'Google AI Pro: turn off Keep Activity in Gemini Apps Activity. Chats are then kept 72 hours and not used for training.',
  'Cursor': 'Cursor Pro: Enable Privacy Mode in settings to prevent code retention.'
};

// What the team and enterprise plans add, per tool the result screen can name.
export const TEAM_NOTES: Record<string, string> = {
  'Perplexity': 'Perplexity Enterprise: never used for training or logged, admin controls, retention you set on Enterprise Max.',
  'Claude': 'Claude Team/Enterprise: no training on your content by default. Custom retention controls come with Enterprise only.',
  'ChatGPT': 'ChatGPT Business/Enterprise: never used for training. Enterprise adds data residency and custom retention.',
  'Gemini': 'Gemini in Workspace: not used for training, retention set by your admin. Safest option if your org has it.',
  'Cursor': 'Cursor Business: SOC 2 compliance, zero data retention enforced.'
};

// Every page the rows above were checked against. A refresh re-reads each one.
export const SOURCES: { company: string; label: string; url: string }[] = [
  { company: 'OpenAI', label: 'ChatGPT pricing', url: 'https://chatgpt.com/pricing' },
  { company: 'OpenAI', label: 'ChatGPT Business', url: 'https://chatgpt.com/business/' },
  { company: 'OpenAI', label: 'ChatGPT data controls', url: 'https://help.openai.com/en/articles/7730893-data-controls-faq' },
  { company: 'Anthropic', label: 'Claude pricing', url: 'https://claude.com/pricing' },
  { company: 'Anthropic', label: 'Claude model training', url: 'https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training' },
  { company: 'Anthropic', label: 'Claude data retention', url: 'https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data' },
  { company: 'Google', label: 'Google AI plans', url: 'https://gemini.google/subscriptions/' },
  { company: 'Google', label: 'Gemini Apps privacy', url: 'https://support.google.com/gemini/answer/13594961' },
  { company: 'Google', label: 'Google Workspace privacy hub', url: 'https://knowledge.workspace.google.com/admin/gemini/generative-ai-in-google-workspace-privacy-hub' },
  { company: 'Perplexity AI', label: 'Perplexity plans', url: 'https://www.perplexity.ai/help-center/en/articles/11187416-which-perplexity-subscription-plan-is-right-for-you' }
];
