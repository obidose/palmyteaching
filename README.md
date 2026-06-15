# Palmy ED Teaching

Static site for ED teaching attendance — no login, no build step.

## Live site

- **Sign in (manual code):** [teaching.palmyed.com](https://teaching.palmyed.com)
- **QR slide (facilitators):** [teaching.palmyed.com/qr/](https://teaching.palmyed.com/qr/) — use with `?s=CODE&title=...&date=...&speaker=...`

## Local development

```bash
python -m http.server 8000
```

- http://localhost:8000/ — code entry
- http://localhost:8000/qr/?s=K7M2&title=Test&date=Thu%208%20Jun&speaker=Dr%20Smith — QR slide

## Deploy

GitHub Pages from the `main` branch, site root. Custom domain via `CNAME`.

```bash
git push origin main
```

Ensure GitHub Pages is enabled: **Settings → Pages → Deploy from branch → main → / (root)**.

DNS: CNAME `teaching` → `obidose.github.io`

## Configuration

Microsoft Forms pre-fill URL prefix is in [`form-config.js`](form-config.js).

## Cloudflare redirects (palmyed.com handbook)

Configure these redirect rules on the handbook domain so old links keep working. Bypass Zero Trust for these paths if redirects are blocked.

| Old path | Redirect to |
|----------|-------------|
| `/attend`, `/attend/*` | `https://teaching.palmyed.com/` |
| `/teaching/qr`, `/teaching/qr/*` | `https://teaching.palmyed.com/qr/` + query string |
| `/teaching/go`, `/teaching/go/*` | `https://teaching.palmyed.com/?s=` + code from query string |

Do **not** put `teaching.palmyed.com` behind Zero Trust.
