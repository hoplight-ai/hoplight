'use client';

import type { AnchorHTMLAttributes } from 'react';
import { track, type TrackProps } from '@/lib/track';

// A plain link that logs one anonymous action when followed (src/lib/track.ts), for server-rendered
// pages that otherwise ship no script for the link.
export default function TrackedLink({
  tool,
  action,
  props,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { tool: string; action: string; props?: TrackProps }) {
  return <a {...rest} onClick={() => track(tool, action, props)} />;
}
