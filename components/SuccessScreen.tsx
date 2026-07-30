import Link from 'next/link';

export default function SuccessScreen({
  eyebrow,
  title,
  children,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="max-w-lg mx-auto px-5 md:px-8 py-24 text-center">
      <svg className="mx-auto mb-6" width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="27" stroke="#B08D4F" strokeWidth="2" />
        <path d="M17 29l7 7 15-16" stroke="#B08D4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="font-display text-3xl text-charcoal mb-4">{title}</h1>
      {children && <div className="font-body text-charcoal2/80 leading-relaxed mb-8">{children}</div>}
      <div className="flex gap-4 justify-center flex-wrap">
        <Link href={primaryHref} className="btn-gold">
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel && (
          <Link href={secondaryHref} className="btn-secondary">
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
