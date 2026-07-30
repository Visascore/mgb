import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
      <aside className="md:col-span-1">
        <nav className="flex flex-row md:flex-col gap-2 flex-wrap">
          <Link href="/account" className="font-body text-sm text-charcoal hover:text-golddeep px-3 py-2 rounded-lg hover:bg-beige/60">
            Upcoming Appointments
          </Link>
          <Link href="/account/orders" className="font-body text-sm text-charcoal hover:text-golddeep px-3 py-2 rounded-lg hover:bg-beige/60">
            Orders
          </Link>
          <Link href="/account/profile" className="font-body text-sm text-charcoal hover:text-golddeep px-3 py-2 rounded-lg hover:bg-beige/60">
            Profile
          </Link>
          <form action="/auth/signout" method="post">
            <SignOutButton />
          </form>
        </nav>
      </aside>
      <div className="md:col-span-3">{children}</div>
    </div>
  );
}

function SignOutButton() {
  return (
    <a href="/api/signout" className="font-body text-sm text-charcoal2/70 hover:text-charcoal px-3 py-2 rounded-lg hover:bg-beige/60">
      Sign Out
    </a>
  );
}
