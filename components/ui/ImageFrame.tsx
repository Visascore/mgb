export default function ImageFrame({
  className = '',
  label,
  ratio = 'aspect-[4/5]',
  src,
  alt,
}: {
  className?: string;
  label?: string;
  ratio?: string;
  src?: string | null;
  alt?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? label ?? ''}
        className={`w-full h-full object-cover rounded-xl2 ${ratio} ${className}`}
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl2 ${ratio} ${className}`}
      style={{
        background:
          'linear-gradient(155deg, #EEE3D0 0%, #E4D5B8 45%, #C7A876 100%)',
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        viewBox="0 0 400 500"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M40 460C40 460 90 340 90 260C90 170 150 90 220 90C290 90 340 160 340 240C340 320 300 400 260 440"
          stroke="#5A4A2E"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
      {label && (
        <span className="absolute bottom-4 left-4 font-body text-[11px] tracking-widest uppercase text-charcoal/50">
          {label}
        </span>
      )}
    </div>
  );
}
