/* Cazador de Letras - 3 niveles */
const images = [
  { id: 'bruja', file: 'Bruja.png', label: 'BRUJA', phrases: ['La bruja vuela en su escoba.', 'Tiene un sombrero puntiagudo.'] },
  { id: 'duende', file: 'Duende.png', label: 'DUENDE', phrases: ['El duende es pequeño y travieso.', 'Le gusta esconder tesoros.'] },
  { id: 'fantasma', file: 'Fantasma.png', label: 'FANTASMA', phrases: ['El fantasma aparece de noche.', 'Dice ¡buu! para asustar.'] },
  { id: 'hada', file: 'Hada.png', label: 'HADA', phrases: ['El hada tiene alas brillantes.', 'Usa polvo mágico.'] },
  { id: 'heroe', file: 'Súper héroe.png', label: 'HEROE', phrases: ['El superhéroe ayuda a la gente.', 'Usa una capa.'] },
  { id: 'lobo', file: 'Lobo.png', label: 'LOBO', phrases: ['El lobo aúlla de noche.', 'Corre muy rápido.'] },
  { id: 'mago', file: 'Mago.png', label: 'MAGO', phrases: ['El mago hace trucos con su varita.', 'Tiene barba.'] },
  { id: 'monstruo', file: 'Monstruo.png', label: 'MONSTRUO', phrases: ['El monstruo es grande y divertido.', 'Tiene muchos dientes.'] },
  { id: 'ogro', file: 'Ogro.png', label: 'OGRO', phrases: ['El ogro vive en el bosque.', 'Es muy fuerte.'] },
  { id: 'pirata', file: 'Pirata.png', label: 'PIRATA', phrases: ['El pirata navega en su barco.', 'Busca tesoros.'] },
  { id: 'princesa', file: 'Princesa.png', label: 'PRINCESA', phrases: ['La princesa vive en un castillo.', 'Le gusta leer.'] },
  { id: 'rata', file: 'Rata.png', label: 'RATA', phrases: ['La rata es pequeña.', 'Corre por la cocina.'] },
  { id: 'rey', file: 'Rey.png', label: 'REY', phrases: ['El rey usa una corona.', 'Vive en un palacio.'] },
  { id: 'tigre', file: 'Tigre.png', label: 'TIGRE', phrases: ['El tigre tiene rayas.', 'Corre y salta.'] },
  { id: 'tortuga', file: 'Tortuga.png', label: 'TORTUGA', phrases: ['La tortuga tiene caparazón.', 'Camina lento.'] },
  { id: 'unicornio', file: 'Unicornio.png', label: 'UNICORNIO', phrases: ['El unicornio tiene un cuerno.', 'Le gusta el arcoíris.'] },
  { id: 'vampiro', file: 'Vampiro.png', label: 'VAMPIRO', phrases: ['El vampiro duerme de día.', 'Le gustan las capas.'] },
];

const GALLERY_SIZE = 3;

function pickRandom(list, n) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function toMissingWord(word) {
  // Selecciona hasta 3 letras (vocales o S,M,N,L) para ocultar
  const removeSet = new Set(['A','E','I','O','U','S','M','N','L']);
  const chars = word.split('');
  const candidates = [];
  for (let i = 0; i < chars.length; i++) {
    if (removeSet.has(chars[i])) candidates.push(i);
  }
  // barajar y tomar máximo 3, mínimo 1 si hay candidatos
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const pick = candidates.slice(0, Math.min(3, Math.max(1, candidates.length)));
  const missing = pick.map(idx => ({ ch: chars[idx], idx }));
  const display = chars.map((ch, idx) => (pick.includes(idx) ? '_' : ch));
  return { display: display.join(''), missing };
}

