import { createClient } from './client';
import { SUPABASE_URL } from './config';

export async function createUserAsAdmin(params: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  role: 'client' | 'staff' | 'admin';
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, error: 'You must be signed in as an administrator to do this.' };
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(params),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    return { success: false, error: 'Unexpected response from the server.' };
  }

  if (!res.ok) {
    return { success: false, error: data?.error ?? 'Something went wrong creating this user.' };
  }

  return { success: true };
}
