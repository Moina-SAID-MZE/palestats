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
// --- GRAPHIQUE AMCHARTS  ---

let root = null;
let currentChartType = 'morts'; 

const DATA_PATHS = {
  morts: {
      path: "data/mort-graphique.json", 
      title: "NOMBRE DE MORTS ANNUELS (2008 - 2022)",
      source1: "SOURCE 1",
      source2: "SOURCE 2",
      buttonText: "Changer de graphique : Blessés"
  },
  blesses: {
      path: "data/blesses-graphique.json", 
      title: "NOMBRE DE BLESSÉS ANNUELS (2008 - 2022)",
      //
      source1: "SOURCE 1", 
      source2: "SOURCE 2",
      buttonText: "Changer de graphique : Morts"
  }
};


function createChart(data, config) {
    if (root) {
        root.dispose(); 
    }
    
    // Racine
    root = am5.Root.new("amcharts-container");
    root.dom.style.height = "500px";
    root.dom.style.width = "100%";

    // Configuration des couleurs et du thème
    root.interfaceColors.set("text", am5.color(0xFFFFFF));
    root.setThemes([am5themes_Animated.new(root)]);
    
    chartColors = am5.ColorSet.new(root, {
      colors: [
        am5.color(0xDD4F01), // Couleur 1
        am5.color(0x007857)  // Couleur 2
      ]
    });

    var chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true, panY: true, wheelX: "panX", wheelY: "zoomX", pinchZoomX: true
    }));
    chart.set("colors", chartColors);
 

    // Curseur
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);
// Axe X
var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
  maxDeviation: 0.3,
  baseInterval: { timeUnit: "year", count: 1 },
  renderer: am5xy.AxisRendererX.new(root, { 
      strokeOpacity: 1, 
      stroke: am5.color(0xFFFFFF), 
      strokeWidth: 2 
  }),
  tooltip: am5.Tooltip.new(root, {})
}));

xAxis.get("renderer").labels.template.set("fill", am5.color(0xFFFFFF));

// GRILLE X
xAxis.get("renderer").grid.template.setAll({
    stroke: am5.color(0xFFFFFF),
    strokeOpacity: 0.2       
});


// Axe Y
var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
  maxDeviation: 0.3,
  renderer: am5xy.AxisRendererY.new(root, {
      strokeOpacity: 1, 
      stroke: am5.color(0xFFFFFF), 
      strokeWidth: 2 
  })
}));

yAxis.get("renderer").labels.template.set("fill", am5.color(0xFFFFFF));

//  GRILLE Y
yAxis.get("renderer").grid.template.setAll({
    stroke: am5.color(0xFFFFFF),
    strokeOpacity: 0.2      
});


    // --- SÉRIE 1 (Couleur 1) ---
    var series1 = chart.series.push(am5xy.LineSeries.new(root, {
      name: config.source1,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value1",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold]{name}:[/] {valueY}"
      })
    }));
    series1.set("stroke", am5.color(0xDD4F01));
    series1.strokes.template.setAll({ strokeWidth: 2 });
    series1.data.setAll(data);
    series1.appear(1000);

    // --- SÉRIE 2 (Couleur 2) ---
    var series2 = chart.series.push(am5xy.LineSeries.new(root, {
      name: config.source2,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value2",
      valueXField: "date",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold]{name}:[/] {valueY}"
      })
    }));
    series2.set("stroke", am5.color(0x007857));
    series2.strokes.template.setAll({ strokeDasharray: [2, 2], strokeWidth: 2 });
    series2.data.setAll(data);
    series2.appear(1000);


    // --- LÉGENDE ---
    var legend = chart.children.push(am5.Legend.new(root, {
        centerX: am5.p50, x: am5.p50, marginTop: 20, useDefaultMarker: true
    }));
    legend.labels.template.setAll({
        fontSize: 14, fontWeight: "800", fill: am5.color(0xFFFFFF), cursor: "pointer"
    });
    legend.labels.template.states.create("disabled", { opacity: 0.5, fill: am5.color(0xFFFFFF) });
    legend.data.setAll(chart.series.values);
    
    chart.appear(1000, 100);
}