function renderLevel1(playground, img) {
  const { display, missing } = toMissingWord(img.label);
  const container = document.createElement('div');
  container.className = 'level1';
  const gapsHtml = display.split('').map((ch, idx) => ch === '_' ? `<span class="gap" data-idx="${idx}"></span>` : `<span>${ch}</span>`).join('');
  container.innerHTML = `
    <h3 class="play-title">Nivel 1: Completá la palabra</h3>
    <div class="content">
      <div>
        <div class="word">${gapsHtml}</div>
        <div class="chips" id="chips"></div>
        <div class="feedback" id="fb"></div>
        <div class="row-actions"><button id="again" class="btn-next">Otra imagen →</button></div>
      </div>
      <div class="picture">
        <img src="fotos/${img.file}" alt="${img.label}">
      </div>
    </div>
  `;
  playground.replaceChildren(container);

  // Crear fichas: letras faltantes + 2 vocales extra; barajar para evitar orden exacto
  const chips = container.querySelector('#chips');
  const vowels = ['A','E','I','O','U'];
  const inWordVowels = new Set(img.label.split('').filter(c => vowels.includes(c)));
  let pool = vowels.filter(v => !inWordVowels.has(v));
  // si no hay suficientes, completar desde todas las vocales
  if (pool.length < 2) {
    pool = vowels.slice();
  }
  // elegir 2 vocales extra
  const extraVowels = pickRandom(pool, 2);
  const letters = [
    ...missing.map(m => ({ letter: m.ch })),
    ...extraVowels.map(ch => ({ letter: ch }))
  ];
  // barajar
  const shuffled = pickRandom(letters, letters.length);
  shuffled.forEach((item, idx) => {
    const c = document.createElement('button');
    c.className = 'chip';
    c.textContent = item.letter;
    c.draggable = true;
    c.dataset.letter = item.letter;
    c.dataset.chipId = String(idx);
    chips.appendChild(c);
  });

  const fb = container.querySelector('#fb');
  const gaps = Array.from(container.querySelectorAll('.gap'));

  // Drag & Drop
  container.addEventListener('dragstart', e => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.classList.contains('chip') && !t.classList.contains('used')) {
      e.dataTransfer.setData('text/plain', JSON.stringify({ letter: t.dataset.letter, chipId: t.dataset.chipId }));
      t.style.opacity = '0.6';
    }
  });
  container.addEventListener('dragend', e => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.classList.contains('chip') && !t.classList.contains('used')) {
      t.style.opacity = '';
    }
  });

  container.addEventListener('dragover', e => {
    const overGap = e.target instanceof Element && e.target.classList.contains('gap');
    if (overGap) { e.preventDefault(); e.target.classList.add('over'); }
  });
  container.addEventListener('dragleave', e => {
    const tgt = e.target;
    if (tgt instanceof Element && tgt.classList.contains('gap')) tgt.classList.remove('over');
  });
  container.addEventListener('drop', e => {
    const tgt = e.target;
    if (!(tgt instanceof Element) || !tgt.classList.contains('gap')) return;
    e.preventDefault();
    tgt.classList.remove('over');
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    const { letter, chipId } = JSON.parse(data);
    const idx = Number(tgt.dataset.idx);
    // Verifica que esa posición pertenece al conjunto missing
    const expected = missing.find(m => m.idx === idx);
    if (expected && expected.ch === letter) {
      tgt.textContent = letter;
      tgt.classList.add('correct');
      const chip = chips.querySelector(`[data-chip-id="${chipId}"]`);
      if (chip) { chip.classList.add('used','correct'); chip.setAttribute('draggable','false'); }
      checkWin();
    } else {
      const chip = chips.querySelector(`[data-chip-id="${chipId}"]`);
      if (chip) { chip.classList.add('wrong'); setTimeout(() => chip.classList.remove('wrong'), 220); }
      try { playError(); } catch {}
    }
  });

  function checkWin() {
    const allPlaced = gaps.every(g => !g.classList.contains('gap') || g.textContent && g.textContent.length > 0);
    // Mejor: comparar cantidad de .correct con cantidad de missing
    const correctCount = container.querySelectorAll('.gap.correct').length;
    if (correctCount === missing.length) {
      // Overlay y sonido de éxito
      const overlay = document.getElementById('overlay');
      if (overlay) { overlay.classList.add('show'); setTimeout(() => overlay.classList.remove('show'), 1200); }
      try { playSuccess(); } catch {}
    }
  }

  container.querySelector('#again').addEventListener('click', () => startGallery(1));
}

