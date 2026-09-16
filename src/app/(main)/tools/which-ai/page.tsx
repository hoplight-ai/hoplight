import type { Metadata } from 'next';
import WhichAiTool from './WhichAiTool';

export const metadata: Metadata = {
  title: 'Which AI Should I Use?',
  description: 'Interactive tool to find the right AI platform for your use case and security requirements.',
  // Without this the page inherits the root layout's canonical and tells search engines it is the homepage.
  alternates: { canonical: '/tools/which-ai' },
  openGraph: {
    title: 'Which AI Should I Use? — Hoplight',
    description: 'Answer a few questions, get told which model fits the job.',
    url: 'https://hoplight.ai/tools/which-ai',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Hoplight' }],
  },
};

export default function Page() {
  return <WhichAiTool />;
}
