import SuccessScreen from '@/components/SuccessScreen';

export const metadata = {
  title: 'Confirmation Successful',
  robots: { index: false, follow: false },
};

export default function AuthSuccessPage() {
  return (
    <SuccessScreen
      eyebrow="Account Confirmed"
      title="Confirmation Successful"
      primaryHref="/login"
      primaryLabel="Sign In"
      secondaryHref="/"
      secondaryLabel="Back to Home"
    >
      Your email has been confirmed and your account is ready. You can now sign in and start booking
      appointments or shopping.
    </SuccessScreen>
  );
}
