# Paris with Agathe — site vitrine

Static bilingual site (FR at `/`, EN at `/en/`), 3 pages, client-editable via Pages CMS. 100% free.

## Deploy (once, ~15 min)

1. **GitHub**: create a repo, upload this folder (including the hidden `.pages.yml`).
2. **Netlify** (or Cloudflare Pages): "Import from GitHub" → pick the repo.
   Build command `node build.js`, publish folder `dist` (already set in `netlify.toml`).
3. **Domain**: add the client's domain in Netlify → Domain settings (only paid item, ~€12/yr).
4. **Client access**: invite the client to the GitHub repo as a collaborator (she needs a free GitHub account).

## How the client edits

1. Go to **app.pagescms.org** → sign in with GitHub → open the repo.
2. Pick **Textes en français**, **Textes en anglais**, or **Photos & coordonnées**.
3. Edit, click **Save**. The site updates in about a minute.

In text fields, an empty line starts a new paragraph. Photos: upload JPG, ideally 2000px wide max.

## Files

- `content/fr.json`, `content/en.json` — all text
- `content/shared.json` — photos, e-mail, phone, Instagram
- `assets/style.css` — design (fonts self-hosted, GDPR-friendly)
- `build.js` — generates `dist/`, no dependencies
- `images/` — placeholders to replace
