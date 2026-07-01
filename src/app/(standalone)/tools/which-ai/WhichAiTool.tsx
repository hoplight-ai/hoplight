'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, Briefcase, Lock, ShieldAlert,
  Search, PenLine, BrainCircuit, Target, BarChart3,
  Presentation, Layout, Code2, LineChart, Image as ImageIcon,
  Zap, Sparkles, FastForward, Palette, Hammer,
  MonitorPlay, FileCode2, ArrowLeft, RotateCcw,
  AlertTriangle, Info, ArrowRight
} from 'lucide-react';

// ===== BRAND TOKENS =====
const C = {
  ink: '#0A1628',
  gold: '#E8A838',
  goldDeep: '#B8851F',
  paper: '#F7F5F0',
  stone: '#8B8578',
  signal: '#4A6FA5',
  flag: '#B84A3E',
};

// ===== EXPOSURE DATA (shared between landing page and result page) =====
const EXPOSURE = {
  columns: ['Training', 'Retention', 'Human review', 'Opt-out'],
  platforms: [
    {
      name: 'ChatGPT', company: 'OpenAI',
      tiers: [
        { name: 'Free', price: 'Free', cells: [ { level: 'red', text: 'By default' }, { level: 'red', text: 'Indefinite' }, { level: 'yellow', text: 'Flagged chats' }, { level: 'yellow', text: 'Manual toggle' } ]},
        { name: 'Plus', price: '$20/mo', cells: [ { level: 'red', text: 'By default' }, { level: 'yellow', text: '30 days min' }, { level: 'yellow', text: 'Flagged chats' }, { level: 'yellow', text: 'Manual toggle' } ]},
        { name: 'Team', price: '$30/user', cells: [ { level: 'green', text: 'Prohibited' }, { level: 'green', text: '30 days' }, { level: 'yellow', text: 'Safety only' }, { level: 'green', text: 'Automatic' } ]},
        { name: 'Enterprise', price: 'Custom', cells: [ { level: 'green', text: 'Prohibited' }, { level: 'green', text: 'ZDR available' }, { level: 'green', text: 'No' }, { level: 'green', text: 'Automatic' } ]}
      ]
    },
    {
      name: 'Claude', company: 'Anthropic',
      tiers: [
        { name: 'Free', price: 'Free', cells: [ { level: 'red', text: 'May use' }, { level: 'red', text: 'Up to 5 yrs' }, { level: 'yellow', text: 'Flagged chats' }, { level: 'yellow', text: 'Manual toggle' } ]},
        { name: 'Pro', price: '$20/mo', cells: [ { level: 'red', text: 'May use' }, { level: 'red', text: 'Up to 5 yrs' }, { level: 'yellow', text: 'Flagged chats' }, { level: 'yellow', text: 'Manual toggle' } ]},
        { name: 'Team', price: '$25/user', cells: [ { level: 'green', text: 'Prohibited' }, { level: 'green', text: 'Contractual' }, { level: 'yellow', text: 'Safety only' }, { level: 'green', text: 'Automatic' } ]},
        { name: 'Enterprise', price: 'Custom', cells: [ { level: 'green', text: 'Prohibited' }, { level: 'green', text: 'Custom terms' }, { level: 'green', text: 'No' }, { level: 'green', text: 'Automatic' } ]}
      ]
    },
    {
      name: 'Gemini', company: 'Google',
      tiers: [
        { name: 'Free', price: 'Free', cells: [ { level: 'red', text: 'Improves products' }, { level: 'yellow', text: 'Up to 18 mo' }, { level: 'red', text: 'Human reviewers' }, { level: 'yellow', text: 'Activity controls' } ]},
        { name: 'Advanced', price: '$20/mo', cells: [ { level: 'yellow', text: 'Varies' }, { level: 'yellow', text: 'Activity controls' }, { level: 'yellow', text: 'May review' }, { level: 'yellow', text: 'Activity controls' } ]},
        { name: 'Workspace', price: 'Org plan', cells: [ { level: 'green', text: 'Not used' }, { level: 'green', text: 'Org policy' }, { level: 'green', text: 'Org-controlled' }, { level: 'green', text: 'Automatic' } ]},
        { name: 'Vertex AI', price: 'Usage-based', cells: [ { level: 'green', text: 'Not used' }, { level: 'green', text: 'Custom' }, { level: 'green', text: 'No' }, { level: 'green', text: 'Automatic' } ]}
      ]
    },
    {
      name: 'Perplexity', company: 'Perplexity AI',
      tiers: [
        { name: 'Free', price: 'Free', cells: [ { level: 'yellow', text: 'May use' }, { level: 'yellow', text: 'Unclear' }, { level: 'yellow', text: 'Unclear' }, { level: 'yellow', text: 'Limited' } ]},
        { name: 'Pro', price: '$20/mo', cells: [ { level: 'yellow', text: 'Better terms' }, { level: 'yellow', text: 'Unclear' }, { level: 'yellow', text: 'Unclear' }, { level: 'yellow', text: 'Settings' } ]},
        { name: 'Enterprise', price: 'Custom', cells: [ { level: 'green', text: 'Contractual' }, { level: 'green', text: 'Defined' }, { level: 'green', text: 'Admin controls' }, { level: 'green', text: 'Automatic' } ]}
      ]
    }
  ]
};

