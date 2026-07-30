import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

export const metadata = {
  title: 'Link Expired',
  robots: { index: false, follow: false },
};

export default function AuthErrorPage() {
  return (
    <div>
      <PageHeader eyebrow="Something Went Wrong" title="This link isn't valid" />
      <div className="max-w-md mx-auto px-5 md:px-8 py-20 text-center">
        <p className="font-body text-charcoal2/80 mb-8 leading-relaxed">
          This confirmation link has expired or has already been used. Please try signing up again, or sign in if
          your account is already confirmed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="btn-secondary">
            Sign Up Again
          </Link>
          <Link href="/login" className="btn-gold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
