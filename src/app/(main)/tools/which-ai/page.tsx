import type { Metadata } from 'next';
import WhichAiTool from './WhichAiTool';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Which AI Should I Use?',
  description: 'Interactive tool to find the right AI platform for your use case and security requirements.',
  // Without this the page inherits the root layout's canonical and tells search engines it is the homepage.
  path: '/tools/which-ai',
  ogDescription: 'Answer a few questions, get told which model fits the job.',
});

export default function Page() {
  return <WhichAiTool />;
}
