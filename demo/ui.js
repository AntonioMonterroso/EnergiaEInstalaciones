/* Sol & Cobre — piezas de interfaz compartidas: íconos (Lucide, ISC), avisos propios y diálogos */
"use strict";

const ICO = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  battery: '<rect width="16" height="10" x="2" y="7" rx="2"/><path d="M22 11v2M6 11v2M10 11v2"/>',
  grid: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  cable: '<path d="M17 21v-2a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1"/><path d="M19 15V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V9"/><path d="M21 21v-2h-4"/><path d="M3 5h4V3"/><path d="M7 5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1V3"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/>',
  plug: '<path d="M12 22v-5M9 8V2M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
  panel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10M7 12h10M7 17h4"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  plus: '<path d="M5 12h14M12 5v14"/>', minus: '<path d="M5 12h14"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
  note: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/>',
  scale: '<path d="M21 3 3 21M21 3h-6M21 3v6M3 21h6M3 21v-6"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  fit: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  arrowR: '<path d="M5 12h14M12 5l7 7-7 7"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  box: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  pen: '<path d="M12 20h9"/><path d="M16.38 3.62a1 1 0 0 1 3 3L7.37 18.64a2 2 0 0 1-.86.5l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.86z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', chevL: '<path d="m15 18-6-6 6-6"/>', chevU: '<path d="m18 15-6-6-6 6"/>', chevD: '<path d="m6 9 6 6 6-6"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  merge: '<path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.17 2.87L4 22"/><path d="m20 22-5-5"/>',
  pin: '<path d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
  trend: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>'
};
const ico = (n, w = 18) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[n] || ""}</svg>`;
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const solSVG = (w = 22, c = "#F2B01E") => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="${c}"/><g stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></g></svg>`;

/* ---------- Avisos propios (nunca alert del navegador) ---------- */
function aviso(texto, o = {}) {
  let caja = document.querySelector(".avisos");
  if (!caja) { caja = document.createElement("div"); caja.className = "avisos"; caja.setAttribute("role", "status"); caja.setAttribute("aria-live", "polite"); document.body.appendChild(caja); }
  const tipo = o.tipo || "info";
  const icn = { bien: "check", mal: "alert", info: "info", vista: "eye" }[tipo] || "info";
  const el = document.createElement("div"); el.className = "av " + tipo;
  el.innerHTML = `<span class="ic">${ico(icn, 15)}</span><span>${esc(texto)}</span>${o.accion ? `<button type="button">${esc(o.accion[0])}</button>` : ""}`;
  if (o.accion) el.querySelector("button").onclick = () => { o.accion[1](); quitar(); };
  caja.appendChild(el);
  while (caja.children.length > 3) caja.firstChild.remove();
  let tm = setTimeout(quitar, o.dur || (o.accion ? 6500 : 3800));
  el.addEventListener("pointerenter", () => clearTimeout(tm));
  el.addEventListener("pointerleave", () => { tm = setTimeout(quitar, 2000); });
  function quitar() { clearTimeout(tm); el.classList.add("saliendo"); setTimeout(() => el.remove(), 200); }
}