// ===== STEP DATA =====
const STEPS: Record<string, any> = {
  newspaper: {
    title: 'The Newspaper Test',
    subtitle: 'Would you be comfortable if everything in this conversation appeared in a national newspaper tomorrow?',
    options: [
      { id: 'yes', label: 'Yes, totally fine', desc: 'Public info, general research, brainstorming non-sensitive topics.', icon: CheckCircle2, next: 'usecase', color: 'green' },
      { id: 'no', label: 'No, absolutely not', desc: 'Internal work, client data, strategy, anything you wouldn\'t want public.', icon: XCircle, next: 'sensitivity', color: 'red' }
    ]
  },
  sensitivity: {
    title: 'Classify your content',
    subtitle: 'How sensitive is the data you\'re working with?',
    options: [
      { id: 'professional', label: 'Professional / Internal', icon: Briefcase, next: 'usecase',
        bullets: ['Internal drafts, meeting prep', 'Strategy notes, talking points', 'General internal comms'],
        footnote: 'Not public, but not catastrophic if seen' },
      { id: 'confidential', label: 'Confidential', icon: Lock, next: 'usecase',
        bullets: ['Financials, budgets, contract terms', 'Legal strategy, HR matters', 'Campaign plans, bargaining positions'],
        footnote: 'Damaging if exposed, but not regulated' },
      { id: 'restricted', label: 'Highly Restricted', icon: ShieldAlert, next: 'restricted',
        bullets: ['Member PII (names, contact, demographics)', 'Medical/health info (HIPAA)', 'Student records (FERPA), SSNs', 'Passwords, credentials, trade secrets', 'Active legal proceedings'],
        regulatory: 'Regulated by law: HIPAA, FERPA, state privacy acts' }
    ]
  },
  usecase: {
    title: 'What are you trying to accomplish?',
    subtitle: 'Different models have genuinely different architectural strengths.',
    grouped: true,
    groups: [
      { key: 'thinking', label: 'Research & thinking' },
      { key: 'creating', label: 'Visual & creative' },
      { key: 'building', label: 'Technical' }
    ],
    options: [
      { id: 'research', label: 'Research & fact-finding', desc: 'Looking things up, "what\'s the law on X," sourced answers.', icon: Search, next: 'result', group: 'thinking' },
      { id: 'writing', label: 'Drafting & writing', desc: 'Emails, reports, blog posts, talking points.', icon: PenLine, next: 'writing_refine', group: 'thinking' },
      { id: 'analysis', label: 'Complex analysis', desc: 'Strategy, decision trees, outlining arguments.', icon: BrainCircuit, next: 'result', group: 'thinking' },
      { id: 'redteam', label: 'Red team / feedback', desc: 'Stress-test an argument, find holes in your plan.', icon: Target, next: 'result', group: 'thinking' },
      { id: 'draft', label: 'Rapid brainstorming', desc: 'Rough ideas, fast iteration, volume over polish.', icon: Zap, next: 'result', group: 'thinking' },
      { id: 'infographic', label: 'Infographic or data viz', desc: 'Charts, diagrams, infographics with text and layout.', icon: BarChart3, next: 'result', group: 'creating' },
      { id: 'slides', label: 'Presentations', desc: 'Slide decks, pitch decks, visual outlines.', icon: Presentation, next: 'result', group: 'creating' },
      { id: 'website', label: 'Web & UI design', desc: 'Landing pages, web apps, mockups.', icon: Layout, next: 'website_refine', group: 'creating' },
      { id: 'imagegen', label: 'Image generation', desc: 'Photos, illustrations, assets.', icon: ImageIcon, next: 'result', group: 'creating' },
      { id: 'coding', label: 'Software engineering', desc: 'Writing code, debugging, scripts.', icon: Code2, next: 'coding_refine', group: 'building' },
      { id: 'data', label: 'Data processing', desc: 'Spreadsheets, statistical analysis, dataset parsing.', icon: LineChart, next: 'result', group: 'building' }
    ]
  },
  writing_refine: {
    title: 'What matters more for this piece?',
    subtitle: 'Optimize for your specific workflow.',
    options: [
      { id: 'quality', label: 'Voice and nuance', desc: 'Needs to sound natural, mimic a specific tone, or be genuinely good prose.', icon: Sparkles, next: 'result' },
      { id: 'speed', label: 'Speed and volume', desc: 'Need multiple drafts fast, iterating on structure more than voice.', icon: FastForward, next: 'result' }
    ]
  },
  website_refine: {
    title: 'What stage of website work?',
    subtitle: 'Designing and building require different visual reasoning skills.',
    options: [
      { id: 'design', label: 'UI/UX design', desc: 'Visual direction, mockups, layout decisions.', icon: Palette, next: 'result' },
      { id: 'build', label: 'Development', desc: 'Writing React, HTML/CSS, full-stack implementation.', icon: Hammer, next: 'result' }
    ]
  },
  coding_refine: {
    title: 'What is your coding environment?',
    subtitle: 'The workflow integration matters as much as the model.',
    options: [
      { id: 'ide', label: 'Inside an IDE', desc: 'Inline suggestions, refactoring in VS Code.', icon: MonitorPlay, next: 'result' },
      { id: 'standalone', label: 'Standalone chat', desc: 'Solving isolated problems, code review, scripts.', icon: FileCode2, next: 'result' }
    ]
  }
};

