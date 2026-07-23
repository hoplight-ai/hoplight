import type { Metadata } from 'next';
import WhichAiTool from './WhichAiTool';

export const metadata: Metadata = {
  title: 'Which AI Should I Use?',
  description: 'Interactive tool to find the right AI platform for your use case and security requirements.',
};

export default function Page() {
  return <WhichAiTool />;
}