function renderLevel2(playground, img) {
  // Tomar una frase del propio objeto de imagen
  const phrase = (img.phrases && img.phrases[0]) || 'Es una imagen.';
  // Remover sujeto inicial tipo: El/La/Los/Las + sustantivo
  function removeSubject(p) {
    return p.replace(/^\s*(El|La|Los|Las)\s+[^\s]+\s+/i, '');
  }
  const base = removeSubject(phrase).trim();
  const correct = base.charAt(0).toUpperCase() + base.slice(1); // objetivo segmentado correcto (con mayúscula inicial)
  const condensed = correct.replace(/\s+/g, '').toUpperCase();

  const container = document.createElement('div');
  container.innerHTML = `
    <h3 class="play-title">Nivel 2 · Subnivel 2</h3>
    <p class="prompt">Leé el enunciado y escribilo segmentado correctamente:</p>
    <div class="sentence" style="font-size:18px;margin-bottom:8px;">${condensed}</div>
    <div class="input-row"><input type="text" id="seg" placeholder="Escribí el enunciado segmentado"/></div>
    <div class="guide">Pista: Empezá con mayúscula y usá espacios.</div>
    <div class="gallery-grid" style="margin-top:12px;" id="opts"></div>
    <div class="row-actions"><button id="check2" class="btn-primary">Comprobar</button><button id="again2" class="btn-next">Otra imagen →</button></div>
    <div class="feedback" id="fb2"></div>
  `;
  playground.replaceChildren(container);
  // Construir 3 opciones (correcta + 2 distractores)
  const opts = container.querySelector('#opts');
  const distractors = pickRandom(images.filter(i => i.id !== img.id), 2);
  const options = pickRandom([img, ...distractors], 3);
  options.forEach(o => {
    const t = document.createElement('button');
    t.className = 'thumb';
    t.innerHTML = `<img src="fotos/${o.file}" alt="${o.label}">`;
    t.dataset.id = o.id;
    opts.appendChild(t);
  });
  let chosen = null;
  opts.addEventListener('click', e => {
    const b = e.target.closest('.thumb');
    if (!b) return;
    opts.querySelectorAll('.thumb').forEach(el => el.style.outline = '');
    b.style.outline = '3px solid #22c55e';
    chosen = b.dataset.id;
  });

  container.querySelector('#check2').addEventListener('click', () => {
    const fb = container.querySelector('#fb2');
    const seg = container.querySelector('#seg').value.trim();
    const segOk = seg.toLowerCase() === correct.toLowerCase();
    const imgOk = chosen === img.id;
    if (segOk && imgOk) {
      fb.textContent = '¡Excelente!'; fb.className = 'feedback ok';
      try { playSuccess(); } catch {}
      const overlay = document.getElementById('overlay');
      if (overlay) { overlay.classList.add('show'); setTimeout(() => overlay.classList.remove('show'), 1200); }
    }
    else { fb.textContent = `Pista: "${correct}"`; fb.className = 'feedback bad'; }
  });
  container.querySelector('#again2').addEventListener('click', () => startGallery(2));
}

