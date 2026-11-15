/* Sol & Cobre — editor de planos: abre el PDF y se dibuja encima (símbolos, arreglos de paneles, cables, medidas, notas)
   Coordenadas en puntos de la hoja (escala 1 de pdf.js, y hacia abajo). */
"use strict";

const PLANO = (() => {
  if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const PANEL = { w: 1.134, h: 2.278, sep: 0.02 }; // metros
  const SOLAR = "#C9821F", ELEC = "#1F4E79", NOTA = "#17211C";
  const SIMBOLOS = [
    { id: "panel", n: "Panel solar", c: SOLAR, grupo: "Solar" },
    { id: "inversor", n: "Inversor", c: SOLAR, grupo: "Solar" },
    { id: "bateria", n: "Batería", c: SOLAR, grupo: "Solar" },
    { id: "medidor", n: "Medidor", c: SOLAR, grupo: "Solar" },
    { id: "tablero", n: "Tablero", c: ELEC, grupo: "Eléctrico" },
    { id: "toma", n: "Tomacorriente", c: ELEC, grupo: "Eléctrico" },
    { id: "apagador", n: "Apagador", c: ELEC, grupo: "Eléctrico" },
    { id: "lampara", n: "Lámpara", c: ELEC, grupo: "Eléctrico" },
    { id: "reflector", n: "Reflector", c: ELEC, grupo: "Eléctrico" },
    { id: "tierra", n: "Tierra física", c: ELEC, grupo: "Eléctrico" }
  ];
  const CABLES = [
    { id: "pv", n: "Cable solar 6 mm² (DC)", c: "#C9821F", d: "7 4" },
    { id: "c10", n: "THHN 10 AWG en tubo", c: "#B23A2E", d: "" },
    { id: "c12", n: "THHN 12 AWG en tubo", c: "#1F4E79", d: "" }
  ];
  // Qué lleva cada marca en la cotización
  const RECETA = {
    panel: [["PAN-550", 1], ["EST-TL", 1], ["MO-PAN", 1]], inversor: [["INV-5K", 1]], bateria: [["BAT-5", 1]], tablero: [["TAB-12", 1]],
    toma: [["ACC-TOM", 1], ["ACC-CAJ", 1], ["MO-PTO", 1]], apagador: [["ACC-APA", 1], ["ACC-CAJ", 1], ["MO-PTO", 1]],
    lampara: [["LUM-PAN", 1], ["MO-PTO", 1]], reflector: [["LUM-REF", 1], ["MO-PTO", 1]], tierra: [["PRO-TIE", 1]], medidor: [],
    pv: [["CAB-PV6", 1]], c10: [["CAB-10", 1], ["DUC-34", 1], ["MO-CAB", 1]], c12: [["CAB-12", 1], ["DUC-34", 1], ["MO-CAB", 1]]
  };
  const HOLGURA = 1.1;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const largo = pts => pts.slice(1).reduce((s, p, i) => s + dist(pts[i], p), 0);
  const F = 'font-family="Helvetica, sans-serif"';

  /* ---------- Dibujo de cada marca (atributos en línea para poder exportarla) ---------- */
  function simbolo(m, escala) {
    const s = SIMBOLOS.find(x => x.id === m.s) || SIMBOLOS[0], c = s.c, r = 7;
    const g = (inner) => `<g data-m="${m.i}" transform="translate(${m.x} ${m.y})">${inner}</g>`;
    switch (m.s) {
      case "panel": { const w = PANEL.w * escala, h = PANEL.h * escala; return g(`<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#24364A" fill-opacity=".85" stroke="${c}" stroke-width="1"/><path d="M${-w / 2} 0H${w / 2}M0 ${-h / 2}V${h / 2}" stroke="#8FA3B8" stroke-width=".5"/>`); }
      case "inversor": return g(`<rect x="-9" y="-9" width="18" height="18" rx="2" fill="#FFF8EC" stroke="${c}" stroke-width="1.6"/><path d="M-5 1c1.6-4 3.4-4 5 0s3.4 4 5 0" fill="none" stroke="${c}" stroke-width="1.4"/><path d="M-5 -4h4" stroke="${c}" stroke-width="1.2"/>`);
      case "bateria": return g(`<rect x="-10" y="-6" width="20" height="12" rx="1.5" fill="#FFF8EC" stroke="${c}" stroke-width="1.6"/><path d="M10 -2.5h2.5v5H10M-6 0h4M-4 -2v4M3 0h4" stroke="${c}" stroke-width="1.2" fill="none"/>`);
      case "medidor": return g(`<circle r="${r + 1}" fill="#FFF8EC" stroke="${c}" stroke-width="1.6"/><text y="3.2" text-anchor="middle" font-size="8.5" font-weight="700" fill="${c}" ${F}>M</text>`);
      case "tablero": return g(`<rect x="-10" y="-7" width="20" height="14" fill="#EAF0F6" stroke="${c}" stroke-width="1.6"/><path d="M-10 7 10 -7" stroke="${c}" stroke-width="1"/><text y="-9.5" text-anchor="middle" font-size="6" font-weight="700" fill="${c}" ${F}>TB</text>`);
      case "toma": return g(`<circle r="${r}" fill="#FFF" stroke="${c}" stroke-width="1.5"/><path d="M-2.5 -3.5v7M2.5 -3.5v7" stroke="${c}" stroke-width="1.5"/>`);
      case "apagador": return g(`<circle r="${r}" fill="#FFF" stroke="${c}" stroke-width="1.5"/><text y="3" text-anchor="middle" font-size="8.5" font-weight="700" fill="${c}" ${F}>S</text>`);
      case "lampara": return g(`<circle r="${r + 1}" fill="#FFF" stroke="${c}" stroke-width="1.5"/><path d="M-5.6 -5.6 5.6 5.6M5.6 -5.6-5.6 5.6" stroke="${c}" stroke-width="1.3"/>`);
      case "reflector": return g(`<path d="M-8 6h16L4 -6h-8Z" fill="#FFF" stroke="${c}" stroke-width="1.5"/><path d="M-3 -9l-2-3M3 -9l2-3M0 -9v-3" stroke="${c}" stroke-width="1.1"/>`);
      case "tierra": return g(`<path d="M0 -8v8M-8 0h16M-5.5 3.5h11M-3 7h6" stroke="${c}" stroke-width="1.6" fill="none"/>`);
    }
    return "";
  }
  function arreglo(m, escala) {
    const cw = (m.rot ? PANEL.h : PANEL.w), ch = (m.rot ? PANEL.w : PANEL.h);
    const cols = Math.max(0, Math.floor((m.w / escala + PANEL.sep) / (cw + PANEL.sep)));
    const rows = Math.max(0, Math.floor((m.h / escala + PANEL.sep) / (ch + PANEL.sep)));
    let cel = "";
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) cel += `<rect x="${m.x + i * (cw + PANEL.sep) * escala}" y="${m.y + j * (ch + PANEL.sep) * escala}" width="${cw * escala}" height="${ch * escala}" fill="#24364A" fill-opacity=".86" stroke="#8FA3B8" stroke-width=".5"/>`;
    const n = cols * rows;
    return { n, cols, rows, svg: `<g data-m="${m.i}"><rect x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" fill="${SOLAR}" fill-opacity=".1" stroke="${SOLAR}" stroke-width="1.2" stroke-dasharray="5 3"/>${cel}<g transform="translate(${m.x + m.w / 2} ${m.y - 7})"><rect x="-34" y="-8" width="68" height="13" rx="6.5" fill="${SOLAR}"/><text y="1.8" text-anchor="middle" font-size="7.5" font-weight="700" fill="#FFF" ${F}>${n} paneles</text></g></g>` };
  }
  function etiqueta(x, y, txt, c) {
    const w = txt.length * 4.4 + 10;
    return `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="-7" width="${w}" height="12" rx="6" fill="#FFF" stroke="${c}" stroke-width=".8"/><text y="2" text-anchor="middle" font-size="7.2" font-weight="700" fill="${c}" ${F}>${esc(txt)}</text></g>`;
  }
  function svgMarcas(marcas, pg, escala) {
    let out = "";
    const lista = marcas.filter(m => m.pg === pg);
    // primero áreas y cables, encima los símbolos
    for (const m of lista) if (m.k === "arreglo") out += arreglo(m, escala).svg;
    for (const m of lista) if (m.k === "cable") {
      const c = CABLES.find(x => x.id === m.c) || CABLES[0];
      const pts = m.pts.map(p => p.join(",")).join(" ");
      const L = largo(m.pts) / escala, mid = m.pts[Math.floor((m.pts.length - 1) / 2)], nx = m.pts[Math.floor((m.pts.length - 1) / 2) + 1] || mid;
      out += `<g data-m="${m.i}"><polyline points="${pts}" fill="none" stroke="#FFF" stroke-width="5" stroke-linejoin="round" stroke-opacity=".8"/><polyline points="${pts}" fill="none" stroke="${c.c}" stroke-width="2" stroke-linejoin="round" stroke-dasharray="${c.d}"/>${etiqueta((mid[0] + nx[0]) / 2, (mid[1] + nx[1]) / 2, SYC.num(L, 1) + " m", c.c)}</g>`;
    }
    for (const m of lista) if (m.k === "cota") {
      const L = dist(m.a, m.b) / escala;
      out += `<g data-m="${m.i}"><line x1="${m.a[0]}" y1="${m.a[1]}" x2="${m.b[0]}" y2="${m.b[1]}" stroke="${NOTA}" stroke-width="1"/><circle cx="${m.a[0]}" cy="${m.a[1]}" r="2" fill="${NOTA}"/><circle cx="${m.b[0]}" cy="${m.b[1]}" r="2" fill="${NOTA}"/>${etiqueta((m.a[0] + m.b[0]) / 2, (m.a[1] + m.b[1]) / 2 - 8, SYC.num(L, 2) + " m", NOTA)}</g>`;
    }
    for (const m of lista) if (m.k === "sim") out += simbolo(m, escala);
    for (const m of lista) if (m.k === "nota") {
      const lineas = String(m.txt).match(/.{1,34}(\s|$)/g) || [m.txt];
      const w = Math.max(...lineas.map(l => l.length)) * 4.6 + 14, h = lineas.length * 10 + 8;
      out += `<g data-m="${m.i}" transform="translate(${m.x} ${m.y})"><rect x="0" y="0" width="${w}" height="${h}" rx="3" fill="#FFF6D6" stroke="#C9A227" stroke-width=".8"/>${lineas.map((l, j) => `<text x="7" y="${12 + j * 10}" font-size="7.6" fill="${NOTA}" ${F}>${esc(l.trim())}</text>`).join("")}</g>`;
    }
    return out;
  }

  /* ---------- Conteo de materiales desde las marcas ---------- */
  function conteo(plano) {
    const c = {}, e = plano.escala;
    for (const m of plano.marcas) {
      if (m.k === "sim") c[m.s] = (c[m.s] || 0) + 1;
      if (m.k === "arreglo") c.panel = (c.panel || 0) + arreglo(m, e).n;
      if (m.k === "cable") c[m.c] = (c[m.c] || 0) + largo(m.pts) / e * HOLGURA;
    }
    return c;
  }
  function partidas(plano, opcion) {
    const c = conteo(plano), sumas = {};
    for (const [k, v] of Object.entries(c)) for (const [sku, f] of RECETA[k] || []) {
      let usar = sku;
      // si la opción ya trae otro modelo del mismo tipo (ej. inversor híbrido), se respeta
      if (opcion && ["inversor", "bateria", "tablero", "panel"].includes(k) && f && sku === RECETA[k][0][0]) {
        const t = SYC.art(sku).t, otro = opcion.items.find(i => SYC.art(i.sku).t === t);
        if (otro) usar = otro.sku;
      }
      sumas[usar] = (sumas[usar] || 0) + v * f;
    }
    return Object.entries(sumas).map(([sku, cant]) => ({ sku, cant: SYC.art(sku).u === "metro" ? Math.ceil(cant * 2) / 2 : Math.round(cant) })).filter(x => x.cant > 0);
  }
  function pasarACotizacion(p, iop) {
    const ops = iop === "todas" ? p.opciones : [p.opciones[iop]];
    let n = 0;
    for (const op of ops) {
      const nuevas = partidas(p.plano, op);
      op.items = op.items.filter(it => it.origen !== "plano" && !nuevas.find(x => x.sku === it.sku));
      nuevas.forEach(x => { op.items.push({ sku: x.sku, cant: x.cant, precio: SYC.precio(x.sku), desc: 0, origen: "plano" }); n++; });
      op.items.sort((a, b) => SYC.TIPOS.findIndex(t => t.id === SYC.art(a.sku).t) - SYC.TIPOS.findIndex(t => t.id === SYC.art(b.sku).t));
    }
    return n;
  }

  /* ---------- pdf.js ---------- */
  const cache = new Map();
  async function documento(pdfId) {
    if (cache.has(pdfId)) return cache.get(pdfId);
    const v = await PDFS.obtener(pdfId); if (!v) throw new Error("No hay plano");
    const prom = pdfjsLib.getDocument({ data: new Uint8Array(v.bytes).slice() }).promise;
    cache.set(pdfId, prom); return prom;
  }
  async function pintarHoja(canvas, pdfId, pg, zoom) {
    const doc = await documento(pdfId); const page = await doc.getPage(pg);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const vp = page.getViewport({ scale: zoom * dpr });
    canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height);
    const vp1 = page.getViewport({ scale: 1 });
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
    return { w: vp1.width, h: vp1.height, paginas: doc.numPages };
  }

  /* ---------- Exportar la capa dibujada (PNG para el PDF y JPG para el enlace del cliente) ---------- */
  function svgCompleto(p, pg, w, h, fondo) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w * 2}" height="${h * 2}" viewBox="0 0 ${w} ${h}">${fondo || ""}${svgMarcas(p.plano.marcas, pg, p.plano.escala)}</svg>`;
  }
  const aImagen = svg => new Promise((ok, mal) => { const im = new Image(); im.onload = () => ok(im); im.onerror = mal; im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); });
  const aBytes = (cv, tipo, q) => new Promise(ok => cv.toBlob(b => b.arrayBuffer().then(ok), tipo, q));
  async function exportar(p) {
    if (!p.plano) return;
    const doc = await documento(p.plano.pdfId);
    const hojas = [...new Set(p.plano.marcas.map(m => m.pg))];
    for (let pg = 1; pg <= doc.numPages; pg++) {
      if (!hojas.includes(pg)) { await SYC.idb.quitar(`capa-${p.id}-${pg}`); await SYC.idb.quitar(`vista-${p.id}-${pg}`); continue; }
      const page = await doc.getPage(pg); const v1 = page.getViewport({ scale: 1 });
      const img = await aImagen(svgCompleto(p, pg, v1.width, v1.height));
      const cv = document.createElement("canvas"); cv.width = v1.width * 2; cv.height = v1.height * 2;
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      await SYC.idb.poner(`capa-${p.id}-${pg}`, { bytes: await aBytes(cv, "image/png") });
      // vista para el cliente: hoja + capa
      const cv2 = document.createElement("canvas"); const vp = page.getViewport({ scale: 1.6 });
      cv2.width = vp.width; cv2.height = vp.height; const cx = cv2.getContext("2d");
      cx.fillStyle = "#FFF"; cx.fillRect(0, 0, cv2.width, cv2.height);
      await page.render({ canvasContext: cx, viewport: vp }).promise;
      cx.drawImage(img, 0, 0, cv2.width, cv2.height);
      await SYC.idb.poner(`vista-${p.id}-${pg}`, { bytes: await aBytes(cv2, "image/jpeg", 0.84) });
    }
  }

  /* ---------- Editor ---------- */
  function montar(raiz, p, opts = {}) {
    const ico = (n, w) => (typeof window.__ico === "function" ? window.__ico(n, w) : "");
    let zoom = 1, hoja = (p.plano && p.plano.pg) || 1, paginas = 1, pagW = 792, pagH = 612;
    let herr = "mover", simSel = "toma", cableSel = "c12", sel = null, borrador = null, deshacer = [], arrastre = null;
    raiz.innerHTML = `
      <div class="pl">
        <div class="pl-barra" role="toolbar" aria-label="Herramientas del plano">
          <div class="pl-grupo">
            <button class="hb" data-h="mover" title="Mover y seleccionar">${ico("hand")}<span>Mover</span></button>
            <button class="hb" data-h="sim" title="Poner símbolo">${ico("plus")}<span>Símbolo</span></button>
            <button class="hb" data-h="arreglo" title="Arreglo de paneles">${ico("grid")}<span>Paneles</span></button>
            <button class="hb" data-h="cable" title="Cable">${ico("cable")}<span>Cable</span></button>
            <button class="hb" data-h="cota" title="Medir">${ico("ruler")}<span>Medir</span></button>
            <button class="hb" data-h="nota" title="Nota">${ico("note")}<span>Nota</span></button>
            <button class="hb" data-h="calibrar" title="Calibrar escala">${ico("scale")}<span>Escala</span></button>
          </div>
          <div class="pl-grupo">
            <button class="hb" data-a="deshacer" title="Deshacer">${ico("undo")}<span class="sr">Deshacer</span></button>
            <button class="hb" data-a="borrar" title="Borrar lo seleccionado" disabled>${ico("trash")}<span class="sr">Borrar</span></button>
            <button class="hb" data-a="menos" title="Alejar">${ico("minus")}<span class="sr">Alejar</span></button>
            <button class="hb" data-a="ajustar" title="Ajustar a la pantalla">${ico("fit")}<span class="sr">Ajustar</span></button>
            <button class="hb" data-a="mas" title="Acercar">${ico("plus")}<span class="sr">Acercar</span></button>
          </div>
        </div>
        <div class="pl-opc" data-opc></div>
        <div class="pl-cuerpo">
          <div class="pl-vista" data-vista tabindex="0" aria-label="Plano">
            <div class="pl-hoja" data-hoja><canvas data-cv></canvas><svg data-svg xmlns="http://www.w3.org/2000/svg"></svg></div>
            <div class="pl-vacio" data-vacio hidden>
              <div class="pl-vacio-in">${ico("file", 34)}<b>Suba el plano en PDF</b><p>El que le manda el cliente o el arquitecto. Se abre aquí y se dibuja encima; el original no se toca.</p>
              <div class="fila-b"><label class="btn btn-p">${ico("upload")} Subir plano<input type="file" accept="application/pdf" data-subir hidden></label><button class="btn" data-a="ejemplo">Usar plano de ejemplo</button></div></div>
            </div>
            <div class="pl-pista" data-pista></div>
          </div>
          <aside class="pl-lado">
            <div class="pl-hojas" data-hojas></div>
            <h3>Lo que lleva este plano</h3>
            <div data-conteo class="pl-conteo"></div>
            <div class="pl-pasar">
              <label class="campo"><span>Pasar a</span><select data-op></select></label>
              <button class="btn btn-p" data-a="pasar">${ico("arrowR")} Pasar a la cotización</button>
              <p class="fino">Las cantidades del plano reemplazan las mismas partidas. Lo que agregó a mano se queda.</p>
            </div>
            <div class="fila-b"><label class="btn btn-s">${ico("upload")} Otro plano<input type="file" accept="application/pdf" data-subir hidden></label><button class="btn btn-s" data-a="pdf">${ico("download")} Plano marcado</button></div>
            <p class="fino" data-escala></p>
          </aside>
        </div>
      </div>`;
    const $ = s => raiz.querySelector(s), $$ = s => [...raiz.querySelectorAll(s)];
    const vista = $("[data-vista]"), cont = $("[data-hoja]"), cv = $("[data-cv]"), svg = $("[data-svg]");

    const avisar = (t, o) => (window.aviso ? aviso(t, o) : console.log(t));
    const guardar = (() => { let tm; return () => { SYC.guardar(true, "plano"); clearTimeout(tm); tm = setTimeout(() => exportar(p).then(() => opts.alGuardar && opts.alGuardar()), 600); }; })();
    const foto = () => { deshacer.push(JSON.stringify(p.plano.marcas)); if (deshacer.length > 60) deshacer.shift(); };

    function opcionesHerr() {
      const o = $("[data-opc]");
      if (herr === "sim") o.innerHTML = `<span class="fino">Toque el plano para poner:</span>` + ["Solar", "Eléctrico"].map(gp => `<span class="pl-gp">${gp}</span>` + SIMBOLOS.filter(s => s.grupo === gp).map(s => `<button class="chip ${s.id === simSel ? "on" : ""}" data-sim="${s.id}"><svg viewBox="-13 -13 26 26" width="20" height="20" aria-hidden="true">${simbolo({ s: s.id, x: 0, y: 0, i: -1 }, 6)}</svg>${s.n}</button>`).join("")).join("");
      else if (herr === "cable") o.innerHTML = `<span class="fino">Toque punto por punto. Doble toque o «Terminar» para cerrar.</span>` + CABLES.map(c => `<button class="chip ${c.id === cableSel ? "on" : ""}" data-cab="${c.id}"><i class="raya" style="--c:${c.c};${c.d ? "--d:dashed" : ""}"></i>${c.n}</button>`).join("") + `<button class="btn btn-s" data-a="terminar">${ico("check")} Terminar</button>`;
      else if (herr === "arreglo") o.innerHTML = `<span class="fino">Arrastre sobre el techo: se llena de paneles reales de ${PANEL.w} × ${PANEL.h} m según la escala.</span>${sel != null && marca(sel)?.k === "arreglo" ? `<button class="btn btn-s" data-a="girar">${ico("rotate")} Girar paneles</button>` : ""}`;
      else if (herr === "cota") o.innerHTML = `<span class="fino">Toque dos puntos para medir.</span>`;
      else if (herr === "nota") o.innerHTML = `<span class="fino">Toque donde va la nota.</span>`;
      else if (herr === "calibrar") o.innerHTML = `<span class="fino">Toque dos puntos de una medida que conozca (por ejemplo la escala gráfica de 0 a 5 m) y escriba cuánto mide.</span>`;
      else o.innerHTML = `<span class="fino">Arrastre para moverse. Toque una marca para seleccionarla y arrástrela para cambiarla de lugar.</span>${sel != null && marca(sel)?.k === "arreglo" ? `<button class="btn btn-s" data-a="girar">${ico("rotate")} Girar paneles</button>` : ""}`;
      $$("[data-h]").forEach(b => b.classList.toggle("on", b.dataset.h === herr));
      vista.dataset.herr = herr;
    }
    const marca = i => p.plano && p.plano.marcas.find(m => m.i === i);

    function dibujar() {
      if (!p.plano) return;
      let extra = "";
      if (sel != null) {
        const g = svg.querySelector(`[data-m="${sel}"]`);
        if (g) { const b = g.getBBox(); extra += `<rect class="pl-sel" x="${b.x - 4}" y="${b.y - 4}" width="${b.width + 8}" height="${b.height + 8}" rx="3"/>`; }
      }
      if (borrador) {
        if (borrador.k === "cable" || borrador.k === "cota" || borrador.k === "calibrar") {
          const pts = [...borrador.pts, borrador.cursor].filter(Boolean);
          const c = borrador.k === "cable" ? (CABLES.find(x => x.id === cableSel).c) : "#17211C";
          extra += `<polyline points="${pts.map(q => q.join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="4 3"/>` + pts.map(q => `<circle cx="${q[0]}" cy="${q[1]}" r="2.6" fill="${c}"/>`).join("");
          if (pts.length > 1) extra += etiqueta(pts[pts.length - 1][0], pts[pts.length - 1][1] - 12, SYC.num(largo(pts) / p.plano.escala, 2) + " m", c);
        }
        if (borrador.k === "arreglo") extra += arreglo({ ...borrador, i: -1 }, p.plano.escala).svg;
      }
      svg.innerHTML = svgMarcas(p.plano.marcas, hoja, p.plano.escala) + `<g data-extra>${extra}</g>`;
      if (sel != null && !extra.includes("pl-sel")) { const g = svg.querySelector(`[data-m="${sel}"]`); if (g) { const b = g.getBBox(); svg.querySelector("[data-extra]").insertAdjacentHTML("afterbegin", `<rect class="pl-sel" x="${b.x - 4}" y="${b.y - 4}" width="${b.width + 8}" height="${b.height + 8}" rx="3"/>`); } }
      $("[data-a=borrar]").disabled = sel == null;
      lado();
    }
    function lado() {
      const c = conteo(p.plano), filas = [];
      const nombre = k => (SIMBOLOS.find(s => s.id === k) || CABLES.find(s => s.id === k) || {}).n || k;
      for (const k of [...SIMBOLOS.map(s => s.id), ...CABLES.map(s => s.id)]) if (c[k]) filas.push(`<li><span>${nombre(k)}</span><b>${CABLES.find(s => s.id === k) ? SYC.num(c[k], 1) + " m" : SYC.num(c[k])}</b></li>`);
      $("[data-conteo]").innerHTML = filas.length ? `<ul class="lista-c">${filas.join("")}</ul><p class="fino">Cables con ${Math.round((HOLGURA - 1) * 100)} % de holgura. Se calculan con la escala del plano.</p>` : `<p class="fino">Todavía no hay nada marcado. Elija «Símbolo», «Paneles» o «Cable» y toque el plano.</p>`;
      $("[data-op]").innerHTML = p.opciones.map((o, i) => `<option value="${i}">${esc(o.n)}</option>`).join("") + (p.opciones.length > 1 ? `<option value="todas">Todas las opciones</option>` : "");
      $("[data-escala]").textContent = `Escala: ${SYC.num(p.plano.escala, 1)} puntos = 1 m${p.plano.calibrada ? " (calibrada por usted)" : ""}. Hoja ${hoja} de ${paginas}.`;
      $("[data-hojas]").innerHTML = paginas > 1 ? Array.from({ length: paginas }, (_, i) => `<button class="chip ${i + 1 === hoja ? "on" : ""}" data-pg="${i + 1}">Hoja ${i + 1}${p.plano.marcas.some(m => m.pg === i + 1) ? " ·" : ""}</button>`).join("") : "";
    }
    async function pintar() {
      if (!p.plano) { $("[data-vacio]").hidden = false; cont.hidden = true; return; }
      $("[data-vacio]").hidden = true; cont.hidden = false;
      try {
        const r = await pintarHoja(cv, p.plano.pdfId, hoja, zoom);
        pagW = r.w; pagH = r.h; paginas = r.paginas;
        cv.style.width = cont.style.width = pagW * zoom + "px"; cv.style.height = cont.style.height = pagH * zoom + "px";
        svg.setAttribute("viewBox", `0 0 ${pagW} ${pagH}`); svg.setAttribute("width", pagW * zoom); svg.setAttribute("height", pagH * zoom);
        dibujar();
      } catch (e) { console.error(e); avisar("No se pudo abrir el plano.", { tipo: "mal" }); }
    }
    function ajustar() { zoom = Math.max(0.3, Math.min(3, (vista.clientWidth - 24) / pagW)); return pintar(); }
    const pt = e => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) / zoom, (e.clientY - r.top) / zoom]; };

    async function nuevoPlano(id, bytes, nombre) {
      if (bytes) await PDFS.guardarPDF(id, nombre, bytes, "subido");
      cache.delete(id);
      p.plano = { pdfId: id, pg: 1, escala: id === "plano-ejemplo" ? PDFS.ESC : 36, marcas: [], calibrada: false };
      hoja = 1; sel = null; deshacer = [];
      SYC.evento(p, "plano", "Plano agregado: " + (nombre || "plano de ejemplo"));
      guardar(); await pintar(); await ajustar();
      if (id !== "plano-ejemplo") { herr = "calibrar"; opcionesHerr(); avisar("Plano abierto. Primero calibre la escala con una medida conocida.", { tipo: "info" }); }
      else avisar("Plano de ejemplo abierto, con escala lista.", { tipo: "bien" });
    }
    function subir(input) {
      const f = input.files[0]; if (!f) return;
      if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) { avisar("Ese archivo no es PDF.", { tipo: "mal" }); return; }
      f.arrayBuffer().then(b => nuevoPlano("plano-" + p.id + "-" + Date.now().toString(36), b, f.name));
      input.value = "";
    }
    function pedir(titulo, valor, cb, tipo = "text") {
      if (window.dialogo) return dialogo({ titulo, campo: { valor, tipo }, ok: cb });
      const v = prompt(titulo, valor); if (v != null) cb(v);
    }

    /* ----- Eventos del lienzo ----- */
    svg.addEventListener("pointerdown", e => {
      if (!p.plano) return; e.preventDefault();
      const q = pt(e), hit = e.target.closest("[data-m]");
      if (herr === "mover") {
        if (hit) {
          sel = +hit.dataset.m; const m = marca(sel); foto();
          arrastre = { k: "mover", q0: q, orig: JSON.parse(JSON.stringify(m)), movio: false };
        } else { sel = null; arrastre = { k: "pan", x: e.clientX, y: e.clientY, sl: vista.scrollLeft, st: vista.scrollTop }; }
        svg.setPointerCapture(e.pointerId); opcionesHerr(); dibujar(); return;
      }
      if (herr === "sim") { foto(); const i = nextId(); p.plano.marcas.push({ i, k: "sim", s: simSel, x: q[0], y: q[1], pg: hoja }); sel = i; guardar(); dibujar(); return; }
      if (herr === "arreglo") { borrador = { k: "arreglo", x0: q[0], y0: q[1], x: q[0], y: q[1], w: 0, h: 0, rot: false }; svg.setPointerCapture(e.pointerId); return; }
      if (herr === "nota") { pedir("Escriba la nota", "", txt => { if (!txt.trim()) return; foto(); const i = nextId(); p.plano.marcas.push({ i, k: "nota", x: q[0], y: q[1], txt: txt.trim(), pg: hoja }); sel = i; guardar(); dibujar(); }); return; }
      if (herr === "cable") {
        if (!borrador) borrador = { k: "cable", pts: [] };
        const ult = borrador.pts[borrador.pts.length - 1];
        if (ult && dist(ult, q) < 4 / zoom) { terminarCable(); return; }
        borrador.pts.push(q); dibujar(); return;
      }
      if (herr === "cota" || herr === "calibrar") {
        if (!borrador) { borrador = { k: herr, pts: [q] }; dibujar(); return; }
        const a = borrador.pts[0], b = q; borrador = null;
        if (herr === "cota") { foto(); const i = nextId(); p.plano.marcas.push({ i, k: "cota", a, b, pg: hoja }); sel = i; guardar(); dibujar(); }
        else pedir("¿Cuántos metros mide esa línea?", "5", v => {
          const mts = parseFloat(String(v).replace(",", ".")); if (!(mts > 0)) { avisar("Escriba una medida en metros.", { tipo: "mal" }); return; }
          p.plano.escala = dist(a, b) / mts; p.plano.calibrada = true; guardar(); dibujar();
          avisar(`Escala lista: ${SYC.num(p.plano.escala, 1)} puntos por metro. Las medidas y los paneles ya son reales.`, { tipo: "bien" });
          herr = "mover"; opcionesHerr();
        }, "number");
      }
    });
    svg.addEventListener("pointermove", e => {
      if (!p.plano) return;
      const q = pt(e);
      if (arrastre && arrastre.k === "pan") { vista.scrollLeft = arrastre.sl - (e.clientX - arrastre.x); vista.scrollTop = arrastre.st - (e.clientY - arrastre.y); return; }
      if (arrastre && arrastre.k === "mover") {
        const m = marca(sel), dx = q[0] - arrastre.q0[0], dy = q[1] - arrastre.q0[1], o = arrastre.orig;
        if (Math.abs(dx) + Math.abs(dy) > 1) arrastre.movio = true;
        if (m.k === "cable") m.pts = o.pts.map(([x, y]) => [x + dx, y + dy]);
        else if (m.k === "cota") { m.a = [o.a[0] + dx, o.a[1] + dy]; m.b = [o.b[0] + dx, o.b[1] + dy]; }
        else { m.x = o.x + dx; m.y = o.y + dy; }
        dibujar(); return;
      }
      if (borrador && borrador.k === "arreglo" && e.buttons) {
        borrador.x = Math.min(borrador.x0, q[0]); borrador.y = Math.min(borrador.y0, q[1]);
        borrador.w = Math.abs(q[0] - borrador.x0); borrador.h = Math.abs(q[1] - borrador.y0); dibujar(); return;
      }
      if (borrador && (borrador.k === "cable" || borrador.k === "cota" || borrador.k === "calibrar")) { borrador.cursor = q; dibujar(); }
    });
    const soltar = () => {
      if (arrastre && arrastre.k === "mover") { if (arrastre.movio) guardar(); else deshacer.pop(); }
      arrastre = null;
      if (borrador && borrador.k === "arreglo") {
        if (borrador.w > 8 && borrador.h > 8) { foto(); const i = nextId(); const { x, y, w, h, rot } = borrador; p.plano.marcas.push({ i, k: "arreglo", x, y, w, h, rot, pg: hoja }); sel = i; guardar(); const n = arreglo(marca(i), p.plano.escala).n; avisar(n ? `Caben ${n} paneles en esa área.` : "En esa área no cabe ningún panel. Haga el área más grande.", { tipo: n ? "bien" : "info" }); }
        borrador = null; opcionesHerr(); dibujar();
      }
    };
    svg.addEventListener("pointerup", soltar); svg.addEventListener("pointercancel", soltar);
    svg.addEventListener("dblclick", () => { if (herr === "cable") terminarCable(); });
    function terminarCable() {
      if (!borrador || borrador.k !== "cable") return;
      if (borrador.pts.length >= 2) { foto(); const i = nextId(); p.plano.marcas.push({ i, k: "cable", c: cableSel, pts: borrador.pts, pg: hoja }); sel = i; guardar(); avisar(`Cable de ${SYC.num(largo(borrador.pts) / p.plano.escala, 1)} m agregado.`, { tipo: "bien" }); }
      borrador = null; dibujar();
    }
    const nextId = () => (p.plano.marcas.reduce((a, m) => Math.max(a, m.i), 0) + 1);

    raiz.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b || !raiz.contains(b)) return;
      if (b.dataset.h) { herr = b.dataset.h; borrador = null; if (herr !== "mover" && herr !== "arreglo") sel = null; opcionesHerr(); dibujar(); }
      if (b.dataset.sim) { simSel = b.dataset.sim; opcionesHerr(); }
      if (b.dataset.cab) { cableSel = b.dataset.cab; opcionesHerr(); dibujar(); }
      if (b.dataset.pg) { hoja = +b.dataset.pg; p.plano.pg = hoja; sel = null; borrador = null; pintar(); }
      const a = b.dataset.a;
      if (a === "deshacer") { if (!deshacer.length) return avisar("No hay nada que deshacer.", { tipo: "info" }); p.plano.marcas = JSON.parse(deshacer.pop()); sel = null; guardar(); dibujar(); }
      if (a === "borrar" && sel != null) { foto(); p.plano.marcas = p.plano.marcas.filter(m => m.i !== sel); sel = null; guardar(); opcionesHerr(); dibujar(); avisar("Marca borrada. Puede deshacerlo.", { tipo: "info", accion: ["Deshacer", () => { p.plano.marcas = JSON.parse(deshacer.pop()); guardar(); dibujar(); }] }); }
      if (a === "mas") { zoom = Math.min(4, zoom * 1.25); pintar(); }
      if (a === "menos") { zoom = Math.max(0.25, zoom / 1.25); pintar(); }
      if (a === "ajustar") ajustar();
      if (a === "terminar") terminarCable();
      if (a === "girar") { const m = marca(sel); if (m) { foto(); m.rot = !m.rot; guardar(); dibujar(); avisar(`Ahora caben ${arreglo(m, p.plano.escala).n} paneles.`, { tipo: "info" }); } }
      if (a === "ejemplo") nuevoPlano("plano-ejemplo");
      if (a === "pasar") {
        const v = $("[data-op]").value; const n = pasarACotizacion(p, v === "todas" ? "todas" : +v);
        SYC.evento(p, "plano", "Cantidades del plano pasadas a la cotización"); SYC.guardar(true, "cotizacion");
        avisar(`${n} partidas de la cotización salen ahora del plano.`, { tipo: "bien", accion: opts.irCotizacion ? ["Ver cotización", opts.irCotizacion] : null });
      }
      if (a === "pdf") { exportar(p).then(() => PDFS.planoMarcado(p)).then(b => { if (b) PDFS.descargar(b, `Plano marcado ${p.id}.pdf`); }); }
    });
    raiz.addEventListener("change", e => { if (e.target.matches("[data-subir]")) subir(e.target); });
    vista.addEventListener("keydown", e => {
      if ((e.key === "Delete" || e.key === "Backspace") && sel != null) $("[data-a=borrar]").click();
      if (e.key === "Escape") { borrador = null; sel = null; dibujar(); }
      if (e.key === "Enter") terminarCable();
    });
    let rz; const ro = new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(() => { if (p.plano && zoom === zAuto) ajustar().then(() => zAuto = zoom); }, 200); });
    let zAuto = -1;
    ro.observe(vista);

    opcionesHerr();
    (async () => { if (p.plano) { await pintar(); await ajustar(); zAuto = zoom; } else pintar(); })();
    return { destruir: () => ro.disconnect() };
  }

  return { montar, exportar, conteo, partidas, pasarACotizacion, svgMarcas, SIMBOLOS, CABLES, simbolo, documento, pintarHoja };
})();
