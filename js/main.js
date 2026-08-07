// ============================================================
// Menu mobile
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
});

// ============================================================
// Utilitaires
// ============================================================
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Impossible de charger ${path}`);
  const data = await res.json();
  // Les fichiers de contenu sont stockés sous la forme { "entries": [...] }
  // pour rester compatibles avec l'éditeur Decap CMS (admin/config.yml).
  return Array.isArray(data) ? data : data.entries || [];
}

function initials(name) {
  return name
    .replace(/^(Dr\.|M\.|Mme|Mr\.)\s*/i, "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDateFR(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// Page d'accueil — aperçus
// ============================================================
async function renderHomePreviews() {
  const pubMount = document.getElementById("home-pub-preview");
  const postMount = document.getElementById("home-post-preview");
  const teamMount = document.getElementById("home-team-preview");
  const teamCount = document.getElementById("stat-team-count");
  const pubCount = document.getElementById("stat-pub-count");
  const projCount = document.getElementById("stat-proj-count");

  try {
    const [team, pubs, projects, posts] = await Promise.all([
      loadJSON("content/team.json"),
      loadJSON("content/publications.json"),
      loadJSON("content/projects.json"),
      loadJSON("content/posts.json"),
    ]);

    if (teamCount) teamCount.textContent = team.length;
    if (pubCount) pubCount.textContent = pubs.length;
    if (projCount) projCount.textContent = projects.filter((p) => p.status === "active").length;

    if (teamMount) {
      if (!team.length) {
        teamMount.innerHTML = `<div class="empty-state">Aucun membre listé pour le moment.</div>`;
      } else {
        const preview = team.slice(0, 4);
        teamMount.innerHTML = preview
          .map(
            (m) => `
          <div class="card">
            <div class="avatar">${initials(m.name)}</div>
            <h3>${escapeHTML(m.name)}</h3>
            <div class="mono-tag">${escapeHTML(m.role)}</div>
          </div>`
          )
          .join("");
      }
    }

    if (pubMount) {
      const latest = [...pubs].sort((a, b) => b.year - a.year).slice(0, 3);
      pubMount.innerHTML = latest
        .map(
          (p) => `
        <div class="pub-item">
          <div class="idx">${p.year}</div>
          <div>
            <h3>${escapeHTML(p.title)}</h3>
            <div class="meta">${escapeHTML(p.authors)} — ${escapeHTML(p.venue)}</div>
          </div>
        </div>`
        )
        .join("");
    }

    if (postMount) {
      const latest = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
      postMount.innerHTML = latest
        .map(
          (p) => `
        <div class="post-item">
          <div class="date">${formatDateFR(p.date)}</div>
          <div>
            <h3><a href="article.html?id=${encodeURIComponent(p.id)}" style="color:inherit; text-decoration:none;">${escapeHTML(p.title)}</a></h3>
            <p class="muted">${escapeHTML(p.excerpt)}</p>
          </div>
        </div>`
        )
        .join("");
    }
  } catch (e) {
    console.error(e);
  }
}

// ============================================================
// Notre mission
// ============================================================
async function renderMission() {
  const mount = document.getElementById("mission-grid");
  if (!mount) return;
  try {
    const objectives = await loadJSON("content/mission.json");
    if (!objectives.length) {
      mount.innerHTML = `<div class="empty-state">Objectifs à venir — ajoutez-les depuis l'éditeur (/admin/ → Notre mission).</div>`;
      return;
    }
    mount.innerHTML = objectives
      .map(
        (o) => `
      <div class="card">
        <h3>${escapeHTML(o.title)}</h3>
        <p class="muted">${escapeHTML(o.description)}</p>
      </div>`
      )
      .join("");
  } catch (e) {
    mount.innerHTML = `<div class="empty-state">Erreur de chargement des objectifs.</div>`;
    console.error(e);
  }
}

