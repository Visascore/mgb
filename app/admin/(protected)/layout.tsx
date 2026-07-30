import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/supabase/admin-check';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileBar from '@/components/admin/AdminMobileBar';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen bg-offwhite">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminMobileBar />
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
