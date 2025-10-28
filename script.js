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
