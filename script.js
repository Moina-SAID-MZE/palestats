document.addEventListener('DOMContentLoaded', () => {
  const bouton = document.querySelector('.bouton');
  if (bouton) {
    bouton.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(bouton.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const section = document.getElementById('liste-prenoms');
  const zone = document.getElementById('prenoms-defilant');

  if (!section || !zone) return;

  fetch('données/noms.csv')
    .then(r => r.text())
    .then(txt => {
      const lignes = txt.split('\n').map(l => l.trim()).filter(Boolean);
      const hasHeader = lignes[0].toLowerCase() === 'en_name';
      const noms = hasHeader ? lignes.slice(1) : lignes;
      const texte = noms.join(' – ');
      zone.textContent = texte + ' – ' + texte; // 🔹 duplication ici

      const containerWidth = section.clientWidth;
      const contentWidth = zone.scrollWidth;
      let x = 0;
      const speed = 1.5; // ajuste la vitesse (↑ = plus rapide)

      function defile() {
        x -= speed;
        if (Math.abs(x) >= contentWidth / 2) {
          // 🔹 quand la moitié du texte a défilé, on repart de 0
          x = 0;
        }
        zone.style.transform = `translate(${x}px, -50%)`;
        requestAnimationFrame(defile);
      }

      // déclenche uniquement quand la section est visible
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            defile();
            io.disconnect(); // on ne relance pas plusieurs fois
          }
        });
      }, { threshold: 0.2 });

      io.observe(section);
    })
    .catch(err => {
      console.error('Erreur CSV :', err);
      zone.textContent = 'Noms indisponibles.';
    });
});
