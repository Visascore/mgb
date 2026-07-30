import { createClient } from './supabase/server';
import { mergeContent, SiteContent } from './content';

export async function getSiteContentServer(): Promise<SiteContent> {
  const supabase = createClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'site_content').maybeSingle();
  return mergeContent(data?.value);
}