function renderLevel3(playground, img) {
  const guides = ['Es', 'Tiene', 'Usa', 'Le gusta'];
  const container = document.createElement('div');
  container.innerHTML = `
    <h3 class="play-title">Nivel 3: Escribí 1-3 oraciones</h3>
    <img src="fotos/${img.file}" alt="${img.label}" style="width:100%;max-height:240px;object-fit:contain;border-radius:12px;border:1px solid rgba(0,0,0,0.08)"/>
    <div class="compose-row"><textarea id="s1" class="textarea-lines"></textarea></div>
    <div class="compose-row"><textarea id="s2" class="textarea-lines"></textarea></div>
    <div class="compose-row"><textarea id="s3" class="textarea-lines"></textarea></div>
    <div class="row-actions"><button id="finish" class="btn-primary">Terminar</button><button id="again3" class="btn-next">Otra imagen →</button></div>
    <div class="feedback" id="fb3"></div>
  `;
  playground.replaceChildren(container);
  // Prefijos dentro de los inputs, no editables (se restauran si se borran)
  const prefixes = ['Es ', 'Tiene ', 'Le gusta '];
  const areas = [container.querySelector('#s1'), container.querySelector('#s2'), container.querySelector('#s3')];
  areas.forEach((ta, i) => {
    const pref = prefixes[i];
    ta.value = pref;
    function enforcePrefix(e) {
      const start = ta.selectionStart;
      if (!ta.value.startsWith(pref)) {
        // Restaurar prefijo
        const rest = ta.value.replace(/^\s*/,'');
        ta.value = pref + rest.replace(new RegExp('^' + pref.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '',''), '');
      }
      // Evitar colocar el cursor dentro del prefijo
      if (ta.selectionStart < pref.length) {
        ta.selectionStart = ta.selectionEnd = pref.length;
      }
    }
    ta.addEventListener('input', enforcePrefix);
    ta.addEventListener('keydown', (e) => {
      // Bloquear backspace/delete dentro del prefijo
      const prefLen = pref.length;
      if ((e.key === 'Backspace' && ta.selectionStart <= prefLen && ta.selectionEnd <= prefLen) ||
          (e.key === 'Delete' && ta.selectionStart < prefLen)) {
        e.preventDefault();
      }
    });
    ta.addEventListener('click', () => {
      if (ta.selectionStart < pref.length) ta.selectionStart = ta.selectionEnd = pref.length;
    });
    ta.addEventListener('focus', () => {
      if (ta.selectionStart < pref.length) ta.selectionStart = ta.selectionEnd = pref.length;
    });
  });
  container.querySelector('#finish').addEventListener('click', () => {
    const s1 = container.querySelector('#s1').value.trim();
    const s2 = container.querySelector('#s2').value.trim();
    const s3 = container.querySelector('#s3').value.trim();
    const lines = [s1, s2, s3].filter(Boolean);
    const fb = container.querySelector('#fb3');
    if (lines.length === 0) { fb.textContent = 'Escribí al menos una oración.'; fb.className = 'feedback bad'; return; }
    if (lines.length > 3) { fb.textContent = 'Máximo 3 oraciones.'; fb.className = 'feedback bad'; return; }
    fb.textContent = '¡Genial! ¡Tus oraciones se ven muy bien!';
    fb.className = 'feedback ok';
  });
  container.querySelector('#again3').addEventListener('click', () => startGallery(3));
}

let currentLevel = null;

function startGallery(level) {
  currentLevel = level;
  const gallery = document.getElementById('gallery');
  const grid = document.getElementById('galleryGrid');
  const pg = document.getElementById('playground');
  grid.replaceChildren();
  pg.classList.add('hidden');
  // Nivel 2: mostrar subniveles
  if (level === 2) {
    gallery.classList.add('hidden');
    startLevel2Sublevels();
    return;
  }
  gallery.classList.remove('hidden');

  pickRandom(images, GALLERY_SIZE).forEach(img => {
    const btn = document.createElement('button');
    btn.className = 'thumb';
    btn.innerHTML = `<img src="fotos/${img.file}" alt="${img.label}"><div class="label">${img.label}</div>`;
    btn.addEventListener('click', () => startLevel(level, img));
    grid.appendChild(btn);
  });
}

function startLevel(level, img) {
  const gallery = document.getElementById('gallery');
  const pg = document.getElementById('playground');
  gallery.classList.add('hidden');
  pg.classList.remove('hidden');
  if (level === 1) return renderLevel1(pg, img);
  if (level === 2) { return renderLevel2(pg, img); }
  if (level === 3) return renderLevel3(pg, img);
}

