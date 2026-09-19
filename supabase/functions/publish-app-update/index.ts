import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Payload = {
  repository: string;
  version: string;
  commit_sha: string;
  commit_message?: string;
  commit_url: string;
  download_url: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const auth = req.headers.get("authorization") ?? "";
    const githubToken = auth.replace(/^Bearer\s+/i, "").trim();
    if (!githubToken) throw new Error("Missing authorization token");

    const payload = (await req.json()) as Payload;
    if (payload.repository !== "ImFakedream99/app-famiglia") throw new Error("Repository non autorizzato.");
    if (!/^[0-9a-f]{40}$/i.test(payload.commit_sha)) throw new Error("Commit SHA non valido.");
    if (!new RegExp("^https://github\\.com/ImFakedream99/app-famiglia/commit/[0-9a-f]{40}$", "i").test(payload.commit_url)) {
      throw new Error("Commit URL non valido.");
    }
    if (!new RegExp("^https://github\\.com/ImFakedream99/app-famiglia/releases/download/[^/]+/Famiglia-Installer-[^/]+\\.exe$", "i").test(payload.download_url)) {
      throw new Error("Download URL non valido.");
    }

    const githubHeaders = {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Famiglia-App-Update-Publisher",
    };

    const commitResponse = await fetch(
      `https://api.github.com/repos/ImFakedream99/app-famiglia/commits/${payload.commit_sha}`,
      { headers: githubHeaders },
    );
    if (!commitResponse.ok) throw new Error("Commit GitHub non trovato o token non valido.");

    const commit = await commitResponse.json();
    const expectedMessage = String(commit?.commit?.message ?? "").split("\n")[0];
    if (payload.commit_message && expectedMessage !== payload.commit_message) {
      throw new Error("Commit message non corrisponde al commit GitHub.");
    }

    const assetResponse = await fetch(payload.download_url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": "Famiglia-App-Update-Publisher" },
    });
    if (!assetResponse.ok) {
      throw new Error(`Installer GitHub non disponibile: HTTP ${assetResponse.status}`);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { error } = await admin.from("app_updates").upsert({
      id: "current",
      version: payload.version,
      commit_sha: payload.commit_sha,
      commit_message: payload.commit_message ?? expectedMessage,
      commit_url: payload.commit_url,
      download_url: payload.download_url,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Errore inatteso",
    }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});