// ============================================================
// Partenaires & financements
// ============================================================
async function renderPartners() {
  const mount = document.getElementById("partners-grid");
  if (!mount) return;
  try {
    const partners = await loadJSON("content/partners.json");
    if (!partners.length) {
      mount.innerHTML = `<div class="empty-state">Partenaires et financeurs à venir — ajoutez-les depuis l'éditeur (/admin/ → Partenaires &amp; financements).</div>`;
      return;
    }
    mount.innerHTML = partners
      .map((p) => {
        const inner = `
          ${p.logo ? `<img src="${escapeHTML(p.logo)}" alt="${escapeHTML(p.name)}" style="max-width:140px; max-height:56px; object-fit:contain; margin:0 auto 10px;" />` : ""}
          <div class="mono-tag" style="text-align:center; font-weight:600;">${escapeHTML(p.name)}</div>
        `;
        return p.url
          ? `<a href="${escapeHTML(p.url)}" target="_blank" rel="noopener" class="card" style="align-items:center; text-decoration:none;">${inner}</a>`
          : `<div class="card" style="align-items:center;">${inner}</div>`;
      })
      .join("");
  } catch (e) {
    mount.innerHTML = `<div class="empty-state">Erreur de chargement des partenaires.</div>`;
    console.error(e);
  }
}

// ============================================================
// Page équipe
// ============================================================
async function renderTeam() {
  const mount = document.getElementById("team-grid");
  if (!mount) return;
  try {
    const team = await loadJSON("content/team.json");
    if (!team.length) {
      mount.outerHTML = `<div class="empty-state">Aucun membre listé pour le moment. Ajoutez-en via content/team.json.</div>`;
      return;
    }
    mount.innerHTML = team
      .map(
        (m) => `
      <div class="card">
        ${m.photo && m.photo !== "" ? `<img src="${escapeHTML(m.photo)}" alt="${escapeHTML(m.name)}" class="avatar-photo" />` : `<div class="avatar">${initials(m.name)}</div>`}
        <h3>${escapeHTML(m.name)}</h3>
        <div class="mono-tag">${escapeHTML(m.role)}</div>
        <div class="mono-tag" style="color: var(--accent-blue)">${escapeHTML(m.field)}</div>
        <p class="muted" style="margin-top:8px">${escapeHTML(m.bio)}</p>
        <a class="link-arrow" href="mailto:${escapeHTML(m.email)}">${escapeHTML(m.email)} →</a>
      </div>`
      )
      .join("");
  } catch (e) {
    mount.outerHTML = `<div class="empty-state">Erreur de chargement de l'équipe.</div>`;
    console.error(e);
  }
}

// ============================================================
// Page publications
// ============================================================
async function renderPublications() {
  const mount = document.getElementById("pub-list");
  if (!mount) return;
  try {
    const pubs = await loadJSON("content/publications.json");
    if (!pubs.length) {
      mount.innerHTML = `<div class="empty-state">Aucune publication pour le moment. Ajoutez-en via content/publications.json.</div>`;
      return;
    }
    const sorted = [...pubs].sort((a, b) => b.year - a.year);
    mount.innerHTML = sorted
      .map(
        (p) => `
      <div class="pub-item">
        <div class="idx">${p.year}</div>
        <div>
          <h3>${escapeHTML(p.title)}</h3>
          <div class="meta">${escapeHTML(p.authors)} — ${escapeHTML(p.venue)}</div>
          <div class="tags">${(p.tags || []).map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join("")}</div>
        </div>
        <div class="link-col">${p.link && p.link !== "#" ? `<a class="link-arrow" href="${escapeHTML(p.link)}" target="_blank" rel="noopener">Lire →</a>` : `<span class="mono-tag">PDF à venir</span>`}</div>
      </div>`
      )
      .join("");
  } catch (e) {
    mount.innerHTML = `<div class="empty-state">Erreur de chargement des publications.</div>`;
    console.error(e);
  }
}

// ============================================================
// Page projets
// ============================================================
async function renderProjects() {
  const mount = document.getElementById("project-grid");
  if (!mount) return;
  try {
    const projects = await loadJSON("content/projects.json");
    if (!projects.length) {
      mount.outerHTML = `<div class="empty-state">Aucun projet pour le moment. Ajoutez-en via content/projects.json.</div>`;
      return;
    }
    mount.innerHTML = projects
      .map(
        (p) => `
      <div class="card">
        <span class="status-pill ${p.status === "active" ? "active" : "done"}">${p.status === "active" ? "En cours" : "Terminé"}</span>
        <h3>${escapeHTML(p.title)}</h3>
        <p class="muted">${escapeHTML(p.summary)}</p>
        <div class="mono-tag">Responsable : ${escapeHTML(p.lead)}</div>
        <div class="tags">${(p.tags || []).map((t) => `<span class="tag">${escapeHTML(t)}</span>`).join("")}</div>
      </div>`
      )
      .join("");
  } catch (e) {
    mount.outerHTML = `<div class="empty-state">Erreur de chargement des projets.</div>`;
    console.error(e);
  }
}

