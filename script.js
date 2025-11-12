// Quand la page est prête
document.addEventListener('DOMContentLoaded', () => {

  /* -----------------------------
     Défilement vers la section suivante
  ----------------------------- */
  const bouton = document.querySelector('.bouton');

  if (bouton) {
    bouton.addEventListener('click', (e) => {
      e.preventDefault();
      const cible = document.querySelector(bouton.getAttribute('href'));
      if (cible) {
        // Fait défiler la page en douceur
        cible.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  /* -----------------------------
     Animation des prénoms défilants
  ----------------------------- */
  const sectionPrenoms = document.getElementById('liste-prenoms');
  const zoneTexte = document.getElementById('prenoms-defilant');

  if (sectionPrenoms && zoneTexte) {
    // On récupère le fichier CSV
    fetch('data/noms.csv')
      .then(reponse => reponse.text())
      .then(texte => {
        // On sépare les lignes et on retire les vides
        const lignes = texte.split('\n').filter(l => l.trim() !== '');

        // Si la première ligne est un titre, on l’enlève
        if (lignes[0].toLowerCase() === 'en_name') {
          lignes.shift();
        }

        // On met les prénoms les uns à la suite
        const texteFinal = lignes.join(' – ');
        // On double le texte pour que la boucle soit fluide
        zoneTexte.textContent = texteFinal + ' – ' + texteFinal;

        let x = 0;
        const vitesse = 1.5;

        // Fonction qui fait défiler le texte
        function defile() {
          x -= vitesse;
          if (x <= -zoneTexte.scrollWidth / 2) {
            x = 0;
          }
          zoneTexte.style.transform = `translate(${x}px, -50%)`;
          requestAnimationFrame(defile);
        }

        // On lance l’animation
        defile();
      })
      .catch(() => {
        zoneTexte.textContent = 'Noms indisponibles.';
      });
  }

/* === Timeline === */
  fetch("data.json")
    .then(r => {
      if (!r.ok) throw new Error(`Erreur HTTP: ${r.status}`);
      return r.json();
    })
    .then(events => {
      const container = document.getElementById("timelineContainer");
      if (!container) return;

      // Structure principale
      container.innerHTML = `
        <div class="timeline-dates-container">
          <div class="timeline-dates-bar"></div>
        </div>
        <div class="timeline-carousel-container">
          <div class="timeline-wrapper">
            <button class="nav-button" id="prevButton">&lt;</button>
            <div class="timeline-carousel-viewport">
              <div class="timeline-carousel"></div>
            </div>
            <button class="nav-button" id="nextButton">&gt;</button>
          </div>
          <div class="timeline-progress">
            <div class="timeline-progress-bar"></div>
          </div>
        </div>
      `;

      // Sélection des éléments
      const datesBar = container.querySelector('.timeline-dates-bar');
      const carousel = container.querySelector('.timeline-carousel');
      const prevButton = document.getElementById('prevButton');
      const nextButton = document.getElementById('nextButton');
      const progressBar = container.querySelector('.timeline-progress-bar');

      let currentIndex = 0;

      // Création des dates
      events.forEach((event, index) => {
        const dateItem = document.createElement("div");
        dateItem.className = "date-item";
        dateItem.textContent = event.date;
        dateItem.dataset.index = index;
        datesBar.appendChild(dateItem);
      });

      // Création des cartes
      events.forEach(event => {
        const card = document.createElement("div");
        card.className = "timeline-card";
        card.innerHTML = `
          <div class="image-container">
            <img src="${event.image}" alt="${event.title}" onerror="this.src='img/placeholder.jpg'">
          </div>
          <span class="card-date">${event.date}</span>
          <h3>${event.title}</h3>
          <p>${event.text}</p>
          ${event.link ? `
            <a href="${event.link}" target="_blank" class="popup-link">
              <div class="link-circle">
                <img src="img/lien.png" alt="Lien">
              </div>
            </a>` : ''}
        `;
        carousel.appendChild(card);
      });



      const updateTimeline = () => {
        // Active la bonne date
        document.querySelectorAll('.date-item').forEach((item, i) => {
          item.classList.toggle('active', i === currentIndex);
        });

        // Met à jour la barre de progression
        progressBar.style.width = `${((currentIndex + 1) / events.length) * 100}%`;

        // Fait défiler la frise sans bouger la page
        const activeDate = datesBar.children[currentIndex];
        const scrollLeft = activeDate.offsetLeft - (datesBar.clientWidth / 2) + (activeDate.offsetWidth / 2);
        datesBar.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });

        // Gère les boutons
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === events.length - 1;
      };

      const goToSlide = index => {
        if (index < 0 || index >= events.length) return;
        currentIndex = index;
        carousel.style.transform = `translateX(${-index * 100}%)`;
        updateTimeline();
      };

  
      prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));
      nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));

      datesBar.addEventListener('click', e => {
        if (e.target.classList.contains('date-item')) {
          goToSlide(+e.target.dataset.index);
        }
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
        if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
      });

      window.addEventListener('resize', updateTimeline);

      // Initialisation
      goToSlide(0);
    })
    .catch(() => {
      const container = document.getElementById("timelineContainer");
      if (container)
        container.innerHTML = `
          <p style="text-align:center;color:var(--rouge);padding:40px;">
            Erreur de chargement des données.<br>Vérifie le fichier <b>data.json</b>.
          </p>`;
    });
  
  /* -----------------------------
     Fenêtre de contacts
  ----------------------------- */
  const boutonContact = document.querySelector('.bouton-contact');
  const fenetre = document.querySelector('#fenetre-contacts');
  const boutonFermer = document.querySelector('.fermer-fenetre');

  if (boutonContact && fenetre && boutonFermer) {

    // Ouvrir la fenêtre
    boutonContact.addEventListener('click', (e) => {
      e.preventDefault();
      fenetre.style.display = 'flex';
    });

    // Fermer avec la croix
    boutonFermer.addEventListener('click', () => {
      fenetre.style.display = 'none';
    });

    // Fermer en cliquant en dehors
    fenetre.addEventListener('click', (e) => {
      if (e.target === fenetre) {
        fenetre.style.display = 'none';
      }
    });
  }
});
//======================
//======================
// chiffres qui defilent
//======================
//======================