// ===== RECOMMENDATION ENGINE =====
function getRecommendation(answers: Record<string, string>) {
  const sensitivity = answers.newspaper === 'yes' ? 'public' : (answers.sensitivity || 'professional');
  const usecase = answers.usecase;
  const ref = answers.writing_refine || answers.website_refine || answers.coding_refine;
  let rec: any = {};

  switch (usecase) {
    case 'research':
      rec = { primary: { name: 'Perplexity', tagline: 'AI search engine that cites its sources', why: 'Search-native. Cites every claim with links to the source. Best tool for "is this true?" and factual validation.' }, alternatives: [ { name: 'Gemini', note: 'Strong web access, deep Google ecosystem integration.' }, { name: 'ChatGPT', note: 'Browsing mode works well for conversational follow-ups.' } ] }; break;
    case 'writing':
      if (ref === 'quality') {
        rec = { primary: { name: 'Claude', tagline: 'Best-in-class for nuanced, high-quality writing', why: 'Produces the most natural long-form prose. Handles nuance without flattening your ideas or smothering your voice.' }, alternatives: [ { name: 'ChatGPT', note: 'Faster iterations with Canvas mode for inline editing.' } ] };
      } else {
        rec = { primary: { name: 'ChatGPT', tagline: 'Fast, versatile, great for iterative drafting', why: 'Fastest iteration loop. Canvas mode lets you edit inline. Great for generating variations.' }, alternatives: [ { name: 'Claude', note: 'Noticeably higher quality on voice, worth the slower pace for final drafts.' } ] };
      } break;
    case 'analysis':
      rec = { primary: { name: 'Claude', tagline: 'Strongest reasoning and analytical depth', why: 'Best at holding complexity without collapsing it into simple answers. Will push back if your logic has holes.' }, alternatives: [ { name: 'ChatGPT', note: 'Good for quick structured breakdowns, but less depth.' } ] }; break;
    case 'redteam':
      rec = { primary: { name: 'Claude', tagline: 'Adversarial reasoning and honest pushback', why: 'Strongest at steelmanning opposing arguments without losing rigor. Won\'t pull punches when your reasoning has holes.' }, alternatives: [ { name: 'ChatGPT', note: 'Faster but more likely to soften its criticism.' } ] }; break;
    case 'infographic':
      rec = { primary: { name: 'Gemini', tagline: 'Superior visual layout and text rendering', why: 'Genuinely better at visual layout and text rendering in graphics. Produces legible styled text and clean infographic layouts.' }, alternatives: [ { name: 'Canva AI', note: 'Better for brand-consistent, highly controllable design.' } ] }; break;
    case 'slides':
      rec = { primary: { name: 'Gemini', tagline: 'Direct Google Slides integration', why: 'Integrates directly into Slides. Can build entire decks from outlines with a consistent visual language.' }, alternatives: [ { name: 'Claude', note: 'Best at structuring the narrative. Use Claude for the story, Gemini for the visual deck.' } ] }; break;
    case 'website':
      if (ref === 'design') {
        rec = { primary: { name: 'Gemini', tagline: 'Strong visual design instincts', why: 'Best at generating visual mockups and design direction. Great instincts for color, spacing, and hierarchy.' }, alternatives: [ { name: 'v0 by Vercel', note: 'Generates working React UIs from design prompts.' } ] };
      } else {
        rec = { primary: { name: 'Claude', tagline: 'Elite code generation for web', why: 'Produces the cleanest, most maintainable web code. Handles full-stack UIs with strong architectural decisions.' }, alternatives: [ { name: 'Cursor', note: 'Build inside an IDE with AI inline. Best for existing codebases.' } ] };
      } break;
    case 'coding':
      if (ref === 'ide') {
        rec = { primary: { name: 'Cursor', tagline: 'AI-native code editor', why: 'Inline code suggestions that understand your full codebase. Built for the workflow of writing code, not chatting about it.' }, alternatives: [ { name: 'GitHub Copilot', note: 'Works inside existing VS Code/JetBrains setups.' } ] };
      } else {
        rec = { primary: { name: 'Claude', tagline: 'Top benchmarks for complex code', why: 'Holds context across long files. Catches edge cases others miss. Best at explaining why code works or debugging.' }, alternatives: [ { name: 'ChatGPT', note: 'Faster for quick Python scripts using Code Interpreter.' } ] };
      } break;
    case 'data':
      rec = { primary: { name: 'Claude', tagline: 'Advanced data interpretation', why: 'Excellent at exploring data, writing analysis code, and explaining findings in plain language.' }, alternatives: [ { name: 'ChatGPT', note: 'Code interpreter with built-in interactive charting.' } ] }; break;
    case 'imagegen':
      rec = { primary: { name: 'Gemini', tagline: 'Highest quality text and photorealism', why: 'Produces superior AI images right now, with vastly better text rendering than DALL-E. Integrated with real-time reference imagery.' }, alternatives: [ { name: 'Midjourney', note: 'Still king for artistic, highly stylized output.' } ] }; break;
    case 'draft':
      rec = { primary: { name: 'ChatGPT', tagline: 'Built for rapid brainstorming', why: 'Fastest response time and great at generating variations. The best "thinking out loud" partner.' }, alternatives: [ { name: 'Claude', note: 'Better if the brainstorm involves genuine strategic complexity.' } ] }; break;
    default:
      rec = { primary: { name: 'ChatGPT', tagline: 'The versatile default', why: 'A strong all-rounder for general tasks.' }};
  }

  rec.security = getSecurityInfo(sensitivity, rec.primary.name);
  return rec;
}

