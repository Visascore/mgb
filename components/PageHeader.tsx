export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-line bg-beige/40">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-16">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="font-display text-3xl md:text-4xl text-charcoal">{title}</h1>
        {description && (
          <p className="font-body text-charcoal2/80 mt-3 max-w-xl leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
