// Carga los eventos desde events.json y los pinta como tarjetas.
// Para AGREGAR un evento: pon su imagen en assets/events/ y añade un objeto a events.json.
const MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

fetch('events.json')
  .then(r => r.json())
  .then(eventos => {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = '';

    // Ordena por fecha ascendente; los pasados quedan al final.
    eventos.sort((a, b) => a.fecha.localeCompare(b.fecha));

    for (const ev of eventos) {
      const [a, m, d] = ev.fecha.split('-');               // YYYY-MM-DD
      const dia = d, mes = MESES[parseInt(m, 10) - 1] || '';
      const card = document.createElement('article');
      card.className = 'event-card';
      card.innerHTML = `
        <div class="event-img">
          <img src="${ev.imagen}" alt="${ev.titulo}" loading="lazy">
          <div class="event-date"><span class="day">${dia}</span><span class="mon">${mes} ${a}</span></div>
        </div>
        <div class="event-body">
          <h3>${ev.titulo}</h3>
          <p>${ev.resumen || ''}</p>
          ${ev.enlace ? `<a class="cta-btn" href="${ev.enlace}" target="_blank" rel="noopener">Me interesa</a>` : ''}
        </div>`;
      grid.appendChild(card);
    }

    if (!eventos.length) grid.innerHTML = '<p class="events-loading">No hay eventos próximos.</p>';

    // Clic en una imagen -> verla en grande (lightbox)
    const lb = document.getElementById('lightbox');
    grid.addEventListener('click', e => {
      const img = e.target.closest('.event-img img');
      if (!img) return;
      lb.firstElementChild.src = img.src;
      lb.firstElementChild.alt = img.alt;
      lb.showModal();
    });
    lb.addEventListener('click', () => lb.close());
  })
  .catch(() => {
    document.getElementById('events-grid').innerHTML =
      '<p class="events-loading">No se pudieron cargar los eventos.</p>';
  });

// --- Mentoras: tarjetas con foto circular (estilo "Personal académico") ---
// Para agregar foto: pon el PNG en assets/mentoras/ y escribe el nombre en "foto" dentro de mentoras.json.
const iniciales = n => n.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

fetch('mentoras.json')
  .then(r => r.json())
  .then(lista => {
    const track = document.getElementById('mentoras-track');
    track.innerHTML = lista.map(m => `
      <article class="mentora">
        <div class="avatar">${m.foto
          ? `<img src="${m.foto}" alt="${m.nombre}" loading="lazy">`
          : `<span>${iniciales(m.nombre)}</span>`}</div>
        <h3>${m.nombre}</h3>
        <p>${m.rol || ''}</p>
      </article>`).join('');
  })
  .catch(() => {});

// Flechas de cualquier carrusel: desplaza ~85% del ancho visible
document.querySelectorAll('.car-arrow').forEach(btn => {
  btn.addEventListener('click', () => {
    const track = document.getElementById(btn.dataset.target);
    const dx = track.clientWidth * 0.85 * (btn.classList.contains('prev') ? -1 : 1);
    track.scrollBy({ left: dx, behavior: 'smooth' });
  });
});

// --- Eventos anteriores: carrusel banner (1 a la vez) desde eventos-pasados.json ---
// Para agregar uno: pon la imagen en assets/pasados/ y añade un objeto a eventos-pasados.json.
fetch('eventos-pasados.json')
  .then(r => r.json())
  .then(list => {
    const sec = document.getElementById('anteriores');
    if (!list.length) { sec.style.display = 'none'; return; }
    const track = document.getElementById('past-slides');
    const dotsBox = document.getElementById('past-dots');
    track.innerHTML = list.map(e => `
      <figure class="slide">
        <img src="${e.imagen}" alt="${e.titulo}">
        <figcaption><h3>${e.titulo}</h3><p>${e.info || ''}</p></figcaption>
      </figure>`).join('');
    dotsBox.innerHTML = list.map((_, i) =>
      `<button class="dot${i ? '' : ' active'}" data-i="${i}" aria-label="Ir al evento ${i + 1}"></button>`).join('');

    let idx = 0, timer;
    const restart = () => { clearInterval(timer); if (list.length > 1) timer = setInterval(() => go(idx + 1), 5000); };
    const go = i => {
      idx = (i + list.length) % list.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dotsBox.querySelectorAll('.dot').forEach((d, j) => d.classList.toggle('active', j === idx));
    };
    const nav = i => { go(i); restart(); };  // navegar manual reinicia el temporizador
    sec.querySelector('.slider-arrow.prev').addEventListener('click', () => nav(idx - 1));
    sec.querySelector('.slider-arrow.next').addEventListener('click', () => nav(idx + 1));
    dotsBox.querySelectorAll('.dot').forEach(d => d.addEventListener('click', () => nav(+d.dataset.i)));
    sec.addEventListener('mouseenter', () => clearInterval(timer));  // pausa al pasar el mouse
    sec.addEventListener('mouseleave', restart);
    restart();
  })
  .catch(() => { const s = document.getElementById('anteriores'); if (s) s.style.display = 'none'; });
