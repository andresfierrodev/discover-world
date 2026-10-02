/* ==========================================================
   main.js — Discover.World
   Hauptlogik für alle Stadtseiten:
   - Dark/Light Mode mit LocalStorage (CSS #01 + JS #07)
   - Hero-Slideshow
   - Spot-Karten aus JSON generieren (DOM-Manipulation)
   - Kategoriefilter
   - Spots speichern mit LocalStorage (JS #07)
   - Tabellensortierung (JS #06)
   - Glassmorphism-Modal (CSS #08)
   - Foto-Upload mit LocalStorage
   ========================================================== */


/* ----------------------------------------------------------
   1. DARK / LIGHT MODE 
   ---------------------------------------------------------- */

const THEME_KEY = "dg-theme";
const SAVED_KEY = "dg-saved-spots";

function applyTheme(theme) {
  /* Klasse auf body setzen oder entfernen */
  document.body.classList.toggle("dark-mode", theme === "dark");

  const icon  = document.getElementById("toggleIcon");
  const label = document.getElementById("toggleLabel");

  if (icon)  icon.textContent  = theme === "dark" ? "☀️" : "🌙";
  if (label) label.textContent = theme === "dark" ? "Light" : "Dark";
}

function toggleTheme() {
  /* Aktuelles Farbschema lesen und wechseln */
  const current = localStorage.getItem(THEME_KEY) || "light";
  const next    = current === "light" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

/* Gespeichertes Farbschema beim Laden anwenden */
(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(saved);
})();

const toggleBtn = document.getElementById("toggleBtn");
if (toggleBtn) {
  toggleBtn.addEventListener("click", toggleTheme);
}


/* ----------------------------------------------------------
   2. HERO-SLIDESHOW (alte Version — spots.html)
   Wird nur aktiviert wenn .hero-slides auf der Seite existiert.
   ---------------------------------------------------------- */

const SLIDE_LABELS = ["Graz", "Altstadt", "Schlossberg", "Murinsel"];
let currentSlide = 0;
let slideTimer   = null;

function goSlide(index) {
  const slides = document.querySelectorAll(".hero-slide");
  const dots   = document.querySelectorAll(".hdot");
  const label  = document.getElementById("slideLabel");

  if (!slides.length) return;

  /* Aktuellen Slide deaktivieren */
  slides[currentSlide].classList.remove("active");
  dots[currentSlide].classList.remove("active");

  currentSlide = index;

  /* Neuen Slide aktivieren */
  slides[currentSlide].classList.add("active");
  dots[currentSlide].classList.add("active");

  if (label) {
    label.querySelector(".badge-name").textContent = SLIDE_LABELS[currentSlide];
  }

  /* Timer nach manuellem Klick neu starten */
  clearInterval(slideTimer);
  slideTimer = setInterval(nextSlide, 4000);
}

function nextSlide() {
  goSlide((currentSlide + 1) % SLIDE_LABELS.length);
}

/* Slideshow starten wenn Slides vorhanden */
if (document.querySelector(".hero-slides")) {
  slideTimer = setInterval(nextSlide, 4000);
}

/* goSlide global verfügbar machen für inline Buttons */
window.goSlide = goSlide;


/* ----------------------------------------------------------
   3. LOCALSTORAGE
   ---------------------------------------------------------- */

function getSavedSpots() {
  const raw = localStorage.getItem(SAVED_KEY);
  return raw ? JSON.parse(raw) : [];
}

function toggleSaveSpot(id) {
  const saved = getSavedSpots();
  const index = saved.indexOf(id);

  /* Spot hinzufügen oder entfernen */
  if (index === -1) {
    saved.push(id);
  } else {
    saved.splice(index, 1);
  }

  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));

  /* Alle Buttons mit dieser ID visuell aktualisieren */
  document.querySelectorAll(`.save-btn[data-id="${id}"]`).forEach(btn => {
    btn.classList.toggle("saved", saved.includes(id));
    btn.textContent = saved.includes(id) ? "♥" : "♡";
    btn.setAttribute("aria-label", saved.includes(id) ? "Gespeichert" : "Speichern");
  });
}


