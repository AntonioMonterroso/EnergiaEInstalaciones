/* Sol & Cobre — PDFs: documentos fijos, fichas, plano de ejemplo, cotización y expediente unificado (pdf-lib) */
"use strict";

const PDFS = (() => {
  const L = () => window.PDFLib;
  const hex = h => { const n = parseInt(h.slice(1), 16); return L().rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };
  const TINTA = "#111111", COBRE = "#E0A100", GRIS = "#7A7A77", LINEA = "#E4E4E0", PAPEL = "#F3F3F1", AZUL = "#1F4E79";

  async function base() {
    const pdf = await L().PDFDocument.create();
    const f = await pdf.embedFont(L().StandardFonts.Helvetica);
    const fb = await pdf.embedFont(L().StandardFonts.HelveticaBold);
    return { pdf, f, fb };
  }
  // Envuelve texto en líneas que caben en un ancho
  function partir(txt, font, size, ancho) {
    const out = [];
    for (const parr of String(txt).split("\n")) {
      let l = "";
      for (const w of parr.split(" ")) {
        const prueba = l ? l + " " + w : w;
        if (font.widthOfTextAtSize(prueba, size) > ancho && l) { out.push(l); l = w; } else l = prueba;
      }
      out.push(l);
    }
    return out;
  }
  function texto(pg, txt, x, y, o) {
    const { font, size = 10, color = TINTA, ancho, alto = 1.45, der } = o;
    const lineas = ancho ? partir(txt, font, size, ancho) : [String(txt)];
    lineas.forEach((l, i) => {
      const xx = der ? x - font.widthOfTextAtSize(l, size) : x;
      pg.drawText(l, { x: xx, y: y - i * size * alto, size, font, color: hex(color) });
    });
    return y - lineas.length * size * alto;
  }
  // Encabezado con la marca
  function encabezado(pg, k, titulo, sub) {
    const { width: W, height: Hh } = pg.getSize();
    pg.drawRectangle({ x: 0, y: Hh - 86, width: W, height: 86, color: hex(TINTA) });
    pg.drawRectangle({ x: 0, y: Hh - 90, width: W, height: 4, color: hex(COBRE) });
    // Sol y cobre: círculo con rayos
    const cx = 62, cy = Hh - 43;
    pg.drawCircle({ x: cx, y: cy, size: 13, color: hex("#F2B01E") });
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; pg.drawLine({ start: { x: cx + Math.cos(a) * 17, y: cy + Math.sin(a) * 17 }, end: { x: cx + Math.cos(a) * 22, y: cy + Math.sin(a) * 22 }, thickness: 2, color: hex("#F2B01E") }); }
    pg.drawText("Sol & Cobre", { x: 94, y: Hh - 42, size: 20, font: k.fb, color: hex("#FFFFFF") });
    pg.drawText("Energía solar e instalaciones eléctricas", { x: 94, y: Hh - 58, size: 9, font: k.f, color: hex("#BDBDBA") });
    if (titulo) texto(pg, titulo, W - 40, Hh - 40, { font: k.fb, size: 13, color: "#FFFFFF", der: true });
    if (sub) texto(pg, sub, W - 40, Hh - 56, { font: k.f, size: 9, color: "#BDBDBA", der: true });
  }
  function pies(pdf, k, etiqueta) {
    const pags = pdf.getPages();
    pags.forEach((pg, i) => {
      const { width: W } = pg.getSize();
      pg.drawLine({ start: { x: 40, y: 40 }, end: { x: W - 40, y: 40 }, thickness: 0.6, color: hex(LINEA) });
      pg.drawText(`${SYC.MARCA.nombre} · ${SYC.MARCA.dominio} · ${SYC.MARCA.tel}`, { x: 40, y: 27, size: 8, font: k.f, color: hex(GRIS) });
      const d = `${etiqueta} · Página ${i + 1} de ${pags.length}`;
      pg.drawText(d, { x: W - 40 - k.f.widthOfTextAtSize(d, 8), y: 27, size: 8, font: k.f, color: hex(GRIS) });
    });
  }

  /* ---------- Documentos fijos y fichas (se generan una vez y se guardan) ---------- */
  const CONTENIDO = {
    "fijo-carta": { t: "Carta de presentación", parr: [
      ["Estimado cliente:", "Gracias por darnos la oportunidad de presentarle esta propuesta. En Sol & Cobre diseñamos e instalamos sistemas de energía solar e instalaciones eléctricas para casas, comercios e industria desde 2014."],
      ["Lo que va en este expediente", "Su cotización con las opciones que revisamos juntos, el plano con la ubicación de cada equipo, las fichas técnicas de los equipos propuestos, nuestras certificaciones, las garantías y los términos del servicio. Todo en un solo documento para que lo revise con calma o lo comparta con quien decide."],
      ["Cómo seguir su proyecto", "Con su enlace personal puede ver la propuesta en línea, elegir la opción que prefiere, aceptarla con su firma y seguir cada etapa de la instalación, con fotos del avance."],
      ["", "Quedamos a sus órdenes.\n\nIng. Responsable de proyectos\nSol & Cobre"]
    ] },
    "fijo-cert": { t: "Certificaciones y registro", parr: [
      ["Registro de instalador", "Empresa inscrita como instaladora de sistemas de generación distribuida renovable ante la distribuidora de su zona. Número de registro: GDR-0000-EJEMPLO."],
      ["Personal certificado", "Técnicos con formación en instalaciones eléctricas de baja tensión y sistemas fotovoltaicos conectados a red y aislados. Capacitación anual en seguridad para trabajo en altura."],
      ["Seguro de responsabilidad civil", "Póliza vigente que cubre daños a terceros durante la instalación. Copia disponible a solicitud."],
      ["Nota de la demo", "Este documento es un ejemplo. Con el sistema real, aquí van sus certificados escaneados: se suben una vez y quedan fijos en todas sus propuestas."]
    ] },
    "fijo-gar": { t: "Garantías", parr: [
      ["Paneles solares", "25 años de garantía de producción lineal (mínimo 84.8 % al año 25) y 12 años contra defectos de fabricación, según el fabricante."],
      ["Inversores", "10 años contra defectos de fabricación. Reemplazo gestionado por Sol & Cobre."],
      ["Baterías de litio", "10 años o 6,000 ciclos, lo que ocurra primero."],
      ["Instalación", "5 años de garantía de mano de obra: estructura, conexiones, impermeabilización de anclajes y cableado. Visita de revisión sin costo a los 6 meses."]
    ] },
    "fijo-term": { t: "Términos y condiciones", parr: [
      ["Validez", "La cotización es válida por 15 días calendario. Los precios de equipo pueden variar según el tipo de cambio."],
      ["Forma de pago", "Anticipo según la cotización al aceptar; el saldo contra la puesta en marcha del sistema."],
      ["Plazos", "La instalación se programa dentro de los 15 días siguientes al anticipo. El trámite de conexión depende de la distribuidora."],
      ["Alcance", "Incluye lo detallado en la cotización. Trabajos adicionales de obra civil, refuerzo de techo o cambio de acometida se cotizan aparte."],
      ["Producción estimada", "Los cálculos de generación y ahorro son estimaciones con 4.6 horas sol pico y tarifa de referencia; la producción real depende del clima, sombras y orientación."]
    ] },
    "ficha-panel": { t: "Ficha técnica · Panel monocristalino", tabla: [["Potencia máxima", "550 W"], ["Eficiencia", "21.3 %"], ["Celdas", "144 medias celdas mono PERC"], ["Dimensiones", "2,278 × 1,134 × 35 mm"], ["Peso", "28.6 kg"], ["Voltaje en circuito abierto", "49.9 V"], ["Corriente de cortocircuito", "14.0 A"], ["Garantía de producción", "25 años"]] },
    "ficha-inversor": { t: "Ficha técnica · Inversor", tabla: [["Potencia nominal AC", "5,000 W / 6,000 W híbrido"], ["Rastreadores MPPT", "2"], ["Rango de voltaje DC", "80 – 550 V"], ["Eficiencia máxima", "97.6 %"], ["Salida", "120/240 V monofásico"], ["Monitoreo", "Wi-Fi con aplicación"], ["Protección", "IP65"], ["Garantía", "10 años"]] },
    "ficha-bateria": { t: "Ficha técnica · Batería de litio", tabla: [["Química", "LiFePO4"], ["Capacidad", "5.12 kWh"], ["Voltaje nominal", "51.2 V"], ["Profundidad de descarga", "95 %"], ["Ciclos de vida", "6,000 al 80 %"], ["Peso", "48 kg"], ["Montaje", "Pared o piso, apilable"], ["Garantía", "10 años"]] }
  };
  async function generarFijo(id) {
    const c = CONTENIDO[id]; const k = await base(); const pg = k.pdf.addPage([612, 792]);
    encabezado(pg, k, c.t, "");
    let y = 660;
    pg.drawText(c.t, { x: 56, y, size: 22, font: k.fb, color: hex(TINTA) }); y -= 14;
    pg.drawRectangle({ x: 56, y: y - 2, width: 46, height: 3, color: hex(COBRE) }); y -= 30;
    if (c.parr) for (const [h, b] of c.parr) {
      if (h) { pg.drawText(h, { x: 56, y, size: 11.5, font: k.fb, color: hex(TINTA) }); y -= 17; }
      y = texto(pg, b, 56, y, { font: k.f, size: 10.5, ancho: 500, color: "#323A35" }) - 16;
    }
    if (c.tabla) {
      // dibujo simple del equipo
      pg.drawRectangle({ x: 56, y: y - 150, width: 500, height: 150, color: hex(PAPEL) });
      if (id === "ficha-panel") for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) pg.drawRectangle({ x: 230 + j * 50, y: y - 140 + i * 22, width: 46, height: 19, color: hex("#24364A"), borderColor: hex("#8FA3B8"), borderWidth: 0.6 });
      if (id === "ficha-inversor") { pg.drawRectangle({ x: 250, y: y - 135, width: 110, height: 120, color: hex("#E9E5DA"), borderColor: hex(GRIS), borderWidth: 1 }); pg.drawRectangle({ x: 275, y: y - 60, width: 60, height: 26, color: hex(TINTA) }); pg.drawCircle({ x: 305, y: y - 95, size: 8, color: hex(COBRE) }); }
      if (id === "ficha-bateria") { for (let i = 0; i < 3; i++) pg.drawRectangle({ x: 245, y: y - 140 + i * 42, width: 120, height: 38, color: hex("#DCD6C8"), borderColor: hex(GRIS), borderWidth: 1 }); pg.drawRectangle({ x: 345, y: y - 125, width: 10, height: 10, color: hex("#4F9A5B") }); }
      y -= 176;
      c.tabla.forEach(([a, b], i) => {
        if (i % 2 === 0) pg.drawRectangle({ x: 56, y: y - 6, width: 500, height: 22, color: hex(PAPEL) });
        pg.drawText(a, { x: 66, y, size: 10, font: k.f, color: hex(GRIS) });
        pg.drawText(b, { x: 300, y, size: 10, font: k.fb, color: hex(TINTA) });
        y -= 22;
      });
    }
    pies(k.pdf, k, c.t);
    return guardarPDF(id, c.t, await k.pdf.save(), "sistema");
  }
  async function guardarPDF(id, nombre, bytes, origen) {
    const doc = await L().PDFDocument.load(bytes, { ignoreEncryption: true });
    const v = { nombre, bytes, paginas: doc.getPageCount(), origen, t: Date.now() };
    await SYC.idb.poner(id, v); return v;
  }
  async function obtener(id) {
    let v = await SYC.idb.leer(id);
    if (!v && CONTENIDO[id]) v = await generarFijo(id);
    if (!v && id === "plano-ejemplo") v = await planoEjemplo();
    return v;
  }

  /* ---------- Plano de ejemplo (2 hojas: planta y techos), escala 36 pt = 1 m ---------- */
  const ESC = 36, OX = 60, OY = 92; // origen de la casa (desde arriba)
  async function planoEjemplo() {
    const k = await base();
    const m = v => v * ESC;
    for (const hoja of [1, 2]) {
      const pg = k.pdf.addPage([792, 612]); const Hh = 612;
      const R = (x, y, w, h, o = {}) => pg.drawRectangle({ x: OX + m(x), y: Hh - OY - m(y) - m(h), width: m(w), height: m(h), borderColor: hex(o.c || "#2B2B2B"), borderWidth: o.b || 1, color: o.f ? hex(o.f) : undefined });
      const T = (s, x, y, o = {}) => { const sz = o.s || 8.5; const f = o.b ? k.fb : k.f; pg.drawText(s, { x: OX + m(x) - (o.c ? f.widthOfTextAtSize(s, sz) / 2 : 0), y: Hh - OY - m(y), size: sz, font: f, color: hex(o.col || "#2B2B2B") }); };
      const Ln = (x1, y1, x2, y2, o = {}) => pg.drawLine({ start: { x: OX + m(x1), y: Hh - OY - m(y1) }, end: { x: OX + m(x2), y: Hh - OY - m(y2) }, thickness: o.t || 0.8, color: hex(o.c || "#2B2B2B"), dashArray: o.d });
      // cuadrícula suave
      for (let gx = 0; gx <= 14; gx++) Ln(gx, -0.6, gx, 10.6, { t: 0.25, c: "#E3E1DA" });
      for (let gy = 0; gy <= 10; gy++) Ln(-0.6, gy, 14.6, gy, { t: 0.25, c: "#E3E1DA" });
      R(0, 0, 14, 10, { b: 3.2 });
      if (hoja === 1) {
        // muros interiores
        Ln(6.5, 0, 6.5, 5.5, { t: 1.8 }); Ln(10, 0, 10, 10, { t: 2.4 }); Ln(0, 5.5, 10, 5.5, { t: 1.8 });
        Ln(4, 5.5, 4, 10, { t: 1.8 }); Ln(6, 5.5, 6, 10, { t: 1.8 });
        // puertas (huecos marcados con arco simple)
        [[2.2, 5.5], [4.6, 5.5], [7.6, 5.5], [8.2, 0]].forEach(([x, y]) => { Ln(x, y, x + 0.9, y, { t: 3, c: "#FFFFFF" }); Ln(x, y, x, y + (y ? 0.9 : 0.9), { t: 0.6 }); });
        Ln(10, 2.0, 10, 2.9, { t: 3, c: "#FFFFFF" });
        // ventanas
        [[1.5, 0], [3.8, 0], [11, 0]].forEach(([x, y]) => { Ln(x, y - 0.08, x + 1.5, y - 0.08, { t: 0.6 }); Ln(x, y + 0.08, x + 1.5, y + 0.08, { t: 0.6 }); });
        // nombres de ambientes
        T("SALA · COMEDOR", 3.25, 2.8, { c: 1, b: 1 }); T("6.50 × 5.50 m", 3.25, 3.25, { c: 1, s: 7, col: "#777" });
        T("COCINA", 8.25, 2.8, { c: 1, b: 1 }); T("3.50 × 5.50 m", 8.25, 3.25, { c: 1, s: 7, col: "#777" });
        T("GARAJE · LAVANDERÍA", 12, 5, { c: 1, b: 1 }); T("4.00 × 10.00 m", 12, 5.45, { c: 1, s: 7, col: "#777" });
        T("DORMITORIO 1", 2, 7.8, { c: 1, b: 1 }); T("BAÑO", 5, 7.8, { c: 1, b: 1 }); T("DORMITORIO 2", 8, 7.8, { c: 1, b: 1 });
        // muebles de cocina
        R(6.6, 0.1, 3.3, 0.6, { b: 0.5, c: "#888" }); R(0.4, 6.0, 1.6, 2.0, { b: 0.5, c: "#888" }); R(6.4, 6.0, 1.6, 2.0, { b: 0.5, c: "#888" });
        R(10.4, 0.6, 2.4, 4.8, { b: 0.5, c: "#AAA" }); T("vehículo", 11.6, 3.1, { c: 1, s: 7, col: "#999" });
      } else {
        // techo a dos aguas: cumbrera horizontal, caída al norte y al sur
        Ln(0, 5, 14, 5, { t: 1.6, d: [6, 3] });
        for (let x = 0.5; x < 14; x += 0.7) { Ln(x, 0, x, 10, { t: 0.3, c: "#B9B6AE" }); }
        T("CUMBRERA", 7, 4.75, { c: 1, b: 1, s: 8 });
        T("CAÍDA AL NORTE · pendiente 15 %", 7, 2.6, { c: 1, s: 8 }); T("CAÍDA AL SUR · pendiente 15 %", 7, 7.6, { c: 1, s: 8 });
        T("TECHO DE LÁMINA TROQUELADA CALIBRE 26", 7, 8.4, { c: 1, s: 7, col: "#666" });
        Ln(7, 6.2, 7, 7.1, { t: 1 }); Ln(6.85, 6.95, 7, 7.15, { t: 1 }); Ln(7.15, 6.95, 7, 7.15, { t: 1 });
        Ln(7, 3.8, 7, 2.9, { t: 1 }); Ln(6.85, 3.05, 7, 2.85, { t: 1 }); Ln(7.15, 3.05, 7, 2.85, { t: 1 });
      }
      // escala gráfica
      for (let i = 0; i < 5; i++) pg.drawRectangle({ x: OX + m(i), y: Hh - OY - m(11.3), width: m(1), height: 5, color: hex(i % 2 ? "#FFFFFF" : "#2B2B2B"), borderColor: hex("#2B2B2B"), borderWidth: 0.6 });
      for (let i = 0; i <= 5; i++) pg.drawText(String(i), { x: OX + m(i) - 2, y: Hh - OY - m(11.3) - 11, size: 7, font: k.f, color: hex("#2B2B2B") });
      pg.drawText("metros", { x: OX + m(5) + 8, y: Hh - OY - m(11.3) - 1, size: 7, font: k.f, color: hex("#2B2B2B") });
      // norte
      const nx = OX + m(13.4), ny = Hh - OY - m(11.2);
      pg.drawLine({ start: { x: nx, y: ny - 10 }, end: { x: nx, y: ny + 12 }, thickness: 1, color: hex("#2B2B2B") });
      pg.drawText("N", { x: nx - 3, y: ny + 15, size: 9, font: k.fb, color: hex("#2B2B2B") });
      // cajetín
      const cx = 600, w = 170;
      pg.drawRectangle({ x: cx, y: 40, width: w, height: 532, borderColor: hex("#2B2B2B"), borderWidth: 1 });
      const filas = [["PROYECTO", "Vivienda unifamiliar"], ["UBICACIÓN", "Vista Hermosa II, zona 15"], ["CONTENIDO", hoja === 1 ? "Planta arquitectónica" : "Planta de techos"], ["ESCALA", "1:100 (36 pt = 1 m)"], ["HOJA", hoja + " de 2"], ["DIBUJÓ", "Arquitectura del propietario"]];
      let yy = 540;
      filas.forEach(([a, b]) => { pg.drawText(a, { x: cx + 10, y: yy, size: 6.5, font: k.f, color: hex("#777") }); pg.drawText(b, { x: cx + 10, y: yy - 12, size: 9, font: k.fb, color: hex("#2B2B2B") }); pg.drawLine({ start: { x: cx, y: yy - 20 }, end: { x: cx + w, y: yy - 20 }, thickness: 0.5, color: hex("#999") }); yy -= 38; });
      texto(pg, "Plano de ejemplo para la demo. El cliente o el arquitecto le manda el suyo en PDF y usted dibuja encima.", cx + 10, 120, { font: k.f, size: 7.5, ancho: w - 20, color: "#777" });
    }
    return guardarPDF("plano-ejemplo", "Plano de la vivienda (ejemplo).pdf", await k.pdf.save(), "sistema");
  }

  /* ---------- Cotización en PDF ---------- */
  async function cotizacion(p, soloElegida) {
    const k = await base();
    const W = 612, Hh = 792, X = 48, AN = W - 96;
    const ops = soloElegida ? [p.opciones[p.elegida || 0]] : p.opciones;
    let pg, y;
    const nueva = (primera) => {
      pg = k.pdf.addPage([W, Hh]);
      encabezado(pg, k, "COTIZACIÓN " + p.id, "Fecha: " + SYC.fecha(p.creada) + " · Válida por 15 días");
      y = Hh - 120;
      if (!primera) { pg.drawText(p.cliente.n + " · continuación", { x: X, y, size: 9, font: k.f, color: hex(GRIS) }); y -= 22; }
    };
    const necesito = h => { if (y - h < 70) nueva(false); };
    nueva(true);
    // Cliente y proyecto
    pg.drawRectangle({ x: X, y: y - 62, width: AN, height: 70, color: hex(PAPEL) });
    pg.drawText("CLIENTE", { x: X + 14, y: y - 8, size: 7, font: k.fb, color: hex(COBRE) });
    pg.drawText(p.cliente.n, { x: X + 14, y: y - 24, size: 13, font: k.fb, color: hex(TINTA) });
    pg.drawText(`${p.cliente.dir} · Tel. ${p.cliente.tel} · ${p.cliente.tipo}`, { x: X + 14, y: y - 40, size: 9, font: k.f, color: hex(GRIS) });
    pg.drawText("PROYECTO", { x: X + 330, y: y - 8, size: 7, font: k.fb, color: hex(COBRE) });
    texto(pg, p.titulo, X + 330, y - 24, { font: k.fb, size: 11, ancho: 180 });
    if (p.consumo) pg.drawText(`Consumo actual: ${SYC.num(p.consumo)} kWh al mes`, { x: X + 330, y: y - 52, size: 8.5, font: k.f, color: hex(GRIS) });
    y -= 92;
    for (const op of ops) {
      const tt = SYC.totales(op, p.iva);
      necesito(80);
      pg.drawText(op.n, { x: X, y, size: 14, font: k.fb, color: hex(TINTA) });
      if (tt.kwp) { const s = SYC.solar(tt.kwp, p.consumo); const d = `${SYC.num(tt.kwp, 2)} kWp · ${tt.paneles} paneles · genera aprox. ${SYC.num(s.genera)} kWh al mes`; pg.drawText(d, { x: X, y: y - 15, size: 8.5, font: k.f, color: hex(GRIS) }); y -= 15; }
      y -= 22;
      // encabezado de tabla
      const col = { d: X, c: X + 300, u: X + 340, p: X + 440, t: X + AN };
      const filaTit = () => { pg.drawRectangle({ x: X, y: y - 5, width: AN, height: 18, color: hex(TINTA) }); [["DESCRIPCIÓN", col.d + 8, 0], ["CANT.", col.c, 1], ["UNIDAD", col.u, 0], ["PRECIO", col.p, 1], ["TOTAL", col.t - 8, 1]].forEach(([s, x, d]) => pg.drawText(s, { x: d ? x - k.fb.widthOfTextAtSize(s, 7) : x, y, size: 7, font: k.fb, color: hex("#FFFFFF") })); y -= 20; };
      filaTit();
      const necesitoT = h => { if (y - h < 70) { nueva(false); filaTit(); } };
      const grupos = SYC.TIPOS.map(t => ({ t, items: op.items.filter(i => SYC.art(i.sku).t === t.id) })).filter(g => g.items.length);
      for (const g of grupos) {
        necesitoT(34);
        pg.drawText(g.t.n.toUpperCase(), { x: X + 8, y: y - 2, size: 7, font: k.fb, color: hex(COBRE) }); y -= 15;
        for (const it of g.items) {
          const a = SYC.art(it.sku); const tot = it.cant * it.precio * (1 - (it.desc || 0) / 100);
          const desc = partir(a.n + (it.desc ? ` (descuento ${it.desc} %)` : ""), k.f, 9, 280);
          necesitoT(desc.length * 12 + 6);
          desc.forEach((l, i) => pg.drawText(l, { x: col.d + 8, y: y - i * 12, size: 9, font: k.f, color: hex(TINTA) }));
          const r = (s, x) => pg.drawText(s, { x: x - k.f.widthOfTextAtSize(s, 9), y, size: 9, font: k.f, color: hex(TINTA) });
          r(SYC.num(it.cant, a.u === "metro" && it.cant % 1 ? 1 : 0), col.c); pg.drawText(a.u, { x: col.u, y, size: 9, font: k.f, color: hex(GRIS) });
          r(SYC.Q(it.precio), col.p); r(SYC.Q(tot), col.t - 8);
          y -= desc.length * 12 + 4;
          pg.drawLine({ start: { x: X, y: y + 3 }, end: { x: X + AN, y: y + 3 }, thickness: 0.4, color: hex(LINEA) });
          y -= 4;
        }
      }
      // totales
      necesito(110);
      y -= 6;
      const filasT = [["Subtotal", SYC.Q(tt.sub)]];
      if (p.iva) filasT.push(["IVA 12 %", SYC.Q(tt.iva)]);
      filasT.forEach(([a, b]) => { pg.drawText(a, { x: X + 330, y, size: 9.5, font: k.f, color: hex(GRIS) }); pg.drawText(b, { x: col.t - 8 - k.f.widthOfTextAtSize(b, 9.5), y, size: 9.5, font: k.f, color: hex(TINTA) }); y -= 16; });
      y -= 10;
      pg.drawRectangle({ x: X + 320, y: y - 8, width: AN - 320, height: 24, color: hex(TINTA) });
      const tx = SYC.Q(tt.total);
      pg.drawText(p.iva ? "TOTAL CON IVA" : "TOTAL SIN IVA", { x: X + 330, y: y, size: 9, font: k.fb, color: hex("#FFFFFF") });
      pg.drawText(tx, { x: col.t - 8 - k.fb.widthOfTextAtSize(tx, 12), y: y - 1, size: 12, font: k.fb, color: hex("#FFFFFF") });
      y -= 26;
      const ant = `Anticipo ${p.anticipo} %: ${SYC.Q(tt.total * p.anticipo / 100)} · Saldo contra entrega: ${SYC.Q(tt.total * (1 - p.anticipo / 100))}`;
      pg.drawText(ant, { x: col.t - 8 - k.f.widthOfTextAtSize(ant, 8.5), y, size: 8.5, font: k.f, color: hex(GRIS) });
      y -= 22;
      if (tt.kwp && p.consumo) {
        const s = SYC.solar(tt.kwp, p.consumo); const anios = tt.total / (s.ahorro * 12);
        necesito(64);
        pg.drawRectangle({ x: X, y: y - 46, width: AN, height: 54, color: hex("#FBF1DF"), borderColor: hex("#F2B01E"), borderWidth: 0.8 });
        [["Genera al mes", SYC.num(s.genera) + " kWh"], ["Cubre de su consumo", Math.round(s.cubre * 100) + " %"], ["Ahorro estimado al mes", SYC.Q(s.ahorro)], ["Se paga solo en", SYC.num(anios, 1) + " años"]].forEach(([a, b], i) => {
          const x = X + 14 + i * (AN / 4);
          pg.drawText(a, { x, y: y - 10, size: 7.5, font: k.f, color: hex(GRIS) }); pg.drawText(b, { x, y: y - 28, size: 13, font: k.fb, color: hex(TINTA) });
        });
        y -= 70;
      }
      y -= 12;
    }
    necesito(70);
    texto(pg, "Precios en quetzales. La aceptación se hace en línea con su enlace personal o firmando esta cotización. Producción y ahorro son estimaciones de referencia.", X, y, { font: k.f, size: 8, ancho: AN, color: GRIS });
    pies(k.pdf, k, "Cotización " + p.id);
    return k.pdf.save();
  }

  /* ---------- Plano marcado: hoja original + capa dibujada (PNG) ---------- */
  async function planoMarcado(p) {
    if (!p.plano) return null;
    const orig = await obtener(p.plano.pdfId); if (!orig) return null;
    const src = await L().PDFDocument.load(orig.bytes, { ignoreEncryption: true });
    const out = await L().PDFDocument.create();
    const hojas = [...new Set(p.plano.marcas.map(m => m.pg))].sort();
    if (!hojas.length) hojas.push(p.plano.pg || 1);
    for (const h of hojas) {
      const [pag] = await out.copyPages(src, [h - 1]); out.addPage(pag);
      const capa = await SYC.idb.leer(`capa-${p.id}-${h}`);
      if (capa) { const img = await out.embedPng(capa.bytes); const { width, height } = pag.getSize(); pag.drawImage(img, { x: 0, y: 0, width, height }); }
    }
    return out.save();
  }

  /* ---------- Lista de documentos del expediente ----------
     fijo = siempre va (no se puede quitar desde el proyecto) · auto = se agrega solo · subido = lo subió usted */
  function piezas(p) {
    const db = SYC.db, lista = [];
    const fijos = db.fijos.filter(f => f.on);
    fijos.filter(f => f.pos === "inicio").forEach(f => lista.push({ key: f.id, n: f.n, tipo: "fijo" }));
    lista.push({ key: "cotizacion", n: "Cotización " + p.id, tipo: "auto" });
    if (p.plano && p.plano.marcas.length) lista.push({ key: "plano", n: "Plano con la instalación marcada", tipo: "auto" });
    const fichas = new Set();
    p.opciones.forEach(o => o.items.forEach(i => { const a = SYC.art(i.sku); if (a.ficha) fichas.add(a.ficha); }));
    [...fichas].forEach(f => lista.push({ key: "ficha-" + f, n: CONTENIDO["ficha-" + f].t, tipo: "auto" }));
    p.docsSubidos.forEach(d => lista.push({ key: d.id, n: d.n, tipo: "subido" }));
    fijos.filter(f => f.pos === "final").forEach(f => lista.push({ key: f.id, n: f.n, tipo: "fijo" }));
    // orden propio (solo mueve los que no son fijos) y quitados
    const movibles = lista.filter(x => x.tipo !== "fijo" && !p.docsQuitar.includes(x.key));
    if (p.orden) movibles.sort((a, b) => (p.orden.indexOf(a.key) + 1 || 999) - (p.orden.indexOf(b.key) + 1 || 999));
    const ini = lista.filter(x => x.tipo === "fijo" && fijos.find(f => f.id === x.key).pos === "inicio");
    const fin = lista.filter(x => x.tipo === "fijo" && fijos.find(f => f.id === x.key).pos === "final");
    const quitados = lista.filter(x => x.tipo !== "fijo" && p.docsQuitar.includes(x.key));
    return { orden: [...ini, ...movibles, ...fin], quitados };
  }
  async function bytesDe(p, key) {
    if (key === "cotizacion") return cotizacion(p);
    if (key === "plano") return planoMarcado(p);
    const v = await obtener(key); return v && v.bytes;
  }
  // Une todo en un solo PDF. Devuelve bytes y cuántas páginas aporta cada pieza.
  async function expediente(p, alAvanzar) {
    const { orden } = piezas(p);
    const out = await L().PDFDocument.create();
    out.setTitle(`Propuesta ${p.id} · ${p.cliente.n}`); out.setAuthor(SYC.MARCA.nombre); out.setCreator("Sol & Cobre");
    const partes = [];
    for (let i = 0; i < orden.length; i++) {
      const pz = orden[i]; alAvanzar && alAvanzar(i, orden.length, pz);
      try {
        const b = await bytesDe(p, pz.key); if (!b) continue;
        const src = await L().PDFDocument.load(b, { ignoreEncryption: true });
        const pags = await out.copyPages(src, src.getPageIndices()); pags.forEach(x => out.addPage(x));
        partes.push({ ...pz, paginas: pags.length });
      } catch (e) { console.warn("No se pudo unir", pz, e); partes.push({ ...pz, paginas: 0, error: true }); }
    }
    const bytes = await out.save();
    return { bytes, paginas: out.getPageCount(), partes };
  }
  async function paginasDe(bytes) { const d = await L().PDFDocument.load(bytes, { ignoreEncryption: true }); return d.getPageCount(); }
  function descargar(bytes, nombre) {
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
    const a = document.createElement("a"); a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function abrir(bytes) { const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })); window.open(url, "_blank", "noopener"); setTimeout(() => URL.revokeObjectURL(url), 60000); }

  return { obtener, guardarPDF, planoEjemplo, cotizacion, planoMarcado, piezas, expediente, paginasDe, descargar, abrir, CONTENIDO, ESC, OX, OY };
})();
