import { createClient } from "@supabase/supabase-js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const authHeader = event.headers.authorization || "";
  const jwt = authHeader.replace("Bearer ", "");
  if (!jwt) {
    return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.VITE_APP_URL || "http://localhost:5173";

  // Verify the calling user's JWT using the anon client
  const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: { user }, error: authError } = await anonClient.auth.getUser(jwt);
  if (authError || !user) {
    return { statusCode: 401, body: JSON.stringify({ error: "Invalid session" }) };
  }

  const { email } = JSON.parse(event.body || "{}");
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Email required" }) };
  }

  // Use service role to send invite — bypasses RLS and sends the email
  const adminClient = createClient(supabaseUrl, serviceKey);
  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/accept-invite`,
  });

  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
}
