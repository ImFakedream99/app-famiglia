import { getSupabaseClient } from './supabase';

export interface AppFamily {
  familyId: string;
  familyName: string;
  memberRole: 'owner' | 'member';
  displayName: string;
}

export async function getCurrentSession() {
  const client = getSupabaseClient();
  if (!client) return { session: null, error: new Error('Supabase non configurato') };
  return client.auth.getSession();
}

export async function signIn(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Servizio account non configurato.');
  const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, displayName: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Servizio account non configurato.');
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim() } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = getSupabaseClient();
  if (client) await client.auth.signOut();
  localStorage.removeItem('famiglia_family_id');
  localStorage.removeItem('famiglia_family_name');
  localStorage.removeItem('famiglia_display_name');
}

export async function getMyFamily(): Promise<AppFamily | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.rpc('get_my_app_family');
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.family_id) return null;
  const family: AppFamily = {
    familyId: row.family_id,
    familyName: row.family_name,
    memberRole: row.member_role,
    displayName: row.display_name,
  };
  persistFamily(family);
  return family;
}

export async function createFamily(name: string, displayName: string): Promise<AppFamily> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Servizio account non configurato.');
  const { data, error } = await client.rpc('create_app_family', {
    p_name: name.trim(),
    p_display_name: displayName.trim(),
  });
  if (error) throw error;
  const family = await getMyFamily();
  if (!family || family.familyId !== data) throw new Error('Nucleo creato, ma non è stato possibile caricare il profilo.');
  return family;
}

export async function createFamilyInvite(familyId: string, expiresHours = 168): Promise<string> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Servizio account non configurato.');
  const { data, error } = await client.rpc('create_app_invite', {
    p_family_id: familyId,
    p_expires_hours: expiresHours,
  });
  if (error) throw error;
  return data as string;
}

export async function acceptFamilyInvite(token: string, displayName: string): Promise<AppFamily> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Servizio account non configurato.');
  const { data, error } = await client.rpc('accept_app_invite', {
    p_token: token.trim(),
    p_display_name: displayName.trim(),
  });
  if (error) throw error;
  const family = await getMyFamily();
  if (!family || family.familyId !== data) throw new Error('Invito accettato, ma non è stato possibile caricare il nucleo.');
  return family;
}

export function persistFamily(family: AppFamily) {
  localStorage.setItem('famiglia_family_id', family.familyId);
  localStorage.setItem('famiglia_family_name', family.familyName);
  localStorage.setItem('famiglia_display_name', family.displayName);
  localStorage.setItem('famiglia_member_role', family.memberRole);
}

export function getInviteTokenFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get('invite')?.trim() || null;
  } catch {
    return null;
  }
}

export function clearInviteTokenFromUrl() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('invite');
    window.history.replaceState({}, document.title, url.toString());
  } catch {
    // Ignore malformed/local URLs.
  }
}
