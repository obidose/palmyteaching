# Deployment checklist — teaching.palmyed.com

GitHub Pages is enabled on **obidose/palmyteaching** (branch `main`, root `/`).  
Custom domain in repo: `teaching.palmyed.com` ([CNAME](CNAME)).

Until DNS is configured, the site is available at:  
https://obidose.github.io/palmyteaching/

---

## 1. Cloudflare DNS (you configure)

In **Cloudflare → palmyed.com → DNS**:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `teaching` | `obidose.github.io` | Proxied (orange cloud) OK |

Then in **GitHub → obidose/palmyteaching → Settings → Pages**:

- Confirm custom domain `teaching.palmyed.com` is verified
- Enable **Enforce HTTPS**

### Zero Trust

Ensure `teaching.palmyed.com` is **not** included in the Cloudflare Access application that protects `palmyed.com`. Staff must reach sign-in without login.

---

## 2. Cloudflare redirect rules (old handbook URLs)

**Rules → Redirect rules** on `palmyed.com` (run before Zero Trust if possible):

### Rule 1 — `/attend`

- **When:** URI Path equals `/attend` OR starts with `/attend/`
- **Then:** Static redirect to `https://teaching.palmyed.com/` (301)

### Rule 2 — `/teaching/qr`

- **When:** URI Path starts with `/teaching/qr`
- **Then:** Dynamic redirect to `concat("https://teaching.palmyed.com/qr/", http.request.uri.query)`  
  Or preserve query string via Cloudflare’s “Preserve query string” option → `https://teaching.palmyed.com/qr/`

### Rule 3 — `/teaching/go`

- **When:** URI Path starts with `/teaching/go`
- **Then:** Redirect to `https://teaching.palmyed.com/` preserving query string (`?s=CODE`)

If Zero Trust blocks redirects, add a **Bypass** policy for paths:  
`/attend*`, `/teaching/qr*`, `/teaching/go*`

---

## 3. Power Automate email templates

Update facilitator email links:

| Old | New |
|-----|-----|
| `https://palmyed.com/teaching/qr/?s=...&title=...` | `https://teaching.palmyed.com/qr/?s=...&title=...` |
| `https://palmyed.com/teaching/go/?s=...` | `https://teaching.palmyed.com/?s=...` |
| Spoken / printed: `palmyed.com/attend` | `teaching.palmyed.com` |

---

## 4. Verify

- [ ] https://teaching.palmyed.com/ — sign-in, no login wall
- [ ] https://teaching.palmyed.com/?s=K7M2 — auto-redirect to MS Form
- [ ] https://teaching.palmyed.com/qr/?s=K7M2&title=Test — QR slide + downloads
- [ ] https://palmyed.com/attend/ → teaching.palmyed.com
- [ ] https://palmyed.com/teaching/qr/?s=K7M2 → teaching.palmyed.com/qr/?s=K7M2
- [ ] Handbook Teaching page → Sign in & feedback button works

---

## Ongoing updates (teaching site)

```bash
git add -A && git commit -m "..." && git push origin main
```

No build step — GitHub Pages redeploys automatically.

## Ongoing updates (handbook)

```bash
mkdocs gh-deploy
```
