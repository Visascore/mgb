'use client';

import { useEffect, useState } from 'react';
import { createClient } from './supabase/client';
import { mergeContent, SiteContent, DEFAULT_CONTENT } from './content';

export function useSiteContent(): SiteContent {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'site_content').maybeSingle();
      setContent(mergeContent(data?.value));
    })();
  }, []);

  return content;
}