// ----- Nivel 2: subniveles -----
function startLevel2Sublevels() {
  const pg = document.getElementById('playground');
  pg.classList.remove('hidden');
  const container = document.createElement('div');
  container.className = 'card';
  container.innerHTML = `
    <h3 class="play-title">Nivel 2 · Elegí subnivel</h3>
    <div class="level-buttons">
      <button class="level-btn" data-sub="b">1: Clic + elegir imagen correcta</button>
      <button class="level-btn" data-sub="c">2: Escribir + elegir imagen</button>
      <button class="level-btn" data-sub="d">3: Escribir (sin imágenes)</button>
    </div>
  `;
  pg.replaceChildren(container);
  container.addEventListener('click', e => {
    const btn = e.target instanceof Element && e.target.matches('.level-btn') ? e.target : null;
    if (!btn) return;
    const img = pickRandom(images, 1)[0];
    if (btn.dataset.sub === 'b') return renderLevel2ClickChoice(pg, img);
    if (btn.dataset.sub === 'c') return renderLevel2(pg, img);
    if (btn.dataset.sub === 'd') return renderLevel2WriteOnly(pg, img);
  });
}

function deriveLevel2Texts(img) {
  const phrase = (img.phrases && img.phrases[0]) || 'Es una imagen.';
  function removeSubject(p) {
    return p.replace(/^\s*(El|La|Los|Las)\s+[^\s]+\s+/i, '');
  }
  const base = removeSubject(phrase).trim();
  const correct = base.charAt(0).toUpperCase() + base.slice(1);
  const condensed = correct.replace(/\s+/g, '').toUpperCase();
  return { correct, condensed };
}

function renderLevel2ClickOnly(playground, img) {
  const { correct, condensed } = deriveLevel2Texts(img);
  const container = document.createElement('div');
  container.innerHTML = `
    <h3 class="play-title">Nivel 2 · Subnivel 3</h3>
    <div class="seg">
      <div>
        <p class="prompt">Separá haciendo clic entre letras:</p>
        <div class="seg-row" id="row"></div>
        <div class="seg-preview" id="preview"></div>
        <div class="row-actions"><button id="check" class="btn-primary">Comprobar</button><button id="again" class="btn-next">Otra imagen →</button></div>
        <div class="feedback" id="fb"></div>
      </div>
      <div class="picture"><img src="fotos/${img.file}" alt="${img.label}" style="width:100%;max-height:240px;object-fit:contain;border-radius:12px;border:1px solid rgba(0,0,0,0.08)"></div>
    </div>
  `;
  playground.replaceChildren(container);
  const row = container.querySelector('#row');
  const preview = container.querySelector('#preview');
  const chars = condensed.split('');
  const gapStates = Array(chars.length - 1).fill(false);
  for (let i = 0; i < chars.length; i++) {
    const l = document.createElement('span');
    l.className = 'seg-letter';
    l.textContent = chars[i];
    row.appendChild(l);
    if (i < chars.length - 1) {
      const g = document.createElement('span');
      g.className = 'seg-gap';
      g.dataset.idx = String(i);
      g.title = 'Click para separar';
      g.addEventListener('click', () => {
        gapStates[i] = !gapStates[i];
        g.classList.toggle('on', gapStates[i]);
        updatePreview();
      });
      row.appendChild(g);
    }
  }
  function updatePreview() {
    let out = '';
    for (let i = 0; i < chars.length; i++) {
      out += chars[i];
      if (i < gapStates.length && gapStates[i]) out += ' ';
    }
    preview.textContent = out;
  }
  updatePreview();
  container.querySelector('#check').addEventListener('click', () => {
    const fb = container.querySelector('#fb');
    const ok = preview.textContent.trim().toLowerCase() === correct.toLowerCase();
    if (ok) {
      fb.textContent = '¡Excelente!'; fb.className = 'feedback ok';
      try { playSuccess(); } catch {}
      const overlay = document.getElementById('overlay');
      if (overlay) { overlay.classList.add('show'); setTimeout(() => overlay.classList.remove('show'), 1200); }
    } else {
      fb.textContent = `Pista: "${correct}"`;
      fb.className = 'feedback bad';
    }
  });
  container.querySelector('#again').addEventListener('click', () => startGallery(2));
}

