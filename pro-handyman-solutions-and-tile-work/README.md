# Home-service website template

One-page, call-first site for local trades. The demo business ("Bayline Plumbing Co.") is fictional.

## Personalize for a client
1. Copy this folder, then edit `client.json` (name, phone, city, license, colors, services, areas, reviews, FAQs, offer).
2. Run `node build.js`. It writes `index.html`. Open it in a browser to check.
3. Swap in the client's real Google rating, review count, reviews and license number. Never publish made-up reviews.

Service icons available: drop, drain, heater, pipe, sewer, alarm, bolt, fan, home.
For a non-plumbing client, also set `"schemaType"` (e.g. `"Electrician"`, `"HVACBusiness"`, `"RoofingContractor"`).

## Deploy (Netlify, free tier)
1. Push the folder to a GitHub repo, then "Add new site > Import" in Netlify. `netlify.toml` is already set up.
2. In Site settings > Environment variables, add the lead-delivery keys below. Then point the client's domain at the site.

## Lead delivery (form to email + text)
The form posts to `netlify/functions/lead.js`, which sends each request by email and by text. Either channel works on its own.

| Variable | What it is |
|---|---|
| `RESEND_API_KEY` | From resend.com (free: 3,000 emails/mo) |
| `LEAD_EMAIL_TO` | Business email(s), comma-separated |
| `LEAD_EMAIL_FROM` | Sender on a domain verified in Resend, e.g. `Leads <leads@clientdomain.com>` |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | From twilio.com |
| `TWILIO_FROM` | Your Twilio number, e.g. `+18135550100` |
| `LEAD_SMS_TO` | Business cell(s), comma-separated, e.g. `+18135550142` |

Text costs: a Twilio number is about $1.15/mo plus under 1¢ per text, and US texting requires a one-time A2P 10DLC registration (roughly $20 total, takes a few days). One Twilio account can serve every client. Build this into the $100-200/mo maintenance fee.

Spam: a hidden honeypot field drops most bots. Add Cloudflare Turnstile if a client gets hit.

## What's built in for conversion
- Phone number in the top bar, header, hero, emergency strip, final CTA and a sticky Call / Free Quote bar on phones.
- Quote form above the fold on desktop; every "Free Quote" button scrolls to it and focuses the first field.
- Required fields: first name, last name, phone (auto-formatted), email, problem, "Are you a new customer?" Yes/No.
- Trust signals near the CTAs: Google rating, license number, upfront pricing. New-customer offer ties into the Yes/No question.
- LocalBusiness schema for Google, fast single file, no frameworks.
