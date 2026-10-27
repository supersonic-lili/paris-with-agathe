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
const logo = (src) => `<span class="logo"><img src="${esc(src)}" alt="Paris with Agathe"></span>`;

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
<link rel="preload" href="${up}assets/fonts/whimsicalromancescript-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${up}assets/fonts/quicksand-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${up}assets/style.css">
</head>
<body class="page-${key}">
<header class="site-header">
  <a class="brand" href="${href(lang, "home")}" aria-label="Paris with Agathe">${logo(img(shared.wordmark || "/images/wordmark-placeholder.svg"))}</a>
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
    <h1 class="hero-logo">${logo(img(shared.logo))}</h1>
    <h2 class="hero-sub">${esc(String(h.title || "").replace(/[.。]\s*$/, ""))}</h2>
  </div>
  <a class="hero-scroll" href="#intro" aria-label="Scroll">↓</a>
</section>
<section class="intro" id="intro">
  <p>${esc(h.lead)}</p>
</section>
<section class="triptych">
  <figure><img src="${img(i.home_1)}" alt="" loading="lazy"></figure>
  <figure><img src="${img(i.home_2)}" alt="" loading="lazy"></figure>
  <figure><img src="${img(i.home_3)}" alt="" loading="lazy"></figure>
</section>
<section class="intro intro-after">
  ${paras(h.body)}
</section>
<section class="closing">
  <p class="ways">${esc(h.ways)}</p>
  <h2>${esc(h.signature)}</h2>
  <a class="link-arrow" href="${href(t === langs.fr ? "fr" : "en", "experiences")}">${esc(h.cta)} <span aria-hidden="true">→</span></a>
</section>`;
};

const about = ({ t, img }) => {
  const a = t.about;
  return `
<section class="about">
  <figure class="portrait"><img src="${img(shared.images.about_portrait)}" alt="Agathe"></figure>
  <div class="about-text">
    <h1>${esc(a.title)}</h1>
    <div class="prose">${paras(a.body)}</div>
  </div>
</section>
<section class="quote"><h2>${esc(a.quote)}</h2></section>`;
};

const experiences = ({ t, img }) => {
  const e = t.experiences, pics = shared.images.experiences || [], galleries = shared.images.experience_galleries || [];
  const photosFor = (n) => {
    const g = galleries[n];
    const list = g ? [g.photo_1, g.photo_2, g.photo_3, g.photo_4].filter(Boolean) : [];
    return list.length ? list : (pics.length ? [pics[n % pics.length]] : []);
  };
  const items = (e.items || []).map((it, n) => `
  <article class="exp">
    <div class="exp-gallery">${photosFor(n).map((src) => `<figure><img src="${img(src)}" alt="" loading="lazy"></figure>`).join("")}</div>
    <div class="exp-text">
      <h2>${esc(it.title)}</h2>
      ${paras(it.text)}
    </div>
  </article>`).join("");
  return `
<h1 class="visually-hidden">${esc(e.title)}</h1>
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