function renderLevel2WriteOnly(playground, img) {
  const { correct, condensed } = deriveLevel2Texts(img);
  const container = document.createElement('div');
  container.innerHTML = `
    <h3 class="play-title">Nivel 2 · Subnivel 3</h3>
    <p class="prompt">Leé el enunciado y escribilo separado en palabras:</p>
    <div class="sentence" style="font-size:18px;margin-bottom:8px;">${condensed}</div>
    <div class="lines-choice" id="lines"></div>
    <div id="composer" class="compose-inline" style="margin-top:12px;"></div>
    <div style="margin-top:12px; display:flex; justify-content:center;"><div class="gallery-grid" id="opts"></div></div>
    <div class="row-actions"><button id="check" class="btn-primary">Comprobar</button><button id="again" class="btn-next">Otra imagen →</button></div>
    <div class="feedback" id="fb"></div>
  `;
  playground.replaceChildren(container);
  // Elección de cantidad (3 opciones gráficas: 3, 4 o 5)
  const lines = container.querySelector('#lines');
  const choices = [3,4,5];
  const expectedWordCount = correct.split(/\s+/).length;
  choices.forEach(n => {
    const card = document.createElement('button');
    card.className = 'lines-card';
    card.innerHTML = `${Array.from({ length: n }, () => '<div class="line-preview"></div>').join('')}`;
    card.addEventListener('click', () => {
      // No permitir seguir si elige cantidad incorrecta
      lines.querySelectorAll('.lines-card').forEach(c => c.classList.remove('wrong'));
      if (n !== expectedWordCount) {
        card.classList.add('wrong');
        composer.innerHTML = '';
        try { playError(); } catch {}
        return;
      }
      buildComposer(n);
    });
    lines.appendChild(card);
  });
  const composer = container.querySelector('#composer');
  function buildComposer(n) {
    composer.innerHTML = Array.from({ length: n }, (_, i) => `<input class="compose-input" data-i="${i}" type="text" placeholder="Palabra ${i+1}">`).join('');
  }
  // Opciones de imágenes (3)
  const opts = container.querySelector('#opts');
  const distractors = pickRandom(images.filter(i => i.id !== img.id), 2);
  const options = pickRandom([img, ...distractors], 3);
  options.forEach(o => {
    const t = document.createElement('button');
    t.className = 'thumb';
    t.innerHTML = `<img src="fotos/${o.file}" alt="${o.label}">`;
    t.dataset.id = o.id;
    opts.appendChild(t);
  });
  let chosen = null;
  opts.addEventListener('click', e => {
    const b = e.target.closest('.thumb');
    if (!b) return;
    opts.querySelectorAll('.thumb').forEach(el => el.style.outline = '');
    b.style.outline = '3px solid #22c55e';
    chosen = b.dataset.id;
  });
  // Comprobación
  container.querySelector('#check').addEventListener('click', () => {
    const fb = container.querySelector('#fb');
    const words = Array.from(composer.querySelectorAll('.compose-input')).map(i => i.value.trim()).filter(Boolean);
    const seg = words.join(' ');
    const expectedWordCount = correct.split(/\s+/).length;
    if (words.length !== expectedWordCount) {
      fb.textContent = 'Elegí la cantidad correcta de divisiones.';
      fb.className = 'feedback bad';
      lines.querySelectorAll('.lines-card').forEach(c => c.classList.remove('wrong'));
      const idx = [3,4,5].indexOf(expectedWordCount);
      if (idx !== -1) lines.children[idx].classList.add('wrong');
      return;
    }
    const segOk = seg.toLowerCase() === correct.toLowerCase();
    const imgOk = chosen === img.id;
    if (segOk && imgOk) {
      fb.textContent = '¡Excelente!'; fb.className = 'feedback ok';
      try { playSuccess(); } catch {}
      const overlay = document.getElementById('overlay');
      if (overlay) { overlay.classList.add('show'); setTimeout(() => overlay.classList.remove('show'), 1200); }
    } else {
      fb.textContent = `Pista: "${correct}"`;
      fb.className = 'feedback bad';
    }
  });
  container.querySelector('#again').addEventListener('click', () => startGallery(2));
}