/* ----------------------------------------------------------
   4. SPOT-KARTEN AUS JSON GENERIEREN
   ---------------------------------------------------------- */

function createTopCard(spot) {
  const saved = getSavedSpots().includes(spot.id);

  const card = document.createElement("article");
  card.classList.add("top-card");
  card.dataset.category = spot.category;

  card.innerHTML = `
    <div class="top-card-header">
      <div>
        <p class="top-card-category">${spot.category}</p>
        <h3 class="top-card-name">${spot.name}</h3>
      </div>
      <button class="save-btn ${saved ? "saved" : ""}" data-id="${spot.id}"
        aria-label="${saved ? "Gespeichert" : "Speichern"}"
      >${saved ? "♥" : "♡"}</button>
    </div>
    <p class="top-card-desc">${spot.description}</p>
    <div class="top-card-footer">
      <span class="top-card-rating">★ ${spot.rating}</span>
      <span class="top-card-distance">${spot.distance}</span>
    </div>
  `;

  card.querySelector(".save-btn").addEventListener("click", function () {
    toggleSaveSpot(spot.id);
  });

  return card;
}

function createCard(spot) {
  const saved = getSavedSpots().includes(spot.id);
  const stars = "★".repeat(Math.floor(spot.rating)) + (spot.rating % 1 ? "½" : "");

  const card = document.createElement("article");
  card.classList.add("card");
  card.dataset.category = spot.category;

  card.innerHTML = `
    <div class="card-img" style="background-color: ${spot.color};">
      <span class="card-emoji" aria-hidden="true">${spot.emoji}</span>
      <button
        class="save-btn ${saved ? "saved" : ""}"
        data-id="${spot.id}"
        aria-label="${saved ? "Gespeichert" : "Speichern"}"
      >${saved ? "♥" : "♡"}</button>
    </div>
    <div class="card-body">
      <p class="card-category">${spot.category}</p>
      <h3 class="card-name">${spot.name}</h3>
      <p class="card-desc">${spot.description}</p>
    </div>
    <div class="card-footer">
      <span class="card-rating" aria-label="Bewertung ${spot.rating}">${stars} ${spot.rating}</span>
      <span class="card-distance">${spot.distance}</span>
    </div>
  `;

  /* Speichern-Button Event-Listener */
  card.querySelector(".save-btn").addEventListener("click", function () {
    toggleSaveSpot(spot.id);
  });

  return card;
}

/* Listeneintrag fuer die "All"-Ansicht erstellen */
function createListItem(spot) {
  const saved = getSavedSpots().includes(spot.id);
  const item  = document.createElement("div");
  item.classList.add("spot-list-item");
  item.dataset.category = spot.category;
  item.dataset.name     = spot.name;
  item.dataset.rating   = spot.rating;

  item.innerHTML = `
    <div class="spot-list-info">
      <span class="spot-list-name">${spot.name}</span>
      <span class="spot-list-cat">${spot.category}</span>
    </div>
    <span class="spot-list-rating">★ ${spot.rating}</span>
    <button class="spot-list-save save-btn ${saved ? "saved" : ""}"
      data-id="${spot.id}"
      aria-label="${saved ? "Gespeichert" : "Speichern"}"
    >${saved ? "♥" : "♡"}</button>
  `;

  item.querySelector(".save-btn").addEventListener("click", function () {
    toggleSaveSpot(spot.id);
    this.classList.toggle("saved", getSavedSpots().includes(spot.id));
    this.textContent = getSavedSpots().includes(spot.id) ? "♥" : "♡";
  });

  return item;
}

/* Sorting-Zustand fuer die Liste */
let listSortCol = "rating";
let listSortDir = "desc";

