import { getSupabaseClient } from './supabase';

export interface AppUpdateInfo {
  version: string;
  commit_sha: string;
  commit_message: string;
  commit_url: string;
  download_url: string;
  updated_at: string;
}

const CURRENT_BUILD_COMMIT = String(import.meta.env.VITE_BUILD_COMMIT || '').trim();

export function getCurrentBuildCommit(): string {
  return CURRENT_BUILD_COMMIT;
}

export async function checkForAppUpdate(): Promise<AppUpdateInfo | null> {
  if (!CURRENT_BUILD_COMMIT) return null;

  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('app_updates')
      .select('version, commit_sha, commit_message, commit_url, download_url, updated_at')
      .eq('id', 'current')
      .maybeSingle();

    if (error || !data?.commit_sha) return null;
    if (data.commit_sha === CURRENT_BUILD_COMMIT) return null;

    return data as AppUpdateInfo;
  } catch {
    return null;
  }
}
