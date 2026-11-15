/* Propuesta · Monterroso Dev Studio — precios en PLANES (quetzales, sin IVA, pago anual) */
"use strict";

const WA = "50237645139";
const IVA = 0.12;
const PLANES = [
  { id: "esencial", n: "Esencial", anual: 4800, para: "Para el instalador que quiere cotizar rápido y entregar en orden.",
    x: ["Cotizador con inventario por tipo", "Varias opciones por propuesta", "PDF de cotización con su marca", "Expediente en un solo PDF", "Documentos fijos en todas las propuestas", "2 usuarios"] },
  { id: "profesional", n: "Profesional", anual: 9600, rec: true, para: "Para la empresa que visita, dibuja y quiere cerrar más.",
    x: ["<b>Todo lo de Esencial</b>", "Plano en PDF para dibujar encima", "Conteo del plano a la cotización", "Enlace personal con su dominio", "Firma del cliente en línea", "Aviso cuando el cliente abre", "Etapas de obra con fotos", "5 usuarios"] },
  { id: "empresa", n: "Empresa", anual: 16800, para: "Para equipos con varias cuadrillas, bodegas o sucursales.",
    x: ["<b>Todo lo de Profesional</b>", "Varias bodegas y sucursales", "Permisos por puesto", "Ganancia real por proyecto", "Recordatorios de mantenimiento", "Catálogo completo cargado", "15 usuarios"] }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const Q = n => "Q " + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const calma = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Íconos (Lucide, ISC) */
const ICO = {
  play: '<polygon points="6 3 20 12 6 21 6 3"/>', eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>', arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>', chevD: '<path d="m6 9 6 6 6-6"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18"/>',
  pen: '<path d="M12 20h9"/><path d="M16.38 3.62a1 1 0 0 1 3 3L7.37 18.64a2 2 0 0 1-.86.5l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.86z"/>',
  files: '<path d="M20 7h-3a2 2 0 0 1-2-2V2"/><path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z"/><path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8"/>',
  eyeOff: '<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M2 2l20 20"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>',
  merge: '<path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.17 2.87L4 22"/><path d="m20 22-5-5"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>', chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  rotate: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>'
};
const ico = (n, w = 18) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICO[n] || ""}</svg>`;
function iconos(r = document) {
  $$("[data-i]", r).forEach(el => {
    const n = el.dataset.i; if (!ICO[n]) return;
    if (el.childNodes.length && el.textContent.trim()) el.insertAdjacentHTML("afterbegin", ico(n, el.matches("li") ? 17 : 18));
    else el.innerHTML = ico(n, el.matches(".demo-c .ic, .dolor .ic") ? 20 : 16);
    el.removeAttribute("data-i");
  });
}

/* Plano de muestra (dibujo propio): planta con símbolos y techo con paneles */
function planoSVG(conPaneles) {
  const m = 22, ox = 16, oy = 14; let s = "";
  for (let x = 0; x <= 14; x++) s += `<path d="M${ox + x * m} ${oy}V${oy + 10 * m}" stroke="#EEE" stroke-width=".6"/>`;
  for (let y = 0; y <= 10; y++) s += `<path d="M${ox} ${oy + y * m}H${ox + 14 * m}" stroke="#EEE" stroke-width=".6"/>`;
  s += `<rect x="${ox}" y="${oy}" width="${14 * m}" height="${10 * m}" fill="none" stroke="#111" stroke-width="3"/>`;
  s += `<path d="M${ox + 6.5 * m} ${oy}V${oy + 5.5 * m}M${ox + 10 * m} ${oy}V${oy + 10 * m}M${ox} ${oy + 5.5 * m}H${ox + 10 * m}M${ox + 4 * m} ${oy + 5.5 * m}V${oy + 10 * m}M${ox + 6 * m} ${oy + 5.5 * m}V${oy + 10 * m}" stroke="#111" stroke-width="1.6"/>`;
  const toma = (x, y, d) => `<g class="panel-sol" style="animation-delay:${d}ms" transform="translate(${ox + x * m} ${oy + y * m})"><circle r="6" fill="#fff" stroke="#24476B" stroke-width="1.4"/><path d="M-2 -3v6M2 -3v6" stroke="#24476B" stroke-width="1.3"/></g>`;
  const lamp = (x, y, d) => `<g class="panel-sol" style="animation-delay:${d}ms" transform="translate(${ox + x * m} ${oy + y * m})"><circle r="6.5" fill="#fff" stroke="#24476B" stroke-width="1.4"/><path d="M-4.5 -4.5 4.5 4.5M4.5 -4.5-4.5 4.5" stroke="#24476B" stroke-width="1.2"/></g>`;
  if (!conPaneles) {
    s += [toma(0.4, 3, 300), toma(6.2, 1.5, 360), toma(9.6, 2.5, 420), toma(0.4, 8, 480), toma(9.6, 8, 540)].join("");
    s += [lamp(3.2, 1.8, 600), lamp(8.2, 1.8, 660), lamp(2, 7.4, 720), lamp(5, 7.4, 780), lamp(8, 7.4, 840), lamp(12, 2.5, 900)].join("");
    s += `<g class="panel-sol" style="animation-delay:960ms"><rect x="${ox + 13 * m}" y="${oy + 6 * m}" width="18" height="18" rx="2" fill="#FFF6E2" stroke="#C27A00" stroke-width="1.5"/><path d="M${ox + 13 * m} ${oy + 6.4 * m}" /></g>`;
    s += `<polyline class="panel-sol" style="animation-delay:1020ms" points="${ox + 13.4 * m},${oy + 0.3 * m} ${ox + 13.4 * m},${oy + 6 * m}" fill="none" stroke="#C27A00" stroke-width="2" stroke-dasharray="6 4"/>`;
  } else {
    s += `<path d="M${ox} ${oy + 5 * m}H${ox + 14 * m}" stroke="#111" stroke-width="1.2" stroke-dasharray="6 4"/>`;
    let k = 0;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 6; i++) s += `<rect class="panel-sol" style="animation-delay:${200 + (k++) * 70}ms" x="${ox + (3.5 + i * 1.154) * m}" y="${oy + (5.2 + j * 2.298) * m}" width="${1.134 * m}" height="${2.278 * m}" fill="#24364A" stroke="#8FA3B8" stroke-width=".6"/>`;
    s += `<g class="panel-sol" style="animation-delay:1100ms" transform="translate(${ox + 7 * m} ${oy + 4.6 * m})"><rect x="-38" y="-9" width="76" height="16" rx="8" fill="#111"/><text y="3" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="Plus Jakarta Sans, sans-serif">12 paneles</text></g>`;
  }
  return `<svg viewBox="0 0 ${14 * m + 32} ${10 * m + 28}" role="img" aria-label="Plano de ejemplo con ${conPaneles ? "12 paneles sobre el techo" : "tomas y lámparas marcadas"}">${s}</svg>`;
}

/* Mini cotizador */
function miniCot() {
  const filas = [["Panel monocristalino 550 W", "Paneles solares", 12, 1350], ["Inversor híbrido 6 kW", "Inversores", 1, 15200], ["Batería de litio 5.12 kWh", "Baterías", 2, 13400], ["Cable solar 6 mm²", "Cable · por metro", 12.5, 14]];
  return `<div class="tipos"><span class="on">Todo</span><span>Paneles</span><span>Inversores</span><span>Baterías</span><span>Cable</span><span>Mano de obra</span></div>` +
    filas.map(([n, t, c, p]) => `<div class="mc-f"><span>${n}<small>${t}</small></span><span>${c}</span><b>${Q(c * p)}</b></div>`).join("") +
    `<div class="mc-t"><span>Total con IVA</span><b>${Q(79803.92)}</b></div>`;
}

/* Planes */
function planes() {
  const conIva = $("[data-iva]").checked;
  $("[data-planes]").innerHTML = PLANES.map(p => {
    const a = p.anual * (conIva ? 1 + IVA : 1);
    const msg = `Hola Antonio, vi la propuesta del sistema para energía e instalaciones y me interesa el plan ${p.n} (${Q(a)} al año${conIva ? " con IVA" : ""}).`;
    return `<article class="plan ${p.rec ? "rec" : ""}">${p.rec ? `<span class="ins">Recomendado</span>` : ""}
      <h3>${p.n}</h3><p class="para">${p.para}</p>
      <div class="precio"><b>${Q(a)}</b><span>al año${conIva ? ", con IVA" : ""}</span><p class="mes">Equivale a ${Q(a / 12)} al mes · un solo pago</p></div>
      <ul>${p.x.map(x => `<li>${ico("check", 17)}<span>${x}</span></li>`).join("")}</ul>
      <a class="btn ${p.rec ? "btn-n" : ""}" href="https://wa.me/${WA}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${p.rec ? ico("chat") : ""}Quiero el plan ${p.n}</a></article>`;
  }).join("");
}

