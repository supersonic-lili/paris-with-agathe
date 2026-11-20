// Builds the static site into /dist from /content. No dependencies: `node build.js`
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "dist");
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "content", f), "utf8"));
const shared = read("shared.json");
const reviews = fs.existsSync(path.join(ROOT, "content", "reviews.json")) ? read("reviews.json") : {};
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

// Reviews — shown above the contact block on every page
function reviewsBlock(lang) {
  const r = reviews[lang] || {};
  const items = (r.items || []).filter((it) => it && it.text);
  if (!items.length) return "";
  const prev = lang === "fr" ? "Avis précédent" : "Previous review";
  const next = lang === "fr" ? "Avis suivant" : "Next review";
  return `<section class="reviews" aria-label="${esc(r.title || "Reviews")}">
  <div class="reviews-head">
    ${r.title ? `<h2>${esc(r.title)}</h2>` : ""}
    <div class="reviews-nav">
      <button type="button" class="reviews-btn" data-dir="-1" aria-label="${prev}">←</button>
      <button type="button" class="reviews-btn" data-dir="1" aria-label="${next}">→</button>
    </div>
  </div>
  <div class="reviews-track" tabindex="0">
    ${items.map((it) => `<figure class="review">
      <blockquote>${paras(it.text)}</blockquote>
      <button type="button" class="review-more" hidden>${lang === "fr" ? "Lire la suite" : "Read more"}</button>
      <figcaption><strong>${esc(it.name || "")}</strong>${it.origin ? ` · ${esc(it.origin)}` : ""}</figcaption>
    </figure>`).join("\n    ")}
  </div>
</section>
<script>
(function () {
  var s = document.currentScript.previousElementSibling, t = s.querySelector(".reviews-track");
  s.querySelectorAll(".review").forEach(function (c) {
    var q = c.querySelector("blockquote"), m = c.querySelector(".review-more");
    if (q.scrollHeight > q.clientHeight + 4) { m.hidden = false; c.classList.add("is-clamped"); }
    m.addEventListener("click", function () { c.classList.remove("is-clamped"); c.classList.add("is-open"); m.hidden = true; });
  });
  s.querySelectorAll(".reviews-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var card = t.querySelector(".review"), step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(t).columnGap || 0) : t.clientWidth;
      t.scrollBy({ left: step * Number(b.dataset.dir), behavior: "smooth" });
    });
  });
})();
</script>`;
}

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
${reviewsBlock(lang)}
<footer class="site-footer" id="contact">
  <p class="eyebrow">${esc(t.nav.contact)}</p>
  <h2 class="footer-title">${esc(t.contact.title)}</h2>
  <a class="button" href="mailto:${esc(shared.email)}">${esc(t.contact.cta)}</a>
  <ul class="footer-links">
    <li><a href="mailto:${esc(shared.email)}">${esc(shared.email)}</a></li>
    ${shared.phone ? `<li><a href="tel:${esc(shared.phone.replace(/\s/g, ""))}">${esc(shared.phone)}</a></li>` : ""}
    ${shared.instagram ? `<li><a class="icon-link" href="${esc(shared.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none"/></svg></a></li>` : ""}
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
  </div>
  <a class="hero-scroll" href="#intro" aria-label="Scroll">↓</a>
</section>
<section class="intro" id="intro">
  <h2>${esc(String(h.title || "").replace(/[.。]\s*$/, ""))}</h2>
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
  const block = (title, text) => (title || text) ? `
    <div class="info-block">
      ${title ? `<h2>${esc(title)}</h2>` : ""}
      ${paras(text)}
    </div>` : "";
  return `
<section class="about">
  <figure class="portrait"><img src="${img(shared.images.about_portrait)}" alt="Agathe"></figure>
  <div class="about-text">
    <h1>${esc(a.title)}</h1>
    <div class="prose">${paras(a.body)}</div>${block(a.pronounce_title, a.pronounce_text)}${block(a.languages_title, a.languages_text)}
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
  const prices = (e.prices || []).filter(Boolean);
  return `
<section class="about exp-intro">
  <figure class="portrait"><img src="${img(shared.images.experiences_intro || "/images/experiences-intro.svg")}" alt=""></figure>
  <div class="about-text">
    <h1>${esc(e.title)}</h1>
    ${e.subtitle ? `<p class="subtitle">${esc(e.subtitle)}</p>` : ""}
    <div class="prose">${paras(e.intro)}</div>
  </div>
</section>
<section class="exp-list">${items}
</section>
${(e.prices_title || e.prices_text || prices.length) ? `<section class="prices">
  ${e.prices_title ? `<h2>${esc(e.prices_title)}</h2>` : ""}
  <div class="prices-text">${paras(e.prices_text)}</div>
  ${prices.length ? `<ul class="price-list">${prices.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
</section>` : ""}`;
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