function getSecurityInfo(sensitivity: string, toolName: string) {
  const tiers: Record<string, any> = {
    public: null,
    professional: {
      level: 'yellow', label: 'Opt out of training',
      detail: 'Internal content on a free tier gets used for model training. A paid individual plan plus a manual opt-out reduces exposure.',
      tierNote: getOptOutNote(toolName), icon: AlertTriangle
    },
    confidential: {
      level: 'orange', label: 'Contractual protection needed',
      detail: 'Sensitive content. Individual paid plans still store your data on external servers without contractual limits. Team or Enterprise tiers provide binding data protection.',
      tierNote: getTeamNote(toolName), icon: Lock
    }
  };
  return tiers[sensitivity] || null;
}

function getOptOutNote(toolName: string) {
  const notes: Record<string, string> = {
    'Perplexity': 'Perplexity Pro: Review privacy settings to disable telemetry.',
    'Claude': 'Claude Pro: Settings > Privacy > disable training. Paid does not mean private by default.',
    'ChatGPT': 'ChatGPT Plus: Settings > Data Controls > Turn OFF "Improve the model for everyone."',
    'Gemini': 'Gemini Advanced: Disable Google AI activity controls in your account settings.',
    'Cursor': 'Cursor Pro: Enable Privacy Mode in settings to prevent code retention.'
  };
  return notes[toolName] || 'Check the provider\'s privacy settings and disable training data collection.';
}

function getTeamNote(toolName: string) {
  const notes: Record<string, string> = {
    'Perplexity': 'Perplexity Enterprise provides SSO and admin controls.',
    'Claude': 'Claude Team/Enterprise: training prohibited by contract, configurable data retention.',
    'ChatGPT': 'ChatGPT Team/Enterprise: training prohibited. Enterprise adds data residency options.',
    'Gemini': 'Gemini Workspace: governed by your org\'s admin settings. Safest option if available.',
    'Cursor': 'Cursor Business: SOC 2 compliance, zero data retention enforced.'
  };
  return notes[toolName] || 'Team/Enterprise plans with zero-data-retention contracts provide the strongest protection.';
}

// Look up a platform in the exposure data by recommendation name
function getExposurePlatform(toolName: string) {
  const map: Record<string, string> = { 'ChatGPT': 'ChatGPT', 'Claude': 'Claude', 'Gemini': 'Gemini', 'Perplexity': 'Perplexity' };
  const name = map[toolName];
  return name ? EXPOSURE.platforms.find(p => p.name === name) : null;
}

