# Sponic Garden — SponicControl

Property management platform for Sponic Garden Warsaw.
Live at: https://in.sponicgardens.com

## Tech Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Supabase (auth, database, edge functions)
- Cloudflare Pages (auto-deploy via GitHub integration)
- Cloudflare Workers (D1, R2)

## QA Testing
Always use `/browse` (gstack) for QA testing and site dogfooding.
Test credentials in `test.config.json`:
- Email: testuser@sponicgarden.com
- Password: test1234
- Role: demo

## Key URLs
- Production: https://in.sponicgardens.com
- Intranet: https://in.sponicgardens.com/en/intranet
- Sign In: https://in.sponicgardens.com/en/signin
- Session API: https://claude-sessions.sponicgarden.workers.dev

## Deployment
Push to `main` → Cloudflare Pages auto-deploys via GitHub integration (~1-3 min).
GitHub Actions runs CI in parallel (`tsc --noEmit` + `lint` + `build`) as a pre-deploy guard but does not deploy itself.
Custom domain: in.sponicgardens.com (DNS on Cloudflare wingsiebird account).
Note: the bare `sponicgarden.com` (no `s`) is a separate marketing site, not this app.

## Credentials
All secrets in Bitwarden collection: DevOps-sponicgarden (ALPU.CA org).
See `emailoperations.md` in docs/ and `.env.example` for service reference.

## Supabase
- Project: SponicControl (xumcmantignrocihtrdx)
- Region: West US (Oregon)
- Admin user: rahulioson@gmail.com (oracle role)