// CHIFFRES QUI DÉFILENT — RELANCE À CHAQUE SCROLL
document.addEventListener("DOMContentLoaded", () => {
  const valeurs = document.querySelectorAll(".valeur");

  const startAnimation = () => {
    // Réinitialise les valeurs à 0
    valeurs.forEach(el => el.textContent = "0");

    const duration = 2000;
    const steps = 100;
    const intervalTime = duration / steps;

    const increments = [];

    valeurs.forEach(el => {
      const target = +el.getAttribute("data-target");
      increments.push({
        el,
        target,
        current: 0,
        step: target / steps
      });
    });

    const interval = setInterval(() => {
      increments.forEach(item => {
        item.current += item.step;
        if (item.current >= item.target) item.current = item.target;
        item.el.textContent = "+ " + Math.floor(item.current).toLocaleString("fr-FR");
      });

      if (increments.every(i => i.current >= i.target)) {
        clearInterval(interval);
      }
    }, intervalTime);
  };

  // Observez l'entrée dans #chiffres
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) startAnimation();
    });
  }, { threshold: 0.3 });

  const section = document.querySelector("#chiffres");
  observer.observe(section);
});


// ============================================================
// Carte interactive : Reconnaissance de l'État palestinien
// ============================================================

am5.ready(function() {

  // --- Création du root ---
  var root = am5.Root.new("mapdiv");
  root.setThemes([am5themes_Dark.new(root)]);
  
  // Projections 2D et globe
  var projection2D = am5map.geoMercator();
  var projection3D = am5map.geoOrthographic();
  
  // --- Création de la carte (vue 2D par défaut) ---
  var chart = root.container.children.push(am5map.MapChart.new(root, {
      projection: projection2D,
      panX: "translateX",    // déplacement horizontal pour carte 2D
      panY: "translateY",    // déplacement vertical pour carte 2D
      wheelY: "zoom",        // zoom à la molette
      pinchZoom: true        // zoom tactile
  }));
  
  // Zoom fluide et contrôlé
  chart.set("zoomStep", 1.5);          // zoom progressif (1.5 = bon équilibre)
  chart.set("wheelSensitivity", 0.5);  // sensibilité molette (0.5 = fluide)
  chart.set("animationDuration", 300); // transitions douces mais rapides
  chart.set("minZoomLevel", 1);        // zoom minimum (vue monde)
  chart.set("maxZoomLevel", 16);       // zoom maximum (détails pays)
  
  // Activer l'interactivité
  chart.chartContainer.set("wheelable", true);
  
  // --- Série des pays ---
  var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
      exclude: ["AQ"] // pas d'Antarctique
  }));
  
  // --- Couleurs selon le statut ---
  var colorByStatus = {
      "1988": am5.color(0xa2d39b),                 // vert clair
      "1989–2023": am5.color(0x2c9c4b),           // vert moyen
      "2024": am5.color(0x46c16a),                // vert vif
      "2025": am5.color(0x004d22),                // vert foncé
      "Ne reconnaît pas l'État palestinien": am5.color(0xe05a5a) // rouge
  };
  
  // --- Chargement du JSON ---
  fetch("data/reconnaissance-palestine.json")
      .then(response => response.json())
      .then(data => {
          polygonSeries.data.setAll(data);
  
          polygonSeries.events.on("datavalidated", function() {
              polygonSeries.mapPolygons.each(function(polygon) {
                  var info = polygon.dataItem && polygon.dataItem.dataContext;
                  if (info && info.status) {
                      var statut = info.status;
  
                      // Uniformiser "Ne reconnaît pas"
                      if (statut === "Ne reconnaît pas") {
                          statut = "Ne reconnaît pas l'État palestinien";
                      }
  
                      var couleur = colorByStatus[statut] || am5.color(0x555555);
                      polygon.set("fill", couleur);
                  }
              });
          });
      })
      .catch(() => console.log("Erreur lors du chargement des données JSON."));
  
  // --- Tooltip au survol ---
  polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{nom}\nStatut : {status}",
      interactive: true
  });
  
  // ==============================
  // Bouton : vue carte / vue globe
  // ==============================
  const boutonFleche = document.getElementById("mode-globe");
  const texteBouton  = document.querySelector(".texte-bouton-carte");
  const iconeGlobe   = document.querySelector(".icone-globe");
  let estGlobe = false;
  
  if (boutonFleche && texteBouton && iconeGlobe) {
      boutonFleche.addEventListener("click", () => {
          estGlobe = !estGlobe;
  
          // Changer la projection ET les contrôles
          if (estGlobe) {
              chart.set("projection", projection3D);
              chart.set("panX", "rotateX");  // rotation pour globe
              chart.set("panY", "rotateY");
          } else {
              chart.set("projection", projection2D);
              chart.set("panX", "translateX");  // déplacement pour carte
              chart.set("panY", "translateY");
          }
  
          // Changer le texte
          texteBouton.textContent = estGlobe
              ? 'Mode carte'
              : 'Mode globe';
  
          // Changer l'icône
          iconeGlobe.src = estGlobe
              ? "img/icon-carte.png"
              : "img/icon-globe.png";
      });
  } else {
      console.log("Bouton globe : éléments HTML introuvables");
  }
  
  // ==============================
  // Légende cliquable
  // ==============================
  const itemsLegende = document.querySelectorAll(".legende-carte li");
  let statutsMasques = new Set();
  
  function mettreAJourCarte() {
      polygonSeries.mapPolygons.each((polygon) => {
          const statut = polygon.dataItem?.dataContext?.status;
          polygon.set("fillOpacity", statutsMasques.has(statut) ? 0.15 : 1);
      });
  }
  
  itemsLegende.forEach((item) => {
      item.addEventListener("click", () => {
          const statut = item.textContent.trim();
  
          if (statutsMasques.has(statut)) {
              statutsMasques.delete(statut);
              item.classList.remove("masque");
          } else {
              statutsMasques.add(statut);
              item.classList.add("masque");
          }
  
          mettreAJourCarte();
      });
  });
  
  // --- Crédit amCharts ---
  chart.chartContainer.children.push(am5.Label.new(root, {
      text: "© amCharts",
      fontSize: 12,
      fill: am5.color(0x888888),
      x: am5.p100,
      centerX: am5.p100,
      y: am5.p100,
      centerY: am5.p100,
      dy: -5
  }));
  
  }); // fin am5.ready