// ============================================================
// Page actualités
// ============================================================
async function renderPosts() {
  const mount = document.getElementById("post-list");
  if (!mount) return;
  try {
    const posts = await loadJSON("content/posts.json");
    if (!posts.length) {
      mount.innerHTML = `<div class="empty-state">Aucune actualité pour le moment. Ajoutez-en via content/posts.json.</div>`;
      return;
    }
    const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    mount.innerHTML = sorted
      .map(
        (p) => `
      <div class="post-item">
        <div class="date">${formatDateFR(p.date)}</div>
        <div>
          <h3><a href="article.html?id=${encodeURIComponent(p.id)}" style="color:inherit; text-decoration:none;">${escapeHTML(p.title)}</a></h3>
          <p class="muted">${escapeHTML(p.excerpt)}</p>
          <div class="mono-tag">— ${escapeHTML(p.author)}</div>
          <a class="link-arrow" href="article.html?id=${encodeURIComponent(p.id)}" style="margin-top:6px; display:inline-block;">Lire l'article complet →</a>
        </div>
      </div>`
      )
      .join("");
  } catch (e) {
    mount.innerHTML = `<div class="empty-state">Erreur de chargement des actualités.</div>`;
    console.error(e);
  }
}

// ============================================================
// Page séminaires
// ============================================================
async function renderSeminars() {
  const mount = document.getElementById("seminar-list");
  if (!mount) return;
  try {
    const seminars = await loadJSON("content/seminaires.json");
    if (!seminars.length) {
      mount.innerHTML = `<div class="empty-state">Aucun séminaire programmé pour le moment. Ajoutez-en via content/seminaires.json.</div>`;
      return;
    }
    const sorted = [...seminars].sort((a, b) => new Date(a.date) - new Date(b.date));
    mount.innerHTML = sorted
      .map(
        (s) => `
      <div class="post-item">
        <div class="date">${formatDateFR(s.date)}${s.time ? ` — ${escapeHTML(s.time)}` : ""}</div>
        <div>
          <h3>${escapeHTML(s.title)}</h3>
          <div class="mono-tag" style="color: var(--violet)">${escapeHTML(s.speaker)}</div>
          <p class="muted" style="margin-top:6px">${escapeHTML(s.abstract)}</p>
          ${s.room ? `<div class="mono-tag">${escapeHTML(s.room)}</div>` : ""}
        </div>
      </div>`
      )
      .join("");
  } catch (e) {
    mount.innerHTML = `<div class="empty-state">Erreur de chargement des séminaires.</div>`;
    console.error(e);
  }
}

// ============================================================
// Page article complet
// ============================================================
async function renderArticle() {
  const mount = document.getElementById("article-content");
  if (!mount) return;
  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const posts = await loadJSON("content/posts.json");
    const post = posts.find((p) => p.id === id);

    if (!post) {
      mount.innerHTML = `<div class="empty-state">Article introuvable. <a class="link-arrow" href="actualites.html">Retour aux actualités →</a></div>`;
      return;
    }

    document.title = `${post.title} — Mathématiques Fondamentales et Applications`;

    const paragraphs = (post.body || post.excerpt || "")
      .split(/\n\s*\n/)
      .map((para) => `<p>${escapeHTML(para.trim())}</p>`)
      .join("");

    mount.innerHTML = `
      <div class="mono-tag" style="color: var(--blue); text-transform:uppercase;">${formatDateFR(post.date)}</div>
      <h1 style="margin-top:10px; font-size:clamp(28px,4vw,42px)">${escapeHTML(post.title)}</h1>
      <div class="mono-tag" style="margin-top:14px; color: var(--violet);">Par ${escapeHTML(post.author)}</div>
      <div style="margin-top:28px; font-size:17px; line-height:1.7;">${paragraphs}</div>
    `;
  } catch (e) {
    mount.innerHTML = `<div class="empty-state">Erreur de chargement de l'article.</div>`;
    console.error(e);
  }
}

