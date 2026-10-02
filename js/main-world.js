/* ==========================================================
   main-world.js -- Discover.World
   Startseite: Welt-Slideshow und Suchfunktion
   ========================================================== */
 
 
/* ----------------------------------------------------------
   1. WELT-SLIDESHOW
   10 Fotos wechseln automatisch alle 5 Sekunden
   ---------------------------------------------------------- */
 
const slides     = document.querySelectorAll('.world-slide');
const dotsWrap   = document.getElementById('worldDots');
const placeLabel = document.getElementById('worldPlaceLabel');
let current      = 0;
let autoTimer    = null;
 
/* Navigationspunkte dynamisch erstellen 'die Punkte' */
slides.forEach(function(slide, i) {
  var btn = document.createElement('button');
  btn.classList.add('world-dot');
  btn.setAttribute('role', 'tab');
  btn.setAttribute('aria-label', 'Slide ' + (i + 1));
  if (i === 0) btn.classList.add('active');
  btn.addEventListener('click', function() { goTo(i); });
  dotsWrap.appendChild(btn);
});
 
function goTo(index) {
  slides[current].classList.remove('active');
  dotsWrap.children[current].classList.remove('active');
  current = index;
  slides[current].classList.add('active');
  dotsWrap.children[current].classList.add('active');
 
  /* Ortsbezeichnung aktualisieren */
  var place   = slides[current].dataset.place;
  var country = slides[current].dataset.country;
  if (placeLabel) placeLabel.textContent = place + ', ' + country;
 
  /* Timer neu starten */
  clearInterval(autoTimer);
  autoTimer = setInterval(function() { goTo((current + 1) % slides.length); }, 5000);
}
 
/* Autoplay starten */
autoTimer = setInterval(function() { goTo((current + 1) % slides.length); }, 5000);
 
 
/* ----------------------------------------------------------
   2. SUCHE
   Klick auf den Such-Hint oeffnet das Dropdown direkt
   darunter. Klick ausserhalb schliesst es wieder.
   ---------------------------------------------------------- */
 
var heroHint    = document.getElementById('heroSearchHint');
var searchWrap  = document.getElementById('heroSearchWrap');
var heroDropdown = document.getElementById('heroDropdown');
 
/* Dropdown oeffnen / schliessen */
function toggleDropdown(e) {
  e.stopPropagation();
  var isOpen = heroDropdown.classList.contains('open');
 
  if (!isOpen) {
    /* Position berechnen -- direkt unter dem Button */
    var rect = heroHint.getBoundingClientRect();
    heroDropdown.style.top  = (rect.bottom + 8) + 'px';
    heroDropdown.style.left = (rect.left + rect.width / 2) + 'px';
    heroDropdown.style.transform = 'translateX(-50%)';
    heroDropdown.style.display = 'block';
    heroDropdown.classList.add('open');
  } else {
    closeDropdown();
  }
}
 
function closeDropdown() {
  heroDropdown.style.display = 'none';
  heroDropdown.classList.remove('open');
}
 
/* Klick auf den Such-Button */
if (heroHint) heroHint.addEventListener('click', toggleDropdown);
 
/* Klick ausserhalb schliesst das Dropdown */
document.addEventListener('click', function(e) {
  if (!heroHint.contains(e.target) && !heroDropdown.contains(e.target)) {
    closeDropdown();
  }
});
 
/* Maus verlaesst den Bereich -- schliesst nach kurzer Verzoegerung */
var closeTimer = null;
if (heroDropdown) {
  heroDropdown.addEventListener('mouseleave', function() {
    closeTimer = setTimeout(closeDropdown, 400);
  });
  heroDropdown.addEventListener('mouseenter', function() {
    clearTimeout(closeTimer);
  });
}
if (searchWrap) {
  searchWrap.addEventListener('mouseleave', function() {
    closeTimer = setTimeout(closeDropdown, 400);
  });
  searchWrap.addEventListener('mouseenter', function() {
    clearTimeout(closeTimer);
  });
}
 
/* Escape schliesst das Dropdown */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeDropdown();
});
 