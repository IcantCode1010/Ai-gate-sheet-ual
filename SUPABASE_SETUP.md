# Supabase Setup Walkthrough
### HMC Gate Sheet — Multi-User Configuration

---

## What You're Setting Up

Supabase provides three things for this app:
- **Database** — stores shift data and user profiles
- **Auth** — handles login, invite emails, and sessions
- **Realtime** — powers the live status board

Estimated time: ~15 minutes

---

## Step 1 — Create a Supabase Account & Project

1. Go to **https://supabase.com** and click **Start your project**
2. Sign in with GitHub (recommended) or create an account
3. Click **New project**
4. Fill in:
   - **Organization** — create one if prompted (e.g. "HMC Ops")
   - **Project name** — `hmc-gate-sheet`
   - **Database password** — generate a strong one and **save it somewhere safe**
   - **Region** — pick the closest to your location
5. Click **Create new project**
6. Wait ~2 minutes for the project to finish provisioning

---

## Step 2 — Create the Database Tables

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste the entire block below and click **Run** (▶)

```sql
-- Profiles table (stores display names for each user)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "All authenticated users can read profiles"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can only write their own profile"
  on profiles for all
  using (auth.uid() = id);


-- Shifts table (stores each user's gate sheet data)
create table shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  shift_type text default '',
  coordinator_name text default '',
  notes text default '',
  entries jsonb default '[]',
  updated_at timestamptz default now()
);

alter table shifts enable row level security;

create policy "All authenticated users can read all shifts"
  on shifts for select
  using (auth.role() = 'authenticated');

create policy "Users can only write their own shifts"
  on shifts for all
  using (auth.uid() = user_id);
```

4. You should see **Success. No rows returned** — that's correct
5. To verify, click **Table Editor** in the sidebar — you should see `profiles` and `shifts` listed

---

## Step 3 — Get Your API Keys

1. In the left sidebar, click **Project Settings** (gear icon at the bottom)
2. Click **API** under Configuration
3. You'll see two keys — copy both and keep them handy:

| Key | Where to find it | Used for |
|---|---|---|
| **Project URL** | Top of the page (`https://xxxx.supabase.co`) | Both frontend and backend |
| **anon / public key** | Under "Project API keys" | Frontend — safe to expose |
| **service_role key** | Under "Project API keys" → click **Reveal** | Backend only — keep secret |

> ⚠️ **Never share or commit the service_role key.** It bypasses all security rules.

---

## Step 4 — Configure Auth Settings

This tells Supabase where to send users after they click an invite link.

1. In the left sidebar, click **Authentication**
2. Click **URL Configuration** (under Configuration)
3. Set **Site URL** to your live app URL:
   - If deployed on Netlify: `https://your-site-name.netlify.app`
   - For local testing: `http://localhost:5173`
4. Under **Redirect URLs**, click **Add URL** and add:
   - `https://your-site-name.netlify.app/accept-invite`
   - `http://localhost:5173/accept-invite` (for local testing)
5. Click **Save**

---

## Step 5 — Disable Public Signups (Invite Only)

This ensures only people you invite can create accounts.

1. Still in **Authentication**, click **Providers**
2. Click on **Email**
3. Toggle **Enable Email Signup** to **OFF**
4. Make sure **Enable Email Confirmations** is **ON** (so invite emails work)
5. Click **Save**

> Users can now only join via an invite link — they cannot self-register.

---

## Step 6 — Create Your Own Account (First User)

Since signups are disabled, you need to create your account through Supabase directly.

1. In **Authentication**, click **Users**
2. Click **Invite user**
3. Enter your email address and click **Send invitation**
4. Check your email — you'll get an invite link
5. Click the link — it will open your app's `/accept-invite` page
6. Enter your name and set a password
7. You're in — this is your admin account

> After this, you can invite others directly from inside the app using the **+ Invite** button in the top bar.

---

## Step 7 — Add Environment Variables

### For Local Development

Open `hmc-gate-sheet/.env` and add the three new lines:

```
ANTHROPIC_API_KEY=sk-ant-...          # already here
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VITE_APP_URL=http://localhost:5173
```

Restart your dev server after saving.

### For Netlify Deployment

1. Go to your site in the **Netlify dashboard**
2. Click **Site configuration** → **Environment variables**
3. Click **Add a variable** for each of the following:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role key — keep secret) |
| `VITE_APP_URL` | `https://your-site-name.netlify.app` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` (already set if deployed before) |

4. After adding all variables, click **Trigger deploy** → **Deploy site** to rebuild with the new vars

---

## Step 8 — Enable Realtime on the Shifts Table

This powers the live status board.

1. In the left sidebar, click **Database** → **Replication**
2. Under **Supabase Realtime**, find the `shifts` table
3. Toggle it **ON**
4. Do the same for the `profiles` table

---

## Verification Checklist

Once everything is configured, test these in order:

- [ ] Open the app — you should see a **Sign In** page instead of the gate sheet
- [ ] Log in with the account you created in Step 6
- [ ] The gate sheet loads and the sync dot in the top bar turns **green**
- [ ] Fill in a few fields — refresh the page — data comes back (loading from Supabase)
- [ ] Click **+ Invite** in the top bar — enter a colleague's email — they receive an invite email
- [ ] Open the app in a second browser window logged in as a different user — click **Status** — both users appear on the board
- [ ] Click **History** — past shifts appear

---

## Troubleshooting

**Sync dot stays orange/red**
→ Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in your `.env` and the server was restarted.

**Invite emails not arriving**
→ Check spam. Also verify the Redirect URL in Step 4 exactly matches your app URL.

**"Invalid or expired invite link" on accept page**
→ The invite token expires after 24 hours. Send a new invite from the app.

**Status board shows no other users**
→ Verify Realtime is enabled on the `shifts` table (Step 8). Both users must be actively logged in.

**"RLS policy violation" errors in the console**
→ The SQL from Step 2 may not have run fully. Open the SQL Editor and run it again — it's safe to re-run.

---

*HMC Operations · Internal Use Only*