// ============================================================
// Quelques chiffres — libellés éditables, calcul automatique
// ============================================================
async function renderStats() {
  const mount = document.getElementById("stats-grid");
  if (!mount) return;
  try {
    const [statDefs, team, pubs, seminars, projects, theses, memoires] = await Promise.all([
      loadJSON("content/stats.json"),
      loadJSON("content/team.json"),
      loadJSON("content/publications.json"),
      loadJSON("content/seminaires.json"),
      loadJSON("content/projects.json"),
      loadJSON("content/theses.json"),
      loadJSON("content/memoires.json"),
    ]);

    if (!statDefs.length) {
      mount.innerHTML = `<div class="empty-state">Chiffres à venir — ajoutez-les depuis l'éditeur (/admin/ → Quelques chiffres).</div>`;
      return;
    }

    function computeNumber(def) {
      switch (def.source) {
        case "team_total":
          return team.length;
        case "team_keyword": {
          const kw = (def.keyword || "").toLowerCase().trim();
          if (!kw) return 0;
          return team.filter((m) => (m.role || "").toLowerCase().includes(kw)).length;
        }
        case "pub_total":
          return pubs.length;
        case "seminar_total":
          return seminars.length;
        case "project_active":
          return projects.filter((p) => p.status === "active").length;
        case "these_total":
          return theses.length;
        case "these_soutenue":
          return theses.filter((t) => t.status === "soutenue").length;
        case "these_en_cours":
          return theses.filter((t) => t.status === "en_cours").length;
        case "memoire_total":
          return memoires.length;
        case "memoire_encadre":
          return memoires.filter((m) => m.status === "encadre").length;
        case "memoire_en_cours":
          return memoires.filter((m) => m.status === "en_cours").length;
        case "manual":
        default:
          return def.manual_number || "0";
      }
    }

    mount.innerHTML = statDefs
      .map(
        (s) => `
      <div class="stat-box">
        <div class="num">${computeNumber(s)}</div>
        <div class="lbl">${escapeHTML(s.label)}</div>
      </div>`
      )
      .join("");
  } catch (e) {
    mount.innerHTML = `<div class="empty-state">Erreur de chargement des statistiques.</div>`;
    console.error(e);
  }
}

// ============================================================
// Évènements à venir (aperçu accueil)
// ============================================================
async function renderUpcomingEvents() {
  const mount = document.getElementById("home-events-preview");
  if (!mount) return;
  try {
    const seminars = await loadJSON("content/seminaires.json");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = seminars
      .filter((s) => new Date(s.date + "T00:00:00") >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);

    if (!upcoming.length) {
      mount.innerHTML = `<div class="empty-state">Aucun événement à venir programmé pour le moment.</div>`;
      return;
    }

    mount.innerHTML = upcoming
      .map(
        (s) => `
      <li style="padding:14px 0; border-bottom:1px solid var(--rule-strong); list-style:none;">
        <a href="seminaires.html" style="text-decoration:none; color:inherit;">
          <span class="mono-tag" style="color: var(--coral);">${formatDateFR(s.date)}${s.time ? ` — ${escapeHTML(s.time)}` : ""}</span>
          <div style="font-family: var(--font-display); font-weight:600; font-size:17px; margin-top:4px;">${escapeHTML(s.title)}</div>
          <div class="mono-tag" style="margin-top:2px;">Séminaire — ${escapeHTML(s.speaker)}</div>
        </a>
      </li>`
      )
      .join("");
  } catch (e) {
    mount.innerHTML = `<div class="empty-state">Erreur de chargement des événements.</div>`;
    console.error(e);
  }
}