/* ---------- Diálogos ---------- */
function dialogo({ titulo, html = "", campo, ok, okTxt = "Listo", cancelar = "Cancelar", alAbrir, ancho }) {
  const velo = document.createElement("div"); velo.className = "velo";
  velo.innerHTML = `<div class="dlg" role="dialog" aria-modal="true" aria-label="${esc(titulo)}" ${ancho ? `style="width:min(${ancho}px,100%)"` : ""}>
    <h2>${esc(titulo)}</h2>${html}
    ${campo ? `<label class="campo"><input data-campo type="${campo.tipo || "text"}" value="${esc(campo.valor || "")}" ${campo.tipo === "number" ? 'step="any" inputmode="decimal"' : ""}></label>` : ""}
    <div class="fila-b">${cancelar ? `<button class="btn" data-no>${esc(cancelar)}</button>` : ""}${ok !== false ? `<button class="btn btn-p" data-si>${esc(okTxt)}</button>` : ""}</div></div>`;
  document.body.appendChild(velo);
  const dlg = velo.querySelector(".dlg");
  const cerrar = () => { velo.classList.add("saliendo"); setTimeout(() => velo.remove(), 150); document.removeEventListener("keydown", tecla); };
  const aceptar = () => { const v = campo ? dlg.querySelector("[data-campo]").value : dlg; if (ok && ok(v, dlg) === false) return; cerrar(); };
  const tecla = e => { if (e.key === "Escape") cerrar(); if (e.key === "Enter" && campo && document.activeElement && document.activeElement.matches("[data-campo]")) aceptar(); };
  document.addEventListener("keydown", tecla);
  velo.addEventListener("pointerdown", e => { if (e.target === velo) cerrar(); });
  dlg.querySelector("[data-no]")?.addEventListener("click", cerrar);
  dlg.querySelector("[data-si]")?.addEventListener("click", aceptar);
  setTimeout(() => { const f = dlg.querySelector("[data-campo]") || dlg.querySelector("input, select, textarea, [data-si]"); f && f.focus(); }, 30);
  alAbrir && alAbrir(dlg, cerrar);
  return { dlg, cerrar };
}

/* ---------- Fotos de avance de muestra (dibujos propios) ---------- */
function fotoMuestra(tipo) {
  const cielo = '<defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC3DE"/><stop offset="1" stop-color="#E8EEF0"/></linearGradient></defs><rect width="320" height="240" fill="url(#c)"/>';
  const panelR = (x, y, w, h) => { let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#22374D" stroke="#C7D3DE" stroke-width="1.5"/>`; for (let i = 1; i < 3; i++) s += `<path d="M${x + i * w / 3} ${y}V${y + h}" stroke="#4A6580" stroke-width=".8"/>`; for (let j = 1; j < 6; j++) s += `<path d="M${x} ${y + j * h / 6}H${x + w}" stroke="#4A6580" stroke-width=".8"/>`; return s; };
  const esc = {
    bodega: `<rect width="320" height="240" fill="#D9D2C3"/><rect y="170" width="320" height="70" fill="#B8AE9B"/>${[0, 1, 2, 3].map(i => `<g transform="translate(${30 + i * 18} ${60 + i * 6}) skewX(-8)">${panelR(0, 0, 70, 110)}</g>`).join("")}<rect x="200" y="120" width="90" height="60" fill="#C08A4D"/><rect x="200" y="120" width="90" height="10" fill="#A9743B"/><rect x="215" y="85" width="60" height="35" fill="#C99A63"/>`,
    techo: `${cielo}<path d="M0 150 160 70 320 150V240H0Z" fill="#C9C1B0"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 20} ${150 - (i < 8 ? i * 10 : (16 - i) * 10)}V240" stroke="#AFA690" stroke-width="2"/>`).join("")}<g stroke="#8B8F94" stroke-width="5"><path d="M60 170 230 100"/><path d="M80 200 260 126"/></g>`,
    paneles: `${cielo}<path d="M0 150 160 70 320 150V240H0Z" fill="#C9C1B0"/>${[0, 1, 2, 3].map(i => `<g transform="translate(${44 + i * 56} ${168 - i * 23}) skewY(-24)">${panelR(0, -60, 50, 70)}</g>`).join("")}`,
    inversor: `<rect width="320" height="240" fill="#E7E2D6"/><rect y="200" width="320" height="40" fill="#CFC7B6"/><rect x="110" y="40" width="100" height="130" rx="6" fill="#F4F2EC" stroke="#9A9C98" stroke-width="2"/><rect x="132" y="66" width="56" height="30" rx="3" fill="#17211C"/><text x="160" y="86" text-anchor="middle" font-size="13" fill="#7CD39A" font-family="monospace">4.1 kW</text><circle cx="160" cy="128" r="9" fill="#B5652B"/><path d="M135 170v30M150 170v30M170 170v30" stroke="#333" stroke-width="4"/><rect x="230" y="70" width="50" height="40" fill="#D9D3C4" stroke="#9A9C98"/>`
  };
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240">${esc[tipo] || esc.paneles}</svg>`);
}
window.__ico = ico;
