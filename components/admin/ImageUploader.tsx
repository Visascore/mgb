'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ImageUploader({
  bucket,
  onUploaded,
}: {
  bucket: 'gallery-images' | 'product-images' | 'review-photos' | 'site-images';
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    const supabase = createClient();
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    setUploading(false);

    if (uploadError) {
      setError('Upload failed. Please try again.');
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onUploaded(data.publicUrl);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="font-body text-sm" />
      {uploading && <p className="font-body text-xs text-charcoal2/60 mt-1">Uploading…</p>}
      {error && <p className="font-body text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
