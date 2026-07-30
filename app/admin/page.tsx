import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/supabase/admin-check';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export const metadata = {
  title: 'Administrator Sign In',
  robots: { index: false, follow: false },
};

export default async function AdminGatePage() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect('/admin/overview');
  }

  return <AdminLoginForm />;
}
