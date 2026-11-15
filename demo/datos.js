/* Sol & Cobre — datos de la demo (localStorage + IndexedDB + aviso entre pestañas)
   Todo vive en este navegador. Con el sistema real, en la nube. */
"use strict";

const SYC = (() => {
  const CLAVE = "syc.v4";
  const MARCA = {
    nombre: "Sol & Cobre", linea: "Energía solar e instalaciones eléctricas",
    dominio: "solycobre.com", tel: "+502 5555 0142", correo: "proyectos@solycobre.com",
    dir: "Km 14.5 Carretera a El Salvador, Guatemala", nit: "1234567-8",
    color: "#E0A100", tinta: "#111111"
  };
  const IVA = 0.12, HSP = 4.6, RENDIMIENTO = 0.8, TARIFA = 1.65; // horas sol pico, eficiencia, Q por kWh

  /* ---------- Inventario por tipo ---------- */
  const TIPOS = [
    { id: "pan", n: "Paneles solares", i: "sun" },
    { id: "inv", n: "Inversores", i: "zap" },
    { id: "bat", n: "Baterías", i: "battery" },
    { id: "est", n: "Estructuras", i: "grid" },
    { id: "pro", n: "Protecciones", i: "shield" },
    { id: "cab", n: "Cable y ductos", i: "cable" },
    { id: "ilu", n: "Iluminación", i: "bulb" },
    { id: "acc", n: "Accesorios eléctricos", i: "plug" },
    { id: "tab", n: "Tableros", i: "panel" },
    { id: "mo", n: "Mano de obra", i: "wrench" },
    { id: "tra", n: "Trámites y visitas", i: "file" }
  ];
  // u = unidad · c = costo · p = precio · s = existencias · min = mínimo · w = vatios (paneles) · ficha = lleva ficha técnica
  const CATALOGO = [
    { sku: "PAN-550", t: "pan", n: "Panel monocristalino 550 W", u: "unidad", c: 950, p: 1350, s: 64, min: 20, w: 550, ficha: "panel" },
    { sku: "PAN-410", t: "pan", n: "Panel monocristalino 410 W", u: "unidad", c: 780, p: 1090, s: 22, min: 10, w: 410, ficha: "panel" },
    { sku: "INV-5K", t: "inv", n: "Inversor de red 5 kW monofásico", u: "unidad", c: 7200, p: 9800, s: 6, min: 2, ficha: "inversor" },
    { sku: "INV-HY6", t: "inv", n: "Inversor híbrido 6 kW", u: "unidad", c: 11500, p: 15200, s: 3, min: 2, ficha: "inversor" },
    { sku: "MIC-800", t: "inv", n: "Microinversor 800 W", u: "unidad", c: 1350, p: 1850, s: 18, min: 6, ficha: "inversor" },
    { sku: "BAT-5", t: "bat", n: "Batería de litio 5.12 kWh", u: "unidad", c: 9800, p: 13400, s: 4, min: 2, ficha: "bateria" },
    { sku: "EST-TL", t: "est", n: "Estructura para techo de lámina (por panel)", u: "juego", c: 210, p: 320, s: 80, min: 20 },
    { sku: "EST-LZ", t: "est", n: "Estructura para losa con inclinación (por panel)", u: "juego", c: 290, p: 430, s: 30, min: 12 },
    { sku: "PRO-DC", t: "pro", n: "Caja combinadora DC con fusibles y supresor", u: "unidad", c: 1050, p: 1600, s: 7, min: 3 },
    { sku: "PRO-BRK", t: "pro", n: "Breaker 2 polos 40 A", u: "unidad", c: 120, p: 190, s: 40, min: 10 },
    { sku: "PRO-SPD", t: "pro", n: "Supresor de picos AC", u: "unidad", c: 380, p: 560, s: 9, min: 4 },
    { sku: "PRO-TIE", t: "pro", n: "Sistema de tierra física (varilla y cable)", u: "juego", c: 650, p: 980, s: 8, min: 3 },
    { sku: "CAB-PV6", t: "cab", n: "Cable solar 6 mm²", u: "metro", c: 9, p: 14, s: 900, min: 200 },
    { sku: "CAB-10", t: "cab", n: "Cable THHN 10 AWG", u: "metro", c: 6, p: 9.5, s: 1200, min: 300 },
    { sku: "CAB-12", t: "cab", n: "Cable THHN 12 AWG", u: "metro", c: 4.2, p: 6.5, s: 1500, min: 300 },
    { sku: "DUC-34", t: "cab", n: "Tubo conduit 3/4\"", u: "metro", c: 11, p: 17, s: 420, min: 100 },
    { sku: "LUM-PAN", t: "ilu", n: "Panel LED empotrable 18 W", u: "unidad", c: 65, p: 105, s: 70, min: 20 },
    { sku: "LUM-REF", t: "ilu", n: "Reflector LED exterior 100 W", u: "unidad", c: 210, p: 320, s: 14, min: 4 },
    { sku: "ACC-TOM", t: "acc", n: "Tomacorriente doble polarizado", u: "unidad", c: 28, p: 48, s: 150, min: 40 },
    { sku: "ACC-APA", t: "acc", n: "Apagador sencillo", u: "unidad", c: 22, p: 38, s: 120, min: 30 },
    { sku: "ACC-CAJ", t: "acc", n: "Caja rectangular de registro", u: "unidad", c: 7, p: 12, s: 300, min: 60 },
    { sku: "TAB-12", t: "tab", n: "Centro de carga 12 polos", u: "unidad", c: 520, p: 780, s: 5, min: 2 },
    { sku: "TAB-24", t: "tab", n: "Centro de carga 24 polos", u: "unidad", c: 940, p: 1380, s: 2, min: 1 },
    { sku: "MO-PAN", t: "mo", n: "Instalación por panel", u: "panel", c: 120, p: 225, s: null },
    { sku: "MO-PTO", t: "mo", n: "Punto eléctrico (toma, apagador o lámpara)", u: "punto", c: 60, p: 120, s: null },
    { sku: "MO-CAB", t: "mo", n: "Tendido de cable", u: "metro", c: 5, p: 10, s: null },
    { sku: "MO-PUE", t: "mo", n: "Puesta en marcha y pruebas", u: "servicio", c: 300, p: 950, s: null },
    { sku: "TRA-GD", t: "tra", n: "Trámite de conexión con la distribuidora", u: "trámite", c: 600, p: 1500, s: null },
    { sku: "TRA-VIS", t: "tra", n: "Visita técnica y levantamiento", u: "visita", c: 80, p: 350, s: null }
  ];

  /* ---------- Etapas del seguimiento ---------- */
  const ETAPAS = [
    { n: "Visita técnica", d: "Medimos techo, tablero y consumo." },
    { n: "Propuesta enviada", d: "Recibe su propuesta y su expediente." },
    { n: "Aceptada y firmada", d: "Confirma la opción que eligió." },
    { n: "Anticipo recibido", d: "Apartamos equipo y fecha." },
    { n: "Materiales en camino", d: "Preparamos todo para su instalación." },
    { n: "Instalación", d: "El equipo trabaja en su propiedad." },
    { n: "Conexión con la distribuidora", d: "Trámite del medidor bidireccional." },
    { n: "Sistema funcionando", d: "Entrega, pruebas y garantía activa." }
  ];

  /* ---------- Documentos fijos de la empresa ---------- */
  const FIJOS = [
    { id: "fijo-carta", n: "Carta de presentación", pos: "inicio", on: true },
    { id: "fijo-cert", n: "Certificaciones y registro de instalador", pos: "final", on: true },
    { id: "fijo-gar", n: "Garantías de equipo e instalación", pos: "final", on: true },
    { id: "fijo-term", n: "Términos y condiciones", pos: "final", on: true }
  ];

  /* ---------- Utilidades ---------- */
  const Q = n => "Q " + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = (n, d = 0) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const art = sku => CATALOGO.find(a => a.sku === sku);
  const tipo = id => TIPOS.find(t => t.id === id);
  const uid = (p = "") => p + Math.random().toString(36).slice(2, 8);
  const ahora = () => Date.now();
  const H = 3600e3, D = 24 * H;
  const slug = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  const hace = t => {
    const s = Math.round((ahora() - t) / 1000);
    if (s < 60) return "hace un momento";
    const m = Math.round(s / 60); if (m < 60) return "hace " + m + " min";
    const h = Math.round(m / 60); if (h < 24) return "hace " + h + " h";
    const d = Math.round(h / 24); return d === 1 ? "ayer" : "hace " + d + " días";
  };
  const fecha = t => new Date(t).toLocaleDateString("es-GT", { day: "numeric", month: "long", year: "numeric" });

  /* ---------- Cálculos de una cotización ---------- */
  function totales(op, conIva) {
    let sub = 0, costo = 0, paneles = 0, w = 0;
    for (const it of op.items) {
      const a = art(it.sku); const linea = it.cant * it.precio * (1 - (it.desc || 0) / 100);
      sub += linea; costo += it.cant * (a ? a.c : 0);
      if (a && a.t === "pan") { paneles += it.cant; w += it.cant * (a.w || 0); }
    }
    const iva = conIva ? sub * IVA : 0;
    return { sub, iva, total: sub + iva, costo, ganancia: sub - costo, margen: sub ? (sub - costo) / sub : 0, paneles, kwp: w / 1000 };
  }
  function solar(kwp, consumo) {
    const genera = kwp * HSP * 30 * RENDIMIENTO;             // kWh al mes
    const cubre = consumo ? Math.min(1, genera / consumo) : 0;
    const ahorro = Math.min(genera, consumo || genera) * TARIFA; // Q al mes
    return { genera, cubre, ahorro };
  }
  function sugerirPaneles(consumo, w = 550) { return Math.max(1, Math.ceil(consumo / (HSP * 30 * RENDIMIENTO * w / 1000))); }
  const linea = (sku, cant, origen) => ({ sku, cant: +cant.toFixed(art(sku).u === "metro" ? 1 : 0), precio: art(sku).p, desc: 0, origen: origen || "manual" });

  /* ---------- Semilla ---------- */
  function kitSolar(n, inv, extra = []) {
    return [linea("PAN-550", n), linea("EST-TL", n), linea(inv, 1), linea("PRO-DC", 1), linea("PRO-BRK", 2), linea("PRO-TIE", 1),
      linea("CAB-PV6", 40), linea("CAB-10", 25), linea("DUC-34", 18), linea("MO-PAN", n), linea("MO-PUE", 1), linea("TRA-GD", 1), ...extra];
  }
  function semilla() {
    const t = ahora();
    const pr = (o) => Object.assign({ iva: true, anticipo: 60, elegida: 0, etapa: 1, firma: null, fotos: [], mensajes: [], plano: null, docsSubidos: [], docsQuitar: [], vistas: 0 }, o);
    const proyectos = [
      pr({ id: "SYC-0142", titulo: "Sistema solar con respaldo", cliente: { n: "Casa Vista Hermosa", tel: "5555 0101", dir: "Vista Hermosa II, zona 15", tipo: "Residencial" }, consumo: 780,
        creada: t - 2 * D, etapa: 1, vistas: 3,
        opciones: [
          { n: "Opción A · Solo paneles", items: kitSolar(12, "INV-5K") },
          { n: "Opción B · Paneles con batería", items: kitSolar(12, "INV-HY6", [linea("BAT-5", 2)]) }
        ],
        eventos: [{ t: t - 2 * D, k: "creada", x: "Cotización creada" }, { t: t - 2 * D + 2 * H, k: "enviada", x: "Enlace enviado por WhatsApp" }, { t: t - 30 * H, k: "vista", x: "Abrió su propuesta" }, { t: t - 29 * H, k: "descarga", x: "Descargó el expediente" }, { t: t - 3 * H, k: "vista", x: "Abrió su propuesta otra vez" }] }),
      pr({ id: "SYC-0141", titulo: "Paneles para hornos y vitrinas", cliente: { n: "Panadería San José", tel: "5555 0102", dir: "Mixco, zona 1", tipo: "Comercial" }, consumo: 2100,
        creada: t - 9 * D, etapa: 4, vistas: 6, firma: { t: t - 6 * D, n: "Encargado de la panadería" },
        opciones: [{ n: "Sistema de 18.7 kWp", items: kitSolar(34, "INV-5K", [linea("INV-5K", 2), linea("PRO-DC", 2)]) }],
        eventos: [{ t: t - 9 * D, k: "creada", x: "Cotización creada" }, { t: t - 8 * D, k: "vista", x: "Abrió su propuesta" }, { t: t - 6 * D, k: "firma", x: "Aceptó y firmó la propuesta" }, { t: t - 5 * D, k: "etapa", x: "Anticipo recibido" }, { t: t - 1 * D, k: "etapa", x: "Materiales en camino" }],
        fotos: [{ t: t - 1 * D, x: "Paneles y estructuras listos para salir de bodega.", img: "bodega" }] }),
      pr({ id: "SYC-0140", titulo: "Instalación eléctrica de ampliación", cliente: { n: "Clínica dental zona 10", tel: "5555 0103", dir: "12 calle, zona 10", tipo: "Comercial" }, consumo: 0,
        creada: t - 4 * D, etapa: 1, vistas: 0,
        opciones: [{ n: "Instalación completa", items: [linea("TAB-24", 1), linea("ACC-TOM", 14), linea("ACC-APA", 6), linea("ACC-CAJ", 20), linea("LUM-PAN", 12), linea("CAB-12", 160), linea("CAB-10", 60), linea("DUC-34", 90), linea("MO-PTO", 32), linea("MO-CAB", 220)] }],
        eventos: [{ t: t - 4 * D, k: "creada", x: "Cotización creada" }, { t: t - 4 * D + H, k: "enviada", x: "Enlace enviado por WhatsApp" }] }),
      pr({ id: "SYC-0139", titulo: "Sistema solar residencial", cliente: { n: "Casa en Antigua Guatemala", tel: "5555 0104", dir: "Calle del Hermano Pedro", tipo: "Residencial" }, consumo: 420,
        creada: t - 21 * D, etapa: 7, vistas: 9, firma: { t: t - 18 * D, n: "Propietaria" },
        opciones: [{ n: "Sistema de 4.4 kWp", items: kitSolar(8, "INV-5K") }],
        eventos: [{ t: t - 21 * D, k: "creada", x: "Cotización creada" }, { t: t - 18 * D, k: "firma", x: "Aceptó y firmó la propuesta" }, { t: t - 2 * D, k: "etapa", x: "Sistema funcionando" }],
        fotos: [{ t: t - 6 * D, x: "Estructura sobre la teja, sin perforar las vigas.", img: "techo" }, { t: t - 5 * D, x: "Ocho paneles instalados y conectados.", img: "paneles" }, { t: t - 2 * D, x: "Inversor encendido. Ya genera.", img: "inversor" }] }),
      pr({ id: "SYC-0138", titulo: "Bombeo e iluminación exterior", cliente: { n: "Bodega km 14", tel: "5555 0105", dir: "Carretera a El Salvador", tipo: "Industrial" }, consumo: 1250,
        creada: t - 12 * D, etapa: 2, vistas: 2, firma: { t: t - 10 * D, n: "Administración" },
        opciones: [{ n: "Sistema de 11 kWp + reflectores", items: kitSolar(20, "INV-5K", [linea("INV-5K", 1), linea("LUM-REF", 8), linea("MO-PTO", 8)]) }],
        eventos: [{ t: t - 12 * D, k: "creada", x: "Cotización creada" }, { t: t - 10 * D, k: "firma", x: "Aceptó y firmó la propuesta" }] }),
      pr({ id: "SYC-0137", titulo: "Paneles para el área administrativa", cliente: { n: "Colegio Los Pinos", tel: "5555 0106", dir: "San Lucas Sacatepéquez", tipo: "Comercial" }, consumo: 1600,
        creada: t - 1 * D, etapa: 0, vistas: 0,
        opciones: [{ n: "Sistema de 14.3 kWp", items: kitSolar(26, "INV-5K", [linea("INV-5K", 1)]) }],
        eventos: [{ t: t - 1 * D, k: "creada", x: "Cotización creada (borrador)" }] })
    ];
    proyectos.forEach(p => { p.codigo = slug(p.cliente.n); });
    // Plano de ejemplo ya marcado en la primera propuesta (36 puntos = 1 m; casa desde x 60, y 92)
    const M = (x, y) => [60 + x * 36, 92 + y * 36];
    let n = 0; const s = (sim, x, y, pg = 1) => { const [a, b] = M(x, y); return { i: ++n, k: "sim", s: sim, x: a, y: b, pg }; };
    proyectos[0].plano = { pdfId: "plano-ejemplo", pg: 2, escala: 36, calibrada: false, marcas: [
      s("tablero", 10.3, 5.8), s("inversor", 13.5, 6.5), s("bateria", 13.5, 7.5), s("bateria", 13.5, 8.3), s("medidor", 14.35, 1.0), s("tierra", 13.4, 9.5),
      s("toma", 0.3, 3), s("toma", 6.2, 1.5), s("toma", 7, 0.4), s("toma", 9.7, 2.5), s("toma", 0.3, 8), s("toma", 9.7, 8), s("toma", 10.3, 9.3),
      s("lampara", 3.25, 1.6), s("lampara", 8.25, 1.6), s("lampara", 2, 6.8), s("lampara", 5, 6.8), s("lampara", 8, 6.8), s("lampara", 12, 2), s("lampara", 12, 8),
      s("apagador", 2.0, 5.2), s("apagador", 7.4, 5.2), s("apagador", 4.4, 5.85), s("apagador", 10.3, 3.2),
      { i: ++n, k: "cable", c: "pv", pts: [M(13.5, 0.25), M(13.5, 6.1)], pg: 1 },
      { i: ++n, k: "cable", c: "c10", pts: [M(13.1, 6.5), M(10.8, 6.5), M(10.8, 5.8)], pg: 1 },
      { i: ++n, k: "cable", c: "c10", pts: [M(10.3, 5.4), M(10.3, 1.0), M(14.0, 1.0)], pg: 1 },
      { i: ++n, k: "arreglo", x: M(3.5, 5.2)[0], y: M(3.5, 5.2)[1], w: 7.0 * 36, h: 4.65 * 36, rot: false, pg: 2 },
      { i: ++n, k: "cable", c: "pv", pts: [M(10.5, 7.4), M(13.6, 7.4), M(13.6, 9.9)], pg: 2 },
      { i: ++n, k: "cota", a: M(3.5, 9.95), b: M(10.5, 9.95), pg: 2 },
      { i: ++n, k: "nota", x: M(0.2, 0.5)[0], y: M(0.2, 0.5)[1], txt: "12 paneles en la caída sur. Sin sombra de 8 a 16 h. Bajada de cable por la esquina del garaje.", pg: 2 }
    ] };
    proyectos[0].eventos.splice(1, 0, { t: t - 2 * D + H, k: "plano", x: "Plano marcado con la instalación" });
    return { v: 4, marca: MARCA, fijos: FIJOS.map(f => ({ ...f })), proyectos, existencias: Object.fromEntries(CATALOGO.filter(a => a.s != null).map(a => [a.sku, a.s])), precios: {}, siguiente: 143, avisos: [] };
  }

  /* ---------- Guardado ---------- */
  let db;
  function cargar() {
    try { db = JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { db = null; }
    if (!db || db.v !== 4) { db = semilla(); guardar(false); idb.limpiar().catch(() => {}); }
    return db;
  }
  function guardar(avisar = true, que = "cambio", p) {
    try { localStorage.setItem(CLAVE, JSON.stringify(db)); } catch (e) { console.warn("No se pudo guardar", e); }
    if (avisar) bus.postMessage({ que, t: ahora(), p });
  }
  function reiniciar() { localStorage.removeItem(CLAVE); return idb.limpiar().then(() => { cargar(); guardar(true, "reinicio"); }); }
  const precio = sku => db.precios[sku] != null ? db.precios[sku] : art(sku).p;
  const proyecto = id => db.proyectos.find(p => p.id === id);
  const porCodigo = c => db.proyectos.find(p => p.codigo === c);
  function evento(p, k, x) { p.eventos.push({ t: ahora(), k, x }); }

  /* ---------- Aviso entre pestañas (el panel se entera cuando el cliente abre su enlace) ---------- */
  const bus = (() => {
    const oyentes = [];
    let bc = null; try { bc = new BroadcastChannel("syc"); bc.onmessage = e => { cargar(); oyentes.forEach(f => f(e.data)); }; } catch (e) {}
    addEventListener("storage", e => { if (e.key === CLAVE && !bc) { cargar(); oyentes.forEach(f => f({ que: "storage" })); } });
    return { postMessage: m => { try { bc && bc.postMessage(m); } catch (e) {} }, oir: f => oyentes.push(f) };
  })();

  /* ---------- PDFs en IndexedDB ---------- */
  const idb = (() => {
    let abierto;
    const abrir = () => abierto || (abierto = new Promise((ok, mal) => {
      const r = indexedDB.open("syc-pdfs", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("pdf");
      r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error);
    }));
    const tx = (modo, fn) => abrir().then(d => new Promise((ok, mal) => { const t = d.transaction("pdf", modo); const s = t.objectStore("pdf"); const r = fn(s); t.oncomplete = () => ok(r && r.result); t.onerror = () => mal(t.error); }));
    return {
      poner: (id, v) => tx("readwrite", s => s.put(v, id)),
      leer: id => tx("readonly", s => s.get(id)),
      quitar: id => tx("readwrite", s => s.delete(id)),
      limpiar: () => tx("readwrite", s => s.clear())
    };
  })();

  cargar();
  return { MARCA, TIPOS, CATALOGO, ETAPAS, IVA, TARIFA, HSP, Q, num, art, tipo, uid, ahora, hace, fecha, slug, totales, solar, sugerirPaneles, linea, precio, proyecto, porCodigo, evento, get db() { return db; }, cargar, guardar, reiniciar, bus, idb, D, H };
})();
