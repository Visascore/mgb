import PageHeader from '@/components/PageHeader';
import SuccessScreen from '@/components/SuccessScreen';

export const metadata = {
  title: 'Email Confirmed',
  robots: { index: false, follow: false },
};

export default function AuthSuccessPage() {
  return (
    <div>
      <PageHeader eyebrow="Account Confirmed" title="You're all set" />
      <SuccessScreen
        eyebrow="Email Confirmed"
        title="You're all set"
        primaryHref="/login"
        primaryLabel="Sign In"
        secondaryHref="/"
        secondaryLabel="Back to Home"
      >
        Your email has been confirmed and your account is ready. You can now sign in and start booking
        appointments or shopping.
      </SuccessScreen>
    </div>
  );
}