function renderRestList(container, data) {
  container.innerHTML = "";

  /* Header-Zeile mit Sorting */
  const header = document.createElement("div");
  header.classList.add("spot-list-header");
  header.innerHTML = `
    <span class="spot-list-header-name sortable-col ${listSortCol === "name" ? "active" : ""}" data-col="name">
      Spot ${listSortCol === "name" ? (listSortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
    <span class="spot-list-header-rating sortable-col ${listSortCol === "rating" ? "active" : ""}" data-col="rating">
      Rating ${listSortCol === "rating" ? (listSortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
    <span class="spot-list-header-save">Gespeichert</span>
  `;
  container.appendChild(header);

  /* Klick auf Header -- sortieren */
  header.querySelectorAll(".sortable-col").forEach(col => {
    col.addEventListener("click", function () {
      const clicked = this.dataset.col;
      if (listSortCol === clicked) {
        listSortDir = listSortDir === "asc" ? "desc" : "asc";
      } else {
        listSortCol = clicked;
        listSortDir = clicked === "rating" ? "desc" : "asc";
      }

      /* Neu sortieren und rendern */
      const sorted = [...data].sort((a, b) => {
        const valA = a[listSortCol];
        const valB = b[listSortCol];
        if (valA < valB) return listSortDir === "asc" ? -1 : 1;
        if (valA > valB) return listSortDir === "asc" ? 1 : -1;
        return 0;
      });
      renderRestList(container, sorted);
    });
  });

  /* Items rendern */
  const sorted = [...data].sort((a, b) => {
    const valA = a[listSortCol];
    const valB = b[listSortCol];
    if (valA < valB) return listSortDir === "asc" ? -1 : 1;
    if (valA > valB) return listSortDir === "asc" ? 1 : -1;
    return 0;
  });

  sorted.forEach(spot => container.appendChild(createListItem(spot)));
}

function renderCards(filter = "all") {
  const grid = document.getElementById("cardsGrid");
  if (!grid) return;

  grid.innerHTML = "";
  grid.style.display = "block";

  if (filter === "all") {
    /* 3 Top Spots als grosse Karten — nach Rating sortiert */
    const sorted   = [...spotsData].sort((a, b) => b.rating - a.rating);
    const topThree = sorted.slice(0, 3);
    const rest     = sorted.slice(3);

    /* Top-Bereich */
    const topGrid = document.createElement("div");
    topGrid.classList.add("top-spots-grid");
    topThree.forEach(spot => topGrid.appendChild(createTopCard(spot)));
    grid.appendChild(topGrid);

    /* Trennlinie mit Titel */
    const divider = document.createElement("div");
    divider.classList.add("spots-divider");
    divider.innerHTML = '<span>Alle Spots</span>';
    grid.appendChild(divider);

    /* Rest als sortierbare Liste */
    const list = document.createElement("div");
    list.classList.add("spots-list");
    renderRestList(list, rest);
    grid.appendChild(list);

  } else {
    /* Kartenansicht für einzelne Kategorien */
    const filtered = spotsData.filter(s => s.category === filter);
    const topGrid  = document.createElement("div");
    topGrid.classList.add("top-spots-grid");
    filtered.forEach(spot => topGrid.appendChild(createTopCard(spot)));
    grid.appendChild(topGrid);
  }
}

/* Seite erkennen und Karten laden */
if (document.querySelector("#cardsGrid")) {
  if (window.location.pathname.includes("index") || window.location.pathname.endsWith("/")) {
    document.body.classList.add("page-index");
  }
  renderCards();
}


/* ----------------------------------------------------------
   5. KATEGORIEFILTER
   Bei Klick auf einen Filter werden nur passende Spots angezeigt.
   ---------------------------------------------------------- */

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", function () {
    /* Aktiven Filter wechseln */
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    renderCards(this.dataset.filter);
  });
});