// ===== PILL COLORS (semantic, not brand) =====
const pillColors: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: 'rgba(184, 74, 62, 0.1)', text: C.flag, border: 'rgba(184, 74, 62, 0.25)' },
  yellow: { bg: 'rgba(232, 168, 56, 0.12)', text: '#92600a', border: 'rgba(232, 168, 56, 0.3)' },
  green: { bg: 'rgba(46, 125, 50, 0.08)', text: '#2e7d32', border: 'rgba(46, 125, 50, 0.2)' },
};

const securityColors: Record<string, { bg: string; border: string; text: string; heading: string }> = {
  green: { bg: 'rgba(46, 125, 50, 0.06)', border: 'rgba(46, 125, 50, 0.2)', text: '#2e7d32', heading: '#1b5e20' },
  yellow: { bg: 'rgba(232, 168, 56, 0.08)', border: 'rgba(232, 168, 56, 0.25)', text: '#92600a', heading: '#6d4c0a' },
  orange: { bg: 'rgba(184, 74, 62, 0.06)', border: 'rgba(184, 74, 62, 0.2)', text: '#8b3a30', heading: '#6d2c24' },
};

// Visual cue colors for newspaper test
const optionCueColors: Record<string, { border: string; iconBg: string; iconColor: string }> = {
  green: { border: '#2e7d32', iconBg: 'rgba(46, 125, 50, 0.08)', iconColor: '#2e7d32' },
  red: { border: C.flag, iconBg: 'rgba(184, 74, 62, 0.08)', iconColor: C.flag },
};

// ===== COMPONENTS =====

const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const pct = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div style={{ width: '100%', background: `${C.ink}08`, height: 3, borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: C.gold, borderRadius: 2, transition: 'width 0.5s ease-out' }} />
    </div>
  );
};

