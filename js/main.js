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
            <h3>${escapeHTML(p.title)}</h3>
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
        <div class="avatar">${initials(m.name)}</div>
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
          <h3>${escapeHTML(p.title)}</h3>
          <p class="muted">${escapeHTML(p.excerpt)}</p>
          <div class="mono-tag">— ${escapeHTML(p.author)}</div>
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

document.addEventListener("DOMContentLoaded", () => {
  renderHomePreviews();
  renderTeam();
  renderPublications();
  renderProjects();
  renderPosts();
  renderSeminars();
  renderMission();
  renderPartners();
});