/* ----------------------------------------------------------
   6. KONTAKTFORMULAR
   Einfache Validierung mit Regex für E-Mail-Adressen.
   ---------------------------------------------------------- */

const submitBtn = document.getElementById("submitBtn");
const feedback  = document.getElementById("formFeedback");

if (submitBtn) {
  submitBtn.addEventListener("click", function () {
    const name    = document.getElementById("name").value.trim();
    const email   = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    /* Pflichtfelder prüfen */
    if (!name || !email || !message) {
      feedback.textContent = "Bitte alle Pflichtfelder ausfüllen.";
      feedback.classList.add("feedback-error");
      feedback.classList.remove("feedback-ok");
      return;
    }

    /* E-Mail-Format mit RegEx prüfen */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      feedback.textContent = "Bitte eine gültige E-Mail-Adresse eingeben.";
      feedback.classList.add("feedback-error");
      feedback.classList.remove("feedback-ok");
      return;
    }

    feedback.textContent = "Danke! Wir melden uns bald. ✓";
    feedback.classList.add("feedback-ok");
    feedback.classList.remove("feedback-error");

    /* Formularfelder leeren */
    ["name", "email", "spot", "message"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  });
}


/* ----------------------------------------------------------
   7. TABELLENSORTIERUNG
   ---------------------------------------------------------- */

let tableSortCol = null;  /* Aktive Spalte */
let tableSortDir = "asc"; /* Sortierrichtung */

