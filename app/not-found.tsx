import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-5 py-32 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="font-display text-3xl text-charcoal mb-4">Page not found</h1>
      <p className="font-body text-charcoal2/70 mb-8">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link href="/" className="btn-gold">
        Back to Home
      </Link>
    </div>
  );
}