/* Unir documentos (demostración) */
function unir() {
  const h = $("[data-hojas]"), r = $("[data-res]"), b = $("[data-unir]");
  // cada hoja va al centro, apenas desfasada, para formar un solo archivo
  const centro = h.clientWidth / 2 - $(".hj", h).offsetWidth / 2;
  $$(".hj", h).forEach((el, i, todas) => el.style.setProperty("--a", (centro - el.offsetLeft + (i - todas.length / 2) * 5) + "px"));
  const unidas = h.classList.toggle("unidas");
  r.classList.toggle("ver", unidas);
  b.lastChild.textContent = unidas ? "Volver a separarlos" : "Unir los documentos";
}

/* Revelar al bajar */
function revelar() {
  const els = $$(".rv");
  if (calma || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("si")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("si"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  els.forEach(e => io.observe(e));
}

$("[data-plano-portada]").innerHTML = planoSVG(true);
$("[data-plano-mini]").innerHTML = planoSVG(false);
$("[data-mini-cot]").innerHTML = miniCot();
iconos();
planes();
$("[data-iva]").addEventListener("change", planes);
$("[data-unir]").addEventListener("click", unir);
$("[data-wa]").href = `https://wa.me/${WA}?text=${encodeURIComponent("Hola Antonio, vi la propuesta del sistema para energía e instalaciones y quiero hablar.")}`;
revelar();
// la demostración de unir se dispara sola la primera vez que se ve
const hojas = $("[data-hojas]");
if (!calma && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { setTimeout(() => { if (!hojas.classList.contains("unidas")) unir(); }, 700); io.disconnect(); } }, { threshold: 0.6 });
  io.observe(hojas);
}