function renderTable(data) {
  const tbody = document.getElementById("spotsTableBody");
  if (!tbody) return;

  const saved = getSavedSpots();
  tbody.innerHTML = "";

  data.forEach(spot => {
    const isSaved = saved.includes(spot.id);
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="table-spot-name">
        <span class="table-emoji">${spot.emoji}</span>
        ${spot.name}
      </td>
      <td><span class="table-cat table-cat--${spot.category}">${spot.category}</span></td>
      <td class="table-rating">★ ${spot.rating}</td>
      <td class="table-save-cell">
        <button
          class="save-btn ${isSaved ? "saved" : ""}"
          data-id="${spot.id}"
          aria-label="${isSaved ? "Gespeichert" : "Speichern"}"
        >${isSaved ? "♥" : "♡"}</button>
      </td>
    `;

    /* Speichern-Button in der Tabellenzeile */
    row.querySelector(".save-btn").addEventListener("click", function () {
      toggleSaveSpot(spot.id);
      renderTable(getCurrentTableData());
    });

    tbody.appendChild(row);
  });
}

function getCurrentTableData() {
  let data = [...spotsData];

  if (tableSortCol) {
    data.sort((a, b) => {
      let valA = a[tableSortCol];
      let valB = b[tableSortCol];

      if (valA < valB) return tableSortDir === "asc" ? -1 : 1;
      if (valA > valB) return tableSortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  return data;
}

function initTable() {
  const table = document.getElementById("spotsTable");
  if (!table) return;

  /* Tabelle initial befüllen */
  renderTable(spotsData);

  /* Klick auf Spaltenheader — Sortierung auslösen */
  table.querySelectorAll("th.sortable").forEach(th => {
    th.addEventListener("click", function () {
      const col = this.dataset.col;

      if (tableSortCol === col) {
        /* Gleiche Spalte — Richtung umkehren */
        tableSortDir = tableSortDir === "asc" ? "desc" : "asc";
      } else {
        /* Neue Spalte — aufsteigend sortieren */
        tableSortCol = col;
        tableSortDir = "asc";
      }

      /* Sortiericons aller Header zurücksetzen */
      table.querySelectorAll("th.sortable").forEach(h => {
        h.classList.remove("sort-asc", "sort-desc");
        h.setAttribute("aria-sort", "none");
        h.querySelector(".sort-icon").textContent = "↕";
      });

      /* Aktiven Header markieren */
      this.classList.add(tableSortDir === "asc" ? "sort-asc" : "sort-desc");
      this.setAttribute("aria-sort", tableSortDir === "asc" ? "ascending" : "descending");
      this.querySelector(".sort-icon").textContent = tableSortDir === "asc" ? "↑" : "↓";

      renderTable(getCurrentTableData());
    });
  });
}

/* Tabelle initialisieren wenn vorhanden */
if (document.getElementById("spotsTable")) {
  initTable();
}


/* ----------------------------------------------------------
   8. GLASSMORPHISM-MODAL
   ---------------------------------------------------------- */

function initGalleryModal() {
  const modal    = document.getElementById("glassModal");
  const backdrop = document.getElementById("modalBackdrop");
  const closeBtn = document.getElementById("modalClose");
  const cards    = document.querySelectorAll(".gallery-card");

  if (!modal || !cards.length) return;

  function openModal(card) {
    const name = card.dataset.name;
    const tag  = card.dataset.tag;
    const desc = card.dataset.desc;
    const img  = card.querySelector(".gallery-img");

    /* Hintergrundbild der Karte ins Modal übertragen */
    document.getElementById("modalImg").style.cssText =
      img.style.cssText || window.getComputedStyle(img).cssText;
    document.getElementById("modalImg").className =
      "glass-modal-img " + img.className.replace("gallery-img", "");
    document.getElementById("modalTitle").textContent = name;
    document.getElementById("modalTag").textContent   = tag;
    document.getElementById("modalDesc").textContent  = desc;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /* Klick auf Galerie-Karte öffnet Modal */
  cards.forEach(card => {
    card.addEventListener("click", () => openModal(card));
    card.style.cursor = "pointer";
  });

  /* Modal schließen via Backdrop, Button oder Escape */
  backdrop.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });
}

if (document.getElementById("glassModal")) {
  initGalleryModal();
}


/* ----------------------------------------------------------
   9. STADT-HERO-SLIDESHOW
   Für graz.html / tokyo.html / nairobi.html.
   Navigationspunkte werden dynamisch erstellt.
   ---------------------------------------------------------- */

function initCityHero() {
  const slides   = document.querySelectorAll(".city-slide");
  const dotsWrap = document.getElementById("cityDots");
  if (!slides.length || !dotsWrap) return;

  let cur   = 0;
  let timer = null;

  /* Dots dynamisch erstellen */
  slides.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.classList.add("city-dot");
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-label", `Slide ${i + 1}`);
    if (i === 0) btn.classList.add("active");
    btn.addEventListener("click", () => goCity(i));
    dotsWrap.appendChild(btn);
  });

  function goCity(index) {
    slides[cur].classList.remove("active");
    dotsWrap.children[cur].classList.remove("active");
    cur = index;
    slides[cur].classList.add("active");
    dotsWrap.children[cur].classList.add("active");
    /* Timer nach manuellem Klick neu starten */
    clearInterval(timer);
    timer = setInterval(() => goCity((cur + 1) % slides.length), 4500);
  }

  /* Autoplay starten */
  timer = setInterval(() => goCity((cur + 1) % slides.length), 4500);
}

if (document.querySelector(".city-hero")) {
  initCityHero();
}


/* ----------------------------------------------------------
   10. FOTO-UPLOAD
   ---------------------------------------------------------- */

const PHOTOS_KEY = "dg-user-photos";

function getUserPhotos() {
  try {
    return JSON.parse(localStorage.getItem(PHOTOS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUserPhotos(photos) {
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

function renderUserPhotos() {
  const grid = document.getElementById("userPhotosGrid");
  if (!grid) return;

  const photos = getUserPhotos();
  grid.innerHTML = "";

  if (!photos.length) {
    grid.innerHTML = `<p style="color: var(--color-text-3); font-size: 0.82rem; grid-column: 1/-1; text-align: center; width: 100%;">
      Noch keine Fotos geteilt, sei der Erste!
    </p>`;
    return;
  }

  /* Jedes gespeicherte Foto als Karte anzeigen */
  photos.forEach((photo, index) => {
    const card = document.createElement("div");
    card.classList.add("user-photo-card");
    card.innerHTML = `
      <img src="${photo.src}" alt="${photo.comment}" loading="lazy" />
      <div class="user-photo-comment">${photo.comment}</div>
      <button class="user-photo-delete" aria-label="Foto loeschen" data-index="${index}">✕</button>
    `;

    /* Foto loeschen */
    card.querySelector(".user-photo-delete").addEventListener("click", function () {
      const photos = getUserPhotos();
      photos.splice(index, 1);
      saveUserPhotos(photos);
      renderUserPhotos();
    });

    grid.appendChild(card);
  });
}

function initPhotoUpload() {
  const dropArea     = document.getElementById("uploadDropArea");
  const fileInput    = document.getElementById("photoInput");
  const commentInput = document.getElementById("photoComment");
  const submitBtn    = document.getElementById("uploadSubmitBtn");
  const feedback     = document.getElementById("uploadFeedback");

  if (!submitBtn) return;

  /* Gespeicherte Fotos beim Laden anzeigen */
  renderUserPhotos();

  /* Klick auf Drop-Bereich öffnet Dateiauswahl */
  dropArea.addEventListener("click", () => fileInput.click());

  /* Drag-over: Rahmen hervorheben */
  dropArea.addEventListener("dragover", e => {
    e.preventDefault();
    dropArea.style.borderColor = "var(--color-accent)";
  });

  /* Drag-leave: Rahmen zurücksetzen */
  dropArea.addEventListener("dragleave", () => {
    dropArea.style.borderColor = "";
  });

  /* Drop: Datei übernehmen */
  dropArea.addEventListener("drop", e => {
    e.preventDefault();
    dropArea.style.borderColor = "";
    if (e.dataTransfer.files[0]) {
      fileInput.files = e.dataTransfer.files;
      updateDropLabel(e.dataTransfer.files[0].name);
    }
  });

  /* Dateiname im Drop-Bereich anzeigen */
  fileInput.addEventListener("change", function () {
    if (this.files[0]) updateDropLabel(this.files[0].name);
  });

  function updateDropLabel(name) {
    const p = dropArea.querySelector(".upload-drop-text");
    if (p) p.textContent = `✓ ${name}`;
  }

  /* Foto hochladen und im LocalStorage speichern */
  submitBtn.addEventListener("click", function () {
    const file    = fileInput.files[0];
    const comment = commentInput.value.trim();

    if (!file) {
      feedback.textContent = "Bitte ein Foto auswählen.";
      feedback.classList.add("feedback-error");
      feedback.classList.remove("feedback-ok");
      return;
    }

    if (!comment) {
      feedback.textContent = "Bitte einen kurzen Kommentar hinzufügen.";
      feedback.classList.add("feedback-error");
      feedback.classList.remove("feedback-ok");
      return;
    }

    /* Bild als Base64 lesen und speichern */
    const reader = new FileReader();
    reader.onload = function (e) {
      const photos = getUserPhotos();
      photos.unshift({ src: e.target.result, comment });
      /* Maximal 9 Fotos — älteste entfernen */
      if (photos.length > 9) photos.pop();
      saveUserPhotos(photos);
      renderUserPhotos();

      feedback.textContent = "Foto geteilt! Danke. ✓";
      feedback.classList.add("feedback-ok");
      feedback.classList.remove("feedback-error");

      /* Formular zurücksetzen */
      commentInput.value = "";
      fileInput.value    = "";
      const p = dropArea.querySelector(".upload-drop-text");
      if (p) p.innerHTML = 'Foto hier ablegen oder <label for="photoInput" class="upload-browse">durchsuchen</label>';
    };
    reader.readAsDataURL(file);
  });
}

if (document.getElementById("uploadForm")) {
  initPhotoUpload();
}