function loadChartData(type) {
    const config = DATA_PATHS[type];
    const titleElement = document.getElementById('graph-title');
    const toggleTextElement = document.getElementById('toggle-text');
    
    // 1. Mettre à jour le titre
    if (titleElement) {
        titleElement.textContent = config.title.toUpperCase();
    }
    
    // 2. Mettre à jour le texte du bouton
    if (toggleTextElement) {
        toggleTextElement.textContent = config.buttonText;
    }

    // 3. Charger et dessiner le graphique
    fetch(config.path)
        .then(response => response.json())
        .then(json_data_raw => {
            const json_data = json_data_raw.map(item => ({
                date: new Date(item["Année"], 0, 1).getTime(),
                value1: item[config.source1],
                value2: item[config.source2]
            }));
            
            am5.ready(() => createChart(json_data, config));
        })
}


// --- Écouteur d'événement pour le Bouton de Bascule ---
document.addEventListener('DOMContentLoaded', () => {


    const toggleBtn = document.getElementById('toggle-chart-btn');

    if (toggleBtn) {
        // Charge le graphique "morts" au démarrage
        loadChartData(currentChartType);

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Basculer l'état
            currentChartType = (currentChartType === 'morts') ? 'blesses' : 'morts';
            
            // Recharger le graphique
            loadChartData(currentChartType);
        });
    } else {
        // Charger le graphique "morts" par défaut si le bouton n'est pas trouvé
        loadChartData(currentChartType);
    }
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

  /* -----------------------------
     Bouton Pastèque (Footer) - 
     Affiche le pop-up d'explication.
  ----------------------------- */
  const pastequeBouton = document.querySelector('.footer-pasteque');
  const popup = document.querySelector('.popup-pasteque');
  const closeButton = document.querySelector('.popup-close');

  if (pastequeBouton && popup && closeButton) {
    // 1. Ouvrir le pop-up au clic sur la pastèque
    pastequeBouton.addEventListener('click', (e) => {
      e.preventDefault();
      // Utilisation de 'flex' pour centrer l'élément comme défini dans le CSS
      popup.style.display = 'flex'; 
    });

    // 2. Fermer le pop-up au clic sur la croix (X)
    closeButton.addEventListener('click', () => {
      popup.style.display = 'none';
    });

    // 3. Fermer le pop-up au clic en dehors (sur l'arrière-plan de la fenêtre)
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.style.display = 'none';
      }
    });

    // 4. Fermer le pop-up avec la touche Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popup.style.display === 'flex') {
        popup.style.display = 'none';
      }
    });
  }
}); 

// chiffres qui defilent
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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) startAnimation();
    });
  }, { threshold: 0.3 });

  const section = document.querySelector("#chiffres");
  observer.observe(section);
});


// ==============================
// DESSIN MORTS
// ==============================

const boutons = document.querySelectorAll('.icon');
const imageDessin = document.getElementById('imageDessin');
const titre = document.querySelector('.bloc-haut h2');
const nombre = document.querySelector('.children');

boutons.forEach((bouton) => {
  bouton.addEventListener('click', () => {
   
    boutons.forEach(b => {
      b.classList.remove('active');
      const img = b.querySelector('img');
      let nom = img.src.split('/').pop(); 
      nom = nom.replace('-rouge.png', '').replace('-gris.png', '');
      img.src = `img/${nom}-gris.png`;
    });

    // Active le bouton
    bouton.classList.add('active');

    // Changer l'image principale
    const nouvelleImage = bouton.getAttribute('data-image');
    const nouveauID = bouton.getAttribute('data-id');
    imageDessin.src = nouvelleImage;

    imageDessin.classList.remove('dessin-enfant', 'dessin-homme', 'dessin-femme');
    // Ajoute le nouveau dessin
    imageDessin.classList.add(nouveauID);

    // Change le titre et le nombre
    titre.textContent = bouton.getAttribute('data-titre');
    nombre.textContent = bouton.getAttribute('data-nombre');

    // Change l'icône active en rouge
    const icone = bouton.querySelector('img');
    let nomActive = icone.src.split('/').pop();
    nomActive = nomActive.replace('-gris.png', '').replace('-rouge.png', '');
    icone.src = `img/${nomActive}-rouge.png`;
  });
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
  chart.set("zoomStep", 1.5);          
  chart.set("wheelSensitivity", 0.5); 
  chart.set("animationDuration", 300); 
  chart.set("minZoomLevel", 1);        
  chart.set("maxZoomLevel", 16);      
  
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











