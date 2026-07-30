import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import ImageFrame from '@/components/ui/ImageFrame';
import { createClient } from '@/lib/supabase/server';
import { getSiteContentServer } from '@/lib/get-content-server';
import { GalleryItem } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Results Gallery',
  description: 'Browse real before-and-after results from Magic Body\u2019s non-invasive body contouring treatments.',
};

export const revalidate = 60;

export default async function GalleryPage() {
  const supabase = createClient();
  const [{ data: items }, content] = await Promise.all([
    supabase.from('gallery_items').select('*').order('created_at', { ascending: false }),
    getSiteContentServer(),
  ]);
  const h = content.pageHeaders.gallery;

  return (
    <div>
      <PageHeader eyebrow={h.eyebrow} title={h.title} description={h.description} />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">
        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(items as GalleryItem[]).map((item) => (
              <div key={item.id} className="card overflow-hidden">
                <div className="grid grid-cols-2 gap-px bg-line">
                  <div className="relative">
                    <ImageFrame ratio="aspect-[3/4]" src={item.before_image_url} alt="Before" />
                    <span className="absolute top-2 left-2 font-body text-[10px] tracking-widest uppercase bg-charcoal/80 text-cream px-2 py-1 rounded-full">
                      Before
                    </span>
                  </div>
                  <div className="relative">
                    <ImageFrame ratio="aspect-[3/4]" src={item.after_image_url} alt="After" />
                    <span className="absolute top-2 left-2 font-body text-[10px] tracking-widest uppercase bg-gold/90 text-offwhite px-2 py-1 rounded-full">
                      After
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {item.category && <p className="eyebrow mb-1 !text-xs">{item.category}</p>}
                  {item.caption && <p className="font-body text-sm text-charcoal2/80">{item.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-body text-charcoal2/70 text-center py-10">
            Our results gallery is being updated — please check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
