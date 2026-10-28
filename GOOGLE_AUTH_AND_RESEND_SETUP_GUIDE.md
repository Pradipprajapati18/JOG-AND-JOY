# Full-Stack Setup Master Guide: Google OAuth & Resend SMTP (with cPanel DNS & Supabase Auth)

> **Purpose:** This document provides an end-to-end, reusable blueprint for configuring **Google Authentication** via Google Cloud Console and **Transactional Email / Password Reset** via Resend with cPanel DNS in any web application powered by Supabase. Keep this guide as a reference for all current and future projects.

---

## Table of Contents
1. [Part 1: Google Cloud Console OAuth Setup (Start to End)](#part-1-google-cloud-console-oauth-setup)
2. [Part 2: Resend Custom SMTP & cPanel DNS Setup (Start to End)](#part-2-resend-custom-smtp--cpanel-dns-setup)
3. [Part 3: Password Reset Flow & Code Architecture](#part-3-password-reset-flow--code-architecture)
4. [Part 4: Troubleshooting & Verification Checklist](#part-4-troubleshooting--verification-checklist)

---

## Part 1: Google Cloud Console OAuth Setup

Google OAuth enables users to authenticate in one click using their Google accounts. The flow works by connecting your Google Cloud project to your Supabase Auth provider.

### Step 1.1: Create Project & Configure OAuth Consent Screen
1. Open the **Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Click the project dropdown at the top and click **New Project**. Name it your project name (e.g., *MyStore Production*).
3. In the left navigation menu, go to **APIs & Services** &rarr; **OAuth consent screen**.
4. Select User Type: **External** &rarr; Click **Create**.
5. Fill in the required fields:
   - **App name:** Your Application Display Name (e.g., *Jog & Joy*)
   - **User support email:** Your admin email address
   - **Developer contact information:** Your admin email address
6. Click **Save and Continue** through the **Scopes** screen (default scopes `email`, `profile`, `openid` are already selected).
7. On the **Test users** screen, add your personal/testing Google email address while the app is in "Testing" mode. Click **Save and Continue**.

### Step 1.2: Create OAuth 2.0 Client Credentials
1. In the left menu, click **Credentials** &rarr; Click **+ CREATE CREDENTIALS** &rarr; Select **OAuth client ID**.
2. **Application type:** Select **Web application**.
3. **Name:** Enter `Web Client`.
4. **Authorized JavaScript origins:** Add your local and production domains:
   - `http://localhost:5173`
   - `https://yourdomain.com`
5. **Authorized redirect URIs (Crucial):** Supabase uses a standardized callback URL format for every project:
   ```text
   https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
   ```
   *(Example: `https://vaxdvemqlsawdxwmyxvu.supabase.co/auth/v1/callback`)*
6. Click **Create**. A modal will display your **Client ID** and **Client Secret**. Copy both.

### Step 1.3: Enable Google in Supabase Dashboard
1. Open your **Supabase Dashboard** &rarr; Click **Authentication** &rarr; **Sign In / Providers**.
2. Locate **Google** in the provider list and click to expand it.
3. Toggle **Enable Sign in with Google** to **ON**.
4. Paste your **Client ID** and **Client Secret** from Google Cloud Console.
5. Click **Save**.

### Step 1.4: Frontend Implementation Code
In your React/Frontend authentication context:

```javascript
// Initiating Google Sign In with Supabase JS SDK:
const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
};
```

---

## Part 2: Resend Custom SMTP & cPanel DNS Setup

Resend provides world-class email deliverability. To send emails from your own domain (e.g., `noreply@yourdomain.com`), you must verify domain ownership by adding DNS records in cPanel.

### Step 2.1: Add Domain in Resend Dashboard
1. Create an account and log in at [https://resend.com/](https://resend.com/)
2. In the left sidebar, click **Domains** &rarr; click **+ Add Domain**.
3. Enter your root domain (e.g., `jognjoy.com`) &rarr; Select region (default: US East) &rarr; Click **Add**.
4. Resend will display a table containing **DKIM**, **SPF**, and **DMARC** DNS records.

### Step 2.2: Add DNS Records in cPanel Zone Editor
1. Log in to your hosting **cPanel** dashboard &rarr; Search for **Zone Editor**.
2. Next to your domain, click **Manage** &rarr; Click the blue **+ Add Record** button.

| Record | Type | Zone Name (in cPanel) | Value / Destination |
| :--- | :--- | :--- | :--- |
| **DKIM** | `TXT` | `resend._domainkey`<br>*(cPanel auto-appends `.yourdomain.com.`)* | Paste long string from Resend:<br>`k=rsa; p=MIGf...` |
| **SPF** | `TXT` | `bounces`<br>*(cPanel auto-appends `.yourdomain.com.`)* | `v=spf1 include:amazonses.com ~all` |
| **MX (Bounce)** | `MX` | `bounces` *(Priority: 10)* | `feedback-smtp.us-east-1.amazonses.com` |
| **DMARC** | `TXT` | `_dmarc`<br>*(cPanel auto-appends `.yourdomain.com.`)* | `v=DMARC1; p=none;` |

3. Return to Resend and click **Verify Records**. Statuses will turn from *Pending* to green *Verified* (typically takes 5 to 15 minutes).

### Step 2.3: Generate Resend API Key
1. In Resend left menu, click **API Keys** &rarr; Click **Create API Key**.
2. Name: `Supabase SMTP` &rarr; Permission: **Full access** &rarr; Click **Add**.
3. Copy the API key starting with `re_...`. You will use this as your SMTP password.

### Step 2.4: Connect Resend SMTP inside Supabase
1. In Supabase Dashboard, click **Authentication** &rarr; under **NOTIFICATIONS** click **Emails**.
2. Toggle **Enable custom SMTP** to **ON**.
3. Enter the following exact values:

| Supabase Field | Exact Value to Enter | Explanation / Warning |
| :--- | :--- | :--- |
| **Sender email address** | `noreply@yourdomain.com` | Must be on your verified domain. **Do NOT use @gmail.com!** |
| **Sender name** | `Your Store Name` | Shown in the recipient's inbox (e.g. *Jog & Joy Kids*). |
| **Host** | `smtp.resend.com` | Official Resend SMTP host. |
| **Port number** | `465` | Port 465 (SSL/TLS) or 587 (STARTTLS). |
| **Username** | `resend` | **Must be literally `resend` with a 'd' (NOT 'resent').** |
| **Password** | `re_xxxxxxxxxxxxxxxxxxxx` | Your Resend API Key. |

4. Click **Save changes**.

---

## Part 3: Password Reset Flow & Code Architecture

The password reset architecture operates across three distinct touchpoints:

```
[1. User Requests Reset]
       │
       ▼
supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/reset-password` })
       │
       ▼
[2. Supabase dispatches email via Resend SMTP]
       │
       ▼
[3. User clicks link in email]
       │
       ▼
Opens /reset-password (authenticated recovery session established)
       │
       ▼
supabase.auth.updateUser({ password: newPassword })
       │
       ▼
[4. Password updated successfully in Supabase!]
```

### Supabase Redirect URLs Configuration:
1. In Supabase Dashboard &rarr; **Authentication** &rarr; **URL Configuration**.
2. **Site URL:** `http://localhost:5173` (or production domain).
3. **Redirect URLs:** Add both wildcards and exact routes:
   - `http://localhost:5173/**`
   - `http://localhost:5173/reset-password`
   - `https://yourdomain.com/reset-password`
4. Click **Save**.

---

## Part 4: Troubleshooting & Verification Checklist

| Symptom / Error | Root Cause | Immediate Fix |
| :--- | :--- | :--- |
| **Auth 535 / Invalid Login** | Typo in Resend username (e.g. `resent` with 't'). | Change username to **`resend`** (with a 'd'). |
| **Cannot send from @gmail.com** | Resend blocks sending from free Gmail addresses. | Use a sender from your verified domain (e.g. `noreply@yourdomain.com`). |
| **redirect_uri_mismatch (Google)** | Redirect URI in Google Cloud does not match Supabase callback. | Ensure `https://<project>.supabase.co/auth/v1/callback` is added in Google Console. |
| **Reset link opens home page** | Missing `/reset-password` in Supabase Redirect URLs. | Add `http://localhost:5173/reset-password` to Supabase URL Configuration. |
| **DNS records still 'Pending'** | DNS cache or typos in Zone Editor. | Verify record name in cPanel doesn't double-append domain (e.g. `_dmarc.domain.com.domain.com`). |

---

*Document compiled and generated automatically for Jog & Joy project archive.*