function renderLevel2ClickChoice(playground, img) {
  const { correct, condensed } = deriveLevel2Texts(img);
  const container = document.createElement('div');
  container.innerHTML = `
    <h3 class="play-title">Nivel 2 · Subnivel 1</h3>
    <p class="prompt">Separá el enunciado y elegí la imagen correcta:</p>
    <div class="seg-row" id="row"></div>
    <div class="seg-preview" id="preview"></div>
    <div class="gallery-grid" style="margin-top:12px;" id="opts"></div>
    <div class="row-actions"><button id="check" class="btn-primary">Comprobar</button><button id="again" class="btn-next">Otra imagen →</button></div>
    <div class="feedback" id="fb"></div>
  `;
  playground.replaceChildren(container);
  // seg UI
  const row = container.querySelector('#row');
  const preview = container.querySelector('#preview');
  const chars = condensed.split('');
  const gapStates = Array(chars.length - 1).fill(false);
  for (let i = 0; i < chars.length; i++) {
    const l = document.createElement('span');
    l.className = 'seg-letter';
    l.textContent = chars[i];
    row.appendChild(l);
    if (i < chars.length - 1) {
      const g = document.createElement('span');
      g.className = 'seg-gap';
      g.dataset.idx = String(i);
      g.title = 'Click para separar';
      g.addEventListener('click', () => {
        gapStates[i] = !gapStates[i];
        g.classList.toggle('on', gapStates[i]);
        updatePreview();
      });
      row.appendChild(g);
    }
  }
  function updatePreview() {
    let out = '';
    for (let i = 0; i < chars.length; i++) {
      out += chars[i];
      if (i < gapStates.length && gapStates[i]) out += ' ';
    }
    preview.textContent = out;
  }
  updatePreview();
  // opciones
  const opts = container.querySelector('#opts');
  const distractors = pickRandom(images.filter(i => i.id !== img.id), 2);
  const options = pickRandom([img, ...distractors], 3);
  options.forEach(o => {
    const t = document.createElement('button');
    t.className = 'thumb';
    t.innerHTML = `<img src="fotos/${o.file}" alt="${o.label}">`;
    t.dataset.id = o.id;
    opts.appendChild(t);
  });
  let chosen = null;
  opts.addEventListener('click', e => {
    const b = e.target.closest('.thumb');
    if (!b) return;
    opts.querySelectorAll('.thumb').forEach(el => el.style.outline = '');
    b.style.outline = '3px solid #22c55e';
    chosen = b.dataset.id;
  });
  container.querySelector('#check').addEventListener('click', () => {
    const fb = container.querySelector('#fb');
    const segOk = preview.textContent.trim().toLowerCase() === correct.toLowerCase();
    const imgOk = chosen === img.id;
    if (segOk && imgOk) {
      fb.textContent = '¡Excelente!'; fb.className = 'feedback ok';
      try { playSuccess(); } catch {}
      const overlay = document.getElementById('overlay');
      if (overlay) { overlay.classList.add('show'); setTimeout(() => overlay.classList.remove('show'), 1200); }
    } else {
      fb.textContent = `Pista: "${correct}"`;
      fb.className = 'feedback bad';
    }
  });
  container.querySelector('#again').addEventListener('click', () => startGallery(2));
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.level-btn').forEach(b => b.addEventListener('click', () => startGallery(Number(b.dataset.level))))
  // Sin botón volver en la galería
});

function playSuccess() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'triangle';
  o.frequency.value = 880; // la4
  o.connect(g); g.connect(ctx.destination);
  o.start();
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0.0, t);
  g.gain.linearRampToValueAtTime(0.4, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  o.stop(t + 0.4);
}

function playError() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.frequency.value = 220; // la3
  o.connect(g); g.connect(ctx.destination);
  o.start();
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0.0, t);
  g.gain.linearRampToValueAtTime(0.5, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  o.stop(t + 0.2);
}


