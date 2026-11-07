// fixture: a paid route with its limiter
import { checkLimitIn } from '@/lib/rate-limit';
export async function POST(req) { if (!checkLimitIn('a', 'b', 1, 1)) return null; }