// Reusable exposure table renderer
const ExposureTable = ({ platforms, compact }: { platforms: any[]; compact?: boolean }) => {
  const cols = EXPOSURE.columns;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 16 : 20 }}>
      {platforms.map((p, i) => (
        <div key={i} style={{ background: C.paper, border: `1px solid ${C.stone}33`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ background: `${C.ink}05`, borderBottom: `1px solid ${C.stone}25`, padding: compact ? '10px 16px' : '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontWeight: 600, color: C.ink, fontSize: compact ? 15 : 16, margin: 0 }}>{p.name}</h3>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.stone }}>{p.company}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.stone}15` }}>
                  <th style={{ padding: '8px 16px', fontWeight: 600, color: C.stone, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tier</th>
                  {cols.map((c, j) => (
                    <th key={j} style={{ padding: '8px 10px', fontWeight: 600, color: C.stone, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.tiers.map((t: any, j: number) => (
                  <tr key={j} style={{ borderBottom: j < p.tiers.length - 1 ? `1px solid ${C.stone}0d` : 'none' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontWeight: 600, color: C.ink, fontSize: 13 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: C.stone, marginTop: 1 }}>{t.price}</div>
                    </td>
                    {t.cells.map((cell: any, k: number) => (
                      <td key={k} style={{ padding: '10px 10px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
                          background: pillColors[cell.level].bg, color: pillColors[cell.level].text, border: `1px solid ${pillColors[cell.level].border}`
                        }}>{cell.text}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function WhichAiTool() {
  const [currentStep, setCurrentStep] = useState<string>('landing');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<{ step: string; answers: Record<string, string> }[]>([]);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => { setAnimKey(k => k + 1); }, [currentStep]);

  const handleSelect = (stepId: string, optionId: string, nextStep: string) => {
    setAnswers(prev => ({ ...prev, [stepId]: optionId }));
    setHistory(prev => [...prev, { step: currentStep, answers: { ...answers } }]);
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentStep(prev.step);
    setAnswers(prev.answers);
  };

  const restart = () => {
    setCurrentStep('landing');
    setAnswers({});
    setHistory([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startAssessment = () => {
    setHistory(prev => [...prev, { step: 'landing', answers: {} }]);
    setCurrentStep('newspaper');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const font = "'GT America', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  const backBtn = { background: 'none', border: 'none', color: C.stone, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, fontFamily: font, padding: 0, marginBottom: 8 };

  // ===== LANDING PAGE =====
  const renderLanding = () => (
    <div key={animKey} style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <div style={{ maxWidth: 640, marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
          Pick the right AI tool for the job.
        </h1>
        <p style={{ fontSize: 17, color: C.ink, lineHeight: 1.7, marginBottom: 8 }}>
          When you open an AI tool, two questions determine whether you&apos;ve made a good choice or a mistake.
          First: is your data safe with this platform at this pricing tier?
          Second: is this the right model for what you&apos;re actually trying to do?
        </p>
        <p style={{ fontSize: 17, color: C.ink, lineHeight: 1.7, marginBottom: 32, fontWeight: 500 }}>
          This tool walks you through both.
        </p>

        <button
          onClick={startAssessment}
          style={{
            background: C.ink, color: C.paper, border: 'none', fontWeight: 500,
            padding: '16px 36px', borderRadius: 6, cursor: 'pointer', fontSize: 16,
            fontFamily: font, display: 'inline-flex', alignItems: 'center', gap: 10,
            transition: 'background 0.15s', boxShadow: `0 2px 12px ${C.ink}20`
          }}
          onMouseOver={e => e.currentTarget.style.background = C.goldDeep}
          onMouseOut={e => e.currentTarget.style.background = C.ink}
        >
          Get started <ArrowRight size={18} />
        </button>
      </div>

      {/* Full exposure tables below the fold */}
      <div style={{ borderTop: `2px solid ${C.gold}`, paddingTop: 32, marginTop: 8 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: C.stone, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Data exposure by platform and tier</h2>
          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6, margin: 0, opacity: 0.7 }}>
            What each major AI platform does with your data at every pricing level. Red and yellow mean your data is exposed. Green means contractual protection.
          </p>
        </div>
        <ExposureTable platforms={EXPOSURE.platforms} />
        <div style={{ background: `${C.gold}14`, border: `1px solid ${C.gold}30`, borderRadius: 6, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 20 }}>
          <Info size={18} style={{ color: C.goldDeep, flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.6, margin: 0 }}>
            Paying for Plus/Pro/Advanced buys you <em>features</em>, not privacy. Real data protection (green rows) starts at Team or Enterprise tiers.
          </p>
        </div>
      </div>
    </div>
  );

  // ===== RESTRICTED SCREEN =====
  const renderRestricted = () => (
    <div key={animKey} style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
      <button onClick={goBack} style={backBtn} onMouseOver={e => e.currentTarget.style.color = C.ink} onMouseOut={e => e.currentTarget.style.color = C.stone}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ background: 'rgba(184, 74, 62, 0.06)', border: `1px solid rgba(184, 74, 62, 0.2)`, borderRadius: 8, padding: '28px 32px', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: C.flag, marginBottom: 16 }}>
          <ShieldAlert size={28} />
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Stop: unsafe data</h2>
        </div>
        <p style={{ color: C.ink, fontSize: 17, lineHeight: 1.7, marginBottom: 24 }}>
          Personal identifiers, highly regulated data, and trade secrets should stay out of all commercial AI tools, regardless of enterprise tier. No terms of service fully protect this class of data.
        </p>

        <div style={{ background: 'white', borderRadius: 6, padding: 24, border: `1px solid rgba(184, 74, 62, 0.12)` }}>
          <h3 style={{ fontWeight: 600, color: C.ink, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px 0' }}>Alternatives</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['Reframe the task:', 'Strip identifying details. Replace real names with placeholders, genericize the scenario before prompting.'],
              ['Local models:', 'Run Llama 3 or Mistral locally on your hardware. Data never leaves your machine.'],
              ['Enterprise ZDR APIs:', 'Use Anthropic/OpenAI APIs specifically provisioned with Zero Data Retention contracts.']
            ].map(([label, text], i) => (
              <div key={i} style={{ display: 'flex', gap: 12, color: C.ink, fontSize: 15, lineHeight: 1.6 }}>
                <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: 'rgba(184, 74, 62, 0.1)', color: C.flag, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{i + 1}</span>
                <span><strong>{label}</strong> {text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button onClick={restart} style={{ background: 'none', border: 'none', color: C.goldDeep, cursor: 'pointer', fontWeight: 500, fontSize: 15, fontFamily: font, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <RotateCcw size={18} /> Start over
        </button>
      </div>
    </div>
  );

  // ===== RESULT SCREEN =====
  const renderResult = () => {
    const rec = getRecommendation(answers);
    const hasSecurity = rec.security != null;
    const SecIcon = hasSecurity ? rec.security.icon : null;
    const sc = hasSecurity ? (securityColors[rec.security.level] || securityColors.yellow) : null;
    const exposurePlatform = getExposurePlatform(rec.primary.name);

    return (
      <div key={animKey} style={{ animation: 'fadeSlideIn 0.4s ease-out' }}>
        <button onClick={goBack} style={backBtn} onMouseOver={e => e.currentTarget.style.color = C.ink} onMouseOut={e => e.currentTarget.style.color = C.stone}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Primary recommendation */}
        <div style={{ background: C.paper, border: `1px solid ${C.gold}40`, borderRadius: 8, overflow: 'hidden', boxShadow: `0 4px 24px ${C.ink}08`, marginTop: 16 }}>
          <div style={{ background: C.ink, padding: '10px 28px' }}>
            <span style={{ color: C.gold, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recommendation</span>
          </div>

          <div style={{ padding: '32px 28px' }}>
            <h1 style={{ fontSize: 32, fontWeight: 600, color: C.ink, letterSpacing: '-0.02em', margin: '0 0 6px 0', lineHeight: 1.1 }}>{rec.primary.name}</h1>
            <p style={{ fontSize: 16, color: C.stone, fontWeight: 500, margin: '0 0 24px 0' }}>{rec.primary.tagline}</p>

            <p style={{ fontSize: 17, color: C.ink, lineHeight: 1.7, marginBottom: hasSecurity ? 28 : 0 }}>{rec.primary.why}</p>

            {/* Security notice: only for professional/confidential, never for public */}
            {hasSecurity && (
              <div style={{ borderRadius: 6, padding: 20, border: `1px solid ${sc!.border}`, background: sc!.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <SecIcon size={20} style={{ color: sc!.text }} />
                  <h3 style={{ fontWeight: 600, fontSize: 15, color: sc!.heading, margin: 0 }}>{rec.security.label}</h3>
                </div>
                <p style={{ fontSize: 14, color: sc!.text, marginBottom: rec.security.tierNote ? 12 : 0, lineHeight: 1.5 }}>{rec.security.detail}</p>
                {rec.security.tierNote && (
                  <div style={{ fontSize: 13, fontWeight: 500, padding: '10px 14px', borderRadius: 4, background: 'rgba(255,255,255,0.6)', border: `1px solid ${sc!.border}`, color: sc!.heading }}>
                    {rec.security.tierNote}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Platform exposure table */}
        {exposurePlatform && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: C.stone, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              {rec.primary.name} data exposure by tier
            </h3>
            <ExposureTable platforms={[exposurePlatform]} compact />
          </div>
        )}

        {/* Alternatives */}
        {rec.alternatives && rec.alternatives.length > 0 && (
          <div style={{ background: C.paper, border: `1px solid ${C.stone}25`, borderRadius: 8, padding: 28, marginTop: 24 }}>
            <h3 style={{ fontSize: 10, fontWeight: 700, color: C.stone, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, marginTop: 0 }}>Also consider</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {rec.alternatives.map((alt: any, idx: number) => (
                <div key={idx}>
                  <div style={{ fontWeight: 600, color: C.ink, fontSize: 15 }}>{alt.name}</div>
                  <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.5, marginTop: 2, opacity: 0.7 }}>{alt.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button onClick={restart} style={{
            background: `${C.ink}08`, border: 'none', color: C.stone, cursor: 'pointer', fontWeight: 500, fontSize: 14, fontFamily: font,
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 20, transition: 'all 0.15s'
          }}
            onMouseOver={e => { e.currentTarget.style.background = `${C.ink}12`; e.currentTarget.style.color = C.ink; }}
            onMouseOut={e => { e.currentTarget.style.background = `${C.ink}08`; e.currentTarget.style.color = C.stone; }}
          >
            <RotateCcw size={16} /> Start over
          </button>
        </div>
      </div>
    );
  };

  // ===== STANDARD STEP SCREEN =====
  const renderStandardStep = () => {
    const step = STEPS[currentStep];
    const estimatedTotal = answers.newspaper === 'no' ? 4 : 3;
    const progressCurrent = history.length;
    const isSensitivity = currentStep === 'sensitivity';
    const isNewspaper = currentStep === 'newspaper';

    return (
      <div key={animKey} style={{ maxWidth: 680, margin: '0 auto', animation: 'fadeSlideIn 0.4s ease-out' }}>
        {history.length > 0 && (
          <button onClick={goBack} style={backBtn} onMouseOver={e => e.currentTarget.style.color = C.ink} onMouseOut={e => e.currentTarget.style.color = C.stone}>
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <ProgressBar current={progressCurrent} total={estimatedTotal} />

        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 28, fontWeight: 600, color: C.ink, marginBottom: 14, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{step.title}</h2>
          <p style={{ fontSize: 17, color: C.ink, lineHeight: 1.7, marginBottom: 0, opacity: 0.7 }}>{step.subtitle}</p>
          {step.note && (
            <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.goldDeep, background: `${C.gold}14`, padding: '8px 16px', borderRadius: 4, border: `1px solid ${C.gold}30`, fontWeight: 500 }}>
              <Info size={15} /> {step.note}
            </div>
          )}
        </div>

        {step.grouped ? (
          // Grouped layout: bold section headers, colored icons, gold dividers
          <div>
            {step.groups.map((grp: any, gi: number) => {
              const groupOpts = step.options.filter((o: any) => o.group === grp.key);
              return (
                <div key={grp.key} style={{ marginBottom: gi < step.groups.length - 1 ? 0 : 0 }}>
                  {gi > 0 && <div style={{ height: 2, background: C.gold, margin: '32px 0', opacity: 0.5 }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 4, height: 24, borderRadius: 2, background: C.gold }} />
                    <h4 style={{ fontSize: 20, fontWeight: 600, color: C.ink, margin: 0, letterSpacing: '-0.01em' }}>{grp.label}</h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: groupOpts.length <= 2 ? '1fr 1fr' : 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
                    {groupOpts.map((opt: any) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(currentStep, opt.id, opt.next)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                            background: C.paper, border: `1.5px solid ${C.stone}20`, borderRadius: 8,
                            cursor: 'pointer', textAlign: 'left', fontFamily: font, width: '100%',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.boxShadow = `0 3px 16px ${C.gold}20`; e.currentTarget.style.background = `${C.gold}08`; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = C.stone + '20'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = C.paper; }}
                        >
                          <div style={{
                            flexShrink: 0, width: 48, height: 48, borderRadius: 8, background: C.ink,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold
                          }}>
                            <Icon size={24} strokeWidth={1.8} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: C.ink, margin: '0 0 2px 0' }}>{opt.label}</h3>
                            <p style={{ color: C.ink, fontSize: 13, lineHeight: 1.4, margin: 0, opacity: 0.55 }}>{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Standard vertical list for all other steps
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {step.options.map((opt: any) => {
              const Icon = opt.icon;
              const cue = isNewspaper && opt.color ? optionCueColors[opt.color] : null;

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(currentStep, opt.id, opt.next)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 16, padding: '20px 22px',
                    background: C.paper,
                    border: `1.5px solid ${cue ? cue.border + '40' : C.stone + '25'}`,
                    borderLeft: cue ? `4px solid ${cue.border}` : `1.5px solid ${C.stone}25`,
                    borderRadius: 8,
                    cursor: 'pointer', textAlign: 'left', fontFamily: font, fontSize: 15, width: '100%',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = cue ? cue.border : C.gold;
                    if (cue) e.currentTarget.style.borderLeftColor = cue.border;
                    e.currentTarget.style.boxShadow = `0 2px 12px ${cue ? cue.border + '18' : C.gold + '18'}`;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = cue ? cue.border + '40' : C.stone + '25';
                    if (cue) e.currentTarget.style.borderLeftColor = cue.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    flexShrink: 0, marginTop: 2, width: 44, height: 44, borderRadius: 6,
                    background: cue ? cue.iconBg : `${C.ink}06`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cue ? cue.iconColor : C.stone,
                    transition: 'all 0.15s'
                  }}>
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 4, marginTop: 0 }}>{opt.label}</h3>
                    {isSensitivity && opt.bullets ? (
                      <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: opt.regulatory ? 6 : 0 }}>
                          {opt.bullets.map((b: string, i: number) => (
                            <span key={i} style={{ color: C.ink, fontSize: 14, lineHeight: 1.5, opacity: 0.7 }}>{'• '}{b}</span>
                          ))}
                        </div>
                        {opt.footnote && (
                          <span style={{ fontSize: 12, color: C.stone, fontStyle: 'italic' }}>{opt.footnote}</span>
                        )}
                        {opt.regulatory && (
                          <span style={{ fontSize: 12, color: C.flag, fontStyle: 'italic', fontWeight: 500, display: 'block', marginTop: 2 }}>{opt.regulatory}</span>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: C.ink, fontSize: 14, lineHeight: 1.5, margin: 0, opacity: 0.7 }}>{opt.desc}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: font, paddingBottom: 64 }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header style={{ background: C.paper, position: 'sticky', top: 0, zIndex: 50, borderBottom: `2px solid ${C.gold}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 11, color: C.goldDeep, letterSpacing: '0.1em', textTransform: 'uppercase' }}>HOPLIGHT</span>
            <span style={{ fontWeight: 600, fontSize: 16, color: C.ink, letterSpacing: '-0.01em' }}>Which AI Should I Use?</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: C.stone }}>hoplight.ai</span>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 0' }}>
        {currentStep === 'landing' ? renderLanding() :
         currentStep === 'result' ? renderResult() :
         currentStep === 'restricted' ? renderRestricted() :
         renderStandardStep()}
      </main>
    </div>
  );
}
