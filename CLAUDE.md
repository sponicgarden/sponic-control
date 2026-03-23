# Sponic Garden — SponicControl

Property management platform for Sponic Garden Warsaw.
Live at: https://sponicgarden.com

## Tech Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Supabase (auth, database, edge functions)
- GitHub Pages (static export via GitHub Actions)
- Cloudflare Workers (D1, R2)

## QA Testing
Always use `/browse` (gstack) for QA testing and site dogfooding.
Test credentials in `test.config.json`:
- Email: testuser@sponicgarden.com
- Password: test1234
- Role: demo

## Key URLs
- Production: https://sponicgarden.com
- Intranet: https://sponicgarden.com/en/intranet
- Sign In: https://sponicgarden.com/en/signin
- Session API: https://claude-sessions.sponicgarden.workers.dev

## Deployment
Push to `main` → GitHub Actions builds → deploys to GitHub Pages.
Custom domain: sponicgarden.com (DNS on Cloudflare wingsiebird account).

## Credentials
All secrets in Bitwarden collection: DevOps-sponicgarden (ALPU.CA org).
See `emailoperations.md` in docs/ and `.env.example` for service reference.

## Supabase
- Project: SponicControl (xumcmantignrocihtrdx)
- Region: West US (Oregon)
- Admin user: rahulioson@gmail.com (oracle role)
