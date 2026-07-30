import { SiteContent } from '@/lib/content';

export default function FeatureStrip({ content }: { content: SiteContent['home']['features'] }) {
  const features = [
    { title: content.feature1Title, description: content.feature1Desc },
    { title: content.feature2Title, description: content.feature2Desc },
    { title: content.feature3Title, description: content.feature3Desc },
  ];

  const icons = [
    <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" stroke="#B08D4F" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" stroke="#B08D4F" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>,
    <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#B08D4F" strokeWidth="1.3" />
      <path d="M12 7v5l3.5 2" stroke="#B08D4F" strokeWidth="1.3" strokeLinecap="round" />
    </svg>,
    <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3c4 3 7 6.5 7 10.5A7 7 0 015 13.5C5 9.5 8 6 12 3z" stroke="#B08D4F" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>,
  ];

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16 md:pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={f.title} className="border-t border-line pt-6">
            <div className="mb-3">{icons[i]}</div>
            <h3 className="font-display text-lg text-charcoal mb-1.5">{f.title}</h3>
            <p className="font-body text-sm text-charcoal2/70 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