// ============================================================
// Focus (raccourcis accueil)
// ============================================================
async function renderFocus() {
  const mount = document.getElementById("focus-grid");
  if (!mount) return;
  try {
    const items = await loadJSON("content/focus.json");
    if (!items.length) {
      mount.innerHTML = `<div class="empty-state">Raccourcis à venir — ajoutez-les depuis l'éditeur (/admin/ → Focus).</div>`;
      return;
    }
    mount.innerHTML = items
      .map(
        (i) => `
      <a href="${escapeHTML(i.link)}" class="card" style="text-decoration:none;">
        <h3>${escapeHTML(i.title)}</h3>
        <p class="muted">${escapeHTML(i.description)}</p>
      </a>`
      )
      .join("");
  } catch (e) {
    mount.innerHTML = `<div class="empty-state">Erreur de chargement.</div>`;
    console.error(e);
  }
}

// ============================================================
// Titre principal de l'accueil (hero)
// ============================================================
async function renderHero() {
  const eyebrowEl = document.getElementById("hero-eyebrow");
  const titleEl = document.getElementById("hero-title");
  const ledeEl = document.getElementById("hero-lede");
  if (!eyebrowEl && !titleEl && !ledeEl) return;
  try {
    const res = await fetch("content/hero.json");
    if (!res.ok) throw new Error("Impossible de charger content/hero.json");
    const data = await res.json();
    if (eyebrowEl) eyebrowEl.textContent = data.eyebrow || "";
    if (titleEl) titleEl.textContent = data.title || "";
    if (ledeEl) ledeEl.textContent = data.lede || "";
  } catch (e) {
    console.error(e);
  }
}

// ============================================================
// Bannière statique de l'accueil
// ============================================================
async function renderBanner() {
  const l1 = document.getElementById("banner-line1");
  const l2 = document.getElementById("banner-line2");
  const l3 = document.getElementById("banner-line3");
  if (!l1 && !l2 && !l3) return;
  try {
    const res = await fetch("content/banner.json");
    if (!res.ok) throw new Error("Impossible de charger content/banner.json");
    const data = await res.json();
    if (l1) l1.textContent = data.line1 || "";
    if (l2) l2.textContent = data.line2 || "";
    if (l3) l3.textContent = data.line3 || "";
  } catch (e) {
    console.error(e);
  }
}

// ============================================================
// Thèses et Mémoires — listes à onglets
// ============================================================
function renderTabbedList(entries, mountPrefix, statusKeys) {
  statusKeys.forEach((status) => {
    const mount = document.getElementById(`${mountPrefix}-${status}`);
    if (!mount) return;
    const filtered = entries.filter((e) => e.status === status);
    if (!filtered.length) {
      mount.innerHTML = `<div class="empty-state">Aucune entrée pour le moment.</div>`;
      return;
    }
    mount.innerHTML = filtered
      .map(
        (e) => `
      <div class="pub-item">
        <div class="idx">${escapeHTML(e.year)}</div>
        <div>
          <h3>${escapeHTML(e.title)}</h3>
          <div class="meta">${escapeHTML(e.author)} — dirigé·e par ${escapeHTML(e.director)}</div>
          ${e.link && e.link !== "" ? `<a class="link-arrow" href="${escapeHTML(e.link)}" target="_blank" rel="noopener" style="margin-top:6px; display:inline-block;">Lire →</a>` : ""}
        </div>
      </div>`
      )
      .join("");
  });
}

function initTabs() {
  document.querySelectorAll(".tab-switch").forEach((switchEl) => {
    const buttons = switchEl.querySelectorAll(".tab-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        buttons.forEach((b) => {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        const container = switchEl.parentElement;
        container.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.classList.toggle("active", panel.id.endsWith(`-${tab}`));
        });
      });
    });
  });
}

async function renderTheses() {
  if (!document.getElementById("theses-soutenue")) return;
  try {
    const theses = await loadJSON("content/theses.json");
    renderTabbedList(theses, "theses", ["soutenue", "en_cours"]);
  } catch (e) {
    console.error(e);
  }
}

async function renderMemoires() {
  if (!document.getElementById("memoires-encadre")) return;
  try {
    const memoires = await loadJSON("content/memoires.json");
    renderTabbedList(memoires, "memoires", ["encadre", "en_cours"]);
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderHomePreviews();
  renderTeam();
  renderPublications();
  renderProjects();
  renderPosts();
  renderSeminars();
  renderMission();
  renderPartners();
  renderArticle();
  renderStats();
  renderUpcomingEvents();
  renderFocus();
  renderHero();
  renderBanner();
  initTabs();
  renderTheses();
  renderMemoires();
});
