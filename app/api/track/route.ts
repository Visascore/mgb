import { NextResponse, type NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, path, referrer, eventType, isNewVisitor } = body;

    if (!sessionId || !path) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const country = request.headers.get('x-vercel-ip-country') ?? null;
    const city = request.headers.get('x-vercel-ip-city') ?? null;
    const ua = request.headers.get('user-agent') ?? '';
    const deviceType = /mobile/i.test(ua) ? 'mobile' : /tablet|ipad/i.test(ua) ? 'tablet' : 'desktop';

    const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_type: eventType ?? 'pageview',
      path,
      referrer: referrer || null,
      country: country ? decodeURIComponent(country) : null,
      city: city ? decodeURIComponent(city) : null,
      device_type: deviceType,
      is_new_visitor: Boolean(isNewVisitor),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
