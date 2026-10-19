// Builds the static site into /dist from /content. No dependencies: `node build.js`
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "dist");
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "content", f), "utf8"));
const shared = read("shared.json");
const langs = { en: read("en.json"), fr: read("fr.json") };

const ROUTES = {
  en: { home: "", about: "about/", experiences: "experiences/" },
  fr: { home: "fr/", about: "fr/qui-suis-je/", experiences: "fr/experiences/" },
};

const esc = (s = "") =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const paras = (s = "") =>
  String(s).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("\n");
const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function page({ lang, key, body }) {
  const t = langs[lang];
  const route = ROUTES[lang][key];
  const depth = route.split("/").filter(Boolean).length;
  const up = depth ? "../".repeat(depth) : "./";
  const href = (l, k) => up + ROUTES[l][k];
  const img = (src) => up + String(src || "").replace(/^\//, "");
  const other = lang === "fr" ? "en" : "fr";
  const title = key === "home" ? t.meta.title : `${t.nav[key]} — Paris with Agathe`;
  const nav = ["home", "about", "experiences"]
    .map((k) => `<a href="${href(lang, k)}"${k === key ? ' aria-current="page"' : ""}>${esc(t.nav[k])}</a>`)
    .join("");

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(t.meta.description)}">
<link rel="alternate" hreflang="en" href="${href("en", key)}">
<link rel="alternate" hreflang="fr" href="${href("fr", key)}">
<link rel="alternate" hreflang="x-default" href="${href("en", key)}">
<link rel="preload" href="${up}assets/fonts/cormorant-garamond-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${up}assets/style.css">
</head>
<body class="page-${key}">
<header class="site-header">
  <a class="wordmark" href="${href(lang, "home")}">Paris <em>with</em> Agathe</a>
  <nav class="nav">${nav}<a href="#contact">${esc(t.nav.contact)}</a></nav>
  <a class="lang" href="${href(other, key)}" hreflang="${other}" lang="${other}">${other.toUpperCase()}</a>
</header>
<main>
${body({ t, href, img })}
</main>
<footer class="site-footer" id="contact">
  <p class="eyebrow">${esc(t.nav.contact)}</p>
  <h2 class="footer-title">${esc(t.contact.title)}</h2>
  <a class="button" href="mailto:${esc(shared.email)}">${esc(t.contact.cta)}</a>
  <ul class="footer-links">
    <li><a href="mailto:${esc(shared.email)}">${esc(shared.email)}</a></li>
    ${shared.phone ? `<li><a href="tel:${esc(shared.phone.replace(/\s/g, ""))}">${esc(shared.phone)}</a></li>` : ""}
    ${shared.instagram ? `<li><a href="${esc(shared.instagram)}" target="_blank" rel="noopener">Instagram</a></li>` : ""}
  </ul>
  <p class="fineprint">© ${new Date().getFullYear()} Paris with Agathe</p>
</footer>
</body>
</html>
`;
  const file = path.join(OUT, route, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const home = ({ t, href, img }) => {
  const h = t.home, i = shared.images;
  return `
<section class="hero">
  <img class="hero-bg" src="${img(i.home_hero)}" alt="">
  <div class="hero-content">
    <img class="hero-logo" src="${img(shared.logo)}" alt="Paris with Agathe">
    <h1>${esc(h.title)}</h1>
    <p class="hero-sub">${esc(h.eyebrow)}</p>
  </div>
  <a class="hero-scroll" href="#intro" aria-label="Scroll">↓</a>
</section>
<section class="intro grid" id="intro">
  <p class="lead">${esc(h.lead)}</p>
  <div class="prose">${paras(h.body)}</div>
</section>
<section class="triptych">
  <figure><img src="${img(i.home_1)}" alt="" loading="lazy"></figure>
  <figure><img src="${img(i.home_2)}" alt="" loading="lazy"></figure>
  <figure><img src="${img(i.home_3)}" alt="" loading="lazy"></figure>
</section>
<section class="ways"><p>${esc(h.ways)}</p></section>
<section class="signature">
  <blockquote>${esc(h.signature)}</blockquote>
  <a class="link-arrow" href="${href(t === langs.fr ? "fr" : "en", "experiences")}">${esc(h.cta)} <span aria-hidden="true">→</span></a>
</section>`;
};

const about = ({ t, img }) => {
  const a = t.about;
  return `
<section class="about grid">
  <figure class="portrait"><img src="${img(shared.images.about_portrait)}" alt="Agathe"></figure>
  <div>
    <p class="eyebrow">${esc(a.eyebrow)}</p>
    <h1>${esc(a.title)}</h1>
    <div class="prose">${paras(a.body)}</div>
  </div>
</section>
<section class="signature"><blockquote>${esc(a.quote)}</blockquote></section>`;
};

const experiences = ({ t, img }) => {
  const e = t.experiences, pics = shared.images.experiences || [];
  const items = (e.items || []).map((it, n) => `
  <article class="exp">
    <figure><img src="${img(pics[n % pics.length])}" alt="" loading="lazy"></figure>
    <div class="exp-text">
      <span class="numeral">${roman[n] || n + 1}</span>
      <h2>${esc(it.title)}</h2>
      ${paras(it.text)}
    </div>
  </article>`).join("");
  return `
<section class="page-head">
  <p class="eyebrow">${esc(e.eyebrow)}</p>
  <h1>${esc(e.title)}</h1>
  <p class="subtitle">${esc(e.subtitle)}</p>
</section>
<section class="exp-list">${items}
</section>`;
};

fs.rmSync(OUT, { recursive: true, force: true });
for (const lang of Object.keys(langs)) {
  page({ lang, key: "home", body: home });
  page({ lang, key: "about", body: about });
  page({ lang, key: "experiences", body: experiences });
}
fs.cpSync(path.join(ROOT, "assets"), path.join(OUT, "assets"), { recursive: true });
fs.cpSync(path.join(ROOT, "images"), path.join(OUT, "images"), { recursive: true });
console.log("Built → dist/");
