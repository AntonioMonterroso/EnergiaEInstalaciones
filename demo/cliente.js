/* Sol & Cobre — enlace personal del cliente: propuesta en línea, opciones, firma, plano, expediente y avance de la obra */
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const codigo = new URLSearchParams(location.search).get("c") || "casa-vista-hermosa";
const raiz = $("#cliente");
let p = SYC.porCodigo(codigo);
const urls = [];

function registrarVista() {
  if (!p || sessionStorage.getItem("syc.vista." + p.id)) return;
  try { sessionStorage.setItem("syc.vista." + p.id, "1"); } catch (e) {}
  p.vistas++; if (p.etapa === 0) p.etapa = 1;
  SYC.evento(p, "vista", p.vistas > 1 ? "Abrió su propuesta otra vez" : "Abrió su propuesta");
  SYC.guardar(true, "vista", p.id);
}

function pintar() {
  p = SYC.porCodigo(codigo);
  urls.forEach(u => URL.revokeObjectURL(u)); urls.length = 0;
  if (!p) { raiz.innerHTML = `<section class="cl-sec" style="text-align:center;padding:60px 20px"><h1>Este enlace no existe</h1><p class="fino" style="margin:10px 0 20px">Puede que lo hayan cambiado. Pida el nuevo a Sol &amp; Cobre.</p><a class="btn btn-p" href="./">Ir a la demo</a></section>`; return; }
  const firmada = p.etapa >= 2 && p.firma, op = p.opciones[p.elegida || 0], tt = SYC.totales(op, p.iva);
  const s = tt.kwp ? SYC.solar(tt.kwp, p.consumo) : null;
  const vence = new Date(p.creada + 15 * SYC.D);
  const recibo = p.consumo ? p.consumo * SYC.TARIFA : 0;
  document.title = `Propuesta ${p.id} · ${p.cliente.n} · Sol & Cobre`;
  raiz.innerHTML = `
  <header class="cl-hero">
    <div class="cl-in">
      <p class="cl-eti">Propuesta ${p.id}</p>
      <h1>${esc(p.titulo)}</h1>
      <p class="cl-sub">Para ${esc(p.cliente.n)} · ${esc(p.cliente.dir)}</p>
      <div class="cl-pills"><span class="cl-pill on">${ico(firmada ? "check" : "clock", 14)} ${esc(SYC.ETAPAS[Math.max(1, p.etapa)].n)}</span>${!firmada ? `<span class="cl-pill">Válida hasta el ${vence.toLocaleDateString("es-GT", { day: "numeric", month: "long" })}</span>` : `<span class="cl-pill">Firmada el ${SYC.fecha(p.firma.t)}</span>`}</div>
      ${s && p.consumo ? `<div class="cl-big"><div><span>Ahorro estimado al mes</span><b>${SYC.Q(s.ahorro)}</b></div><div><span>Su sistema</span><b>${SYC.num(tt.kwp, 2)} kWp</b></div><div><span>Se paga solo en</span><b>${SYC.num(tt.total / (s.ahorro * 12), 1)} años</b></div></div>` : ""}
    </div>
  </header>

  <section class="cl-sec"><div class="cl-in"><div class="cl-caja">
    <h2>Cómo va su proyecto</h2>
    <ol class="cl-etapas">${SYC.ETAPAS.map((e, i) => `<li class="${i < p.etapa ? "hecha" : i === p.etapa ? "ahora" : ""}"><span class="pt">${i < p.etapa ? ico("check", 13) : ""}</span><div><b>${e.n}</b><small>${i === p.etapa ? e.d : ""}</small></div></li>`).join("")}</ol>
  </div></div></section>

  ${!firmada ? `<section class="cl-sec"><div class="cl-in"><div class="cl-caja">
    <h2>${p.opciones.length > 1 ? "Elija su opción" : "Su propuesta"}</h2>
    ${p.opciones.length > 1 ? `<p class="fino" style="margin-bottom:14px">Toque la que prefiere. Puede cambiar de idea antes de firmar.</p>` : ""}
    <div class="cl-ops">${p.opciones.map((o, i) => { const t = SYC.totales(o, p.iva), so = t.kwp ? SYC.solar(t.kwp, p.consumo) : null; const tieneBat = o.items.some(x => SYC.art(x.sku).t === "bat");
      return `<button class="cl-op ${i === (p.elegida || 0) ? "on" : ""}" data-elige="${i}" aria-pressed="${i === (p.elegida || 0)}">
        <span class="cl-op-n">${esc(o.n)}</span><b class="num">${SYC.Q(t.total)}</b><span class="fino">${p.iva ? "IVA incluido" : "Sin IVA"} · anticipo ${SYC.Q(t.total * p.anticipo / 100)}</span>
        <ul>${t.kwp ? `<li>${t.paneles} paneles · ${SYC.num(t.kwp, 2)} kWp</li>` : ""}${so && p.consumo ? `<li>Ahorra ${SYC.Q(so.ahorro)} al mes</li><li>Cubre ${Math.round(so.cubre * 100)} % de su recibo</li>` : ""}${tieneBat ? `<li>Con respaldo cuando se va la luz</li>` : t.kwp ? `<li>Sin baterías: se apaga si se va la luz</li>` : ""}<li>${o.items.length} partidas, mano de obra incluida</li></ul>
        <span class="cl-check">${ico("check", 16)}</span></button>`; }).join("")}</div>
    <div class="cl-firmar"><button class="btn btn-c btn-g" data-a="firmar">${ico("pen", 18)} Aceptar y firmar ${p.opciones.length > 1 ? "esta opción" : "la propuesta"}</button><p class="fino">Firma aquí mismo con el dedo. Al firmar se le avisa al equipo y se aparta su fecha.</p></div>
  </div></div></section>` : `<section class="cl-sec"><div class="cl-in"><div class="cl-ok">${ico("check", 22)}<div><b>Propuesta aceptada: ${esc(op.n)}</b><p>Firmó ${esc(p.firma.n)} el ${SYC.fecha(p.firma.t)}. Total ${SYC.Q(tt.total)}.</p></div>${p.firma.img ? `<img src="${p.firma.img}" alt="Firma" class="cl-firma-img">` : ""}</div></div></section>`}

  ${s && p.consumo ? `<section class="cl-sec"><div class="cl-in"><div class="cl-caja">
    <h2>Su recibo de luz</h2>
    <div class="cl-barras">
      <div><span>Hoy paga aproximadamente</span><i style="--w:100%"></i><b class="num">${SYC.Q(recibo)}</b></div>
      <div><span>Con su sistema solar</span><i class="sol" style="--w:${Math.max(4, (1 - s.cubre) * 100)}%"></i><b class="num">${SYC.Q(Math.max(0, recibo - s.ahorro))}</b></div>
    </div>
    <p class="fino">Con ${SYC.num(p.consumo)} kWh al mes y ${SYC.num(s.genera)} kWh que genera el sistema. En 10 años son unos ${SYC.Q(s.ahorro * 120)} que ya no paga.</p>
  </div></div></section>` : ""}

  <section class="cl-sec" data-plano-sec ${p.plano && p.plano.marcas.length ? "" : "hidden"}><div class="cl-in"><div class="cl-caja">
    <h2>Dónde va cada cosa</h2>
    <p class="fino" style="margin-bottom:12px">Sobre el plano de su propiedad. Toque una hoja para verla grande.</p>
    <div class="cl-planos" data-planos><p class="fino">Cargando el plano…</p></div>
  </div></div></section>

  <section class="cl-sec"><div class="cl-in"><div class="cl-caja">
    <h2>Qué incluye</h2>
    ${SYC.TIPOS.map(t => ({ t, items: op.items.filter(i => SYC.art(i.sku).t === t.id) })).filter(g => g.items.length).map(g => `<div class="cl-grupo"><h3>${ico(g.t.i, 15)} ${g.t.n}</h3><ul>${g.items.map(i => { const a = SYC.art(i.sku); return `<li><span>${esc(a.n)}</span><b class="num">${SYC.num(i.cant, a.u === "metro" && i.cant % 1 ? 1 : 0)} ${a.u === "metro" ? "m" : ""}</b></li>`; }).join("")}</ul></div>`).join("")}
    <div class="cl-tot"><div><span>Subtotal</span><b class="num">${SYC.Q(tt.sub)}</b></div>${p.iva ? `<div><span>IVA 12 %</span><b class="num">${SYC.Q(tt.iva)}</b></div>` : ""}<div class="g"><span>Total</span><b class="num">${SYC.Q(tt.total)}</b></div><div><span>Anticipo ${p.anticipo} %</span><b class="num">${SYC.Q(tt.total * p.anticipo / 100)}</b></div></div>
  </div></div></section>

  <section class="cl-sec"><div class="cl-in"><div class="cl-caja">
    <h2>Sus documentos</h2>
    <div class="cl-exp"><span class="cl-exp-ic">${ico("file", 26)}</span><div><b>Propuesta completa en un solo PDF</b><p class="fino">${p.expediente ? `${p.expediente.paginas} páginas: ${p.expediente.partes.map(x => esc(x.n)).join(", ")}.` : "Cotización, plano, fichas técnicas, certificaciones, garantías y términos."}</p></div></div>
    <div class="fila-b" style="margin-top:12px"><button class="btn btn-p" data-a="ver">${ico("eye", 16)} Ver</button><button class="btn" data-a="bajar">${ico("download", 16)} Descargar</button></div>
  </div></div></section>

  ${p.fotos.length ? `<section class="cl-sec"><div class="cl-in"><div class="cl-caja"><h2>Fotos del avance</h2><div class="fotos" data-fotos></div></div></div></section>` : ""}

  <section class="cl-sec"><div class="cl-in"><div class="cl-caja">
    <h2>¿Tiene alguna duda?</h2>
    <div class="cl-chat">${p.mensajes.map(m => `<div class="cl-msg ${m.de === "cliente" ? "yo" : ""}"><p>${esc(m.x)}</p><small>${m.de === "cliente" ? "Usted" : "Sol & Cobre"} · ${SYC.hace(m.t)}</small></div>`).join("")}</div>
    <label class="campo"><span class="sr">Su pregunta</span><textarea data-preg placeholder="Escriba su pregunta. Le respondemos aquí mismo."></textarea></label>
    <div class="fila-b" style="margin-top:10px"><button class="btn btn-p" data-a="preguntar">${ico("send", 16)} Enviar pregunta</button><button class="btn" data-a="llamar">${ico("phone", 16)} Llamar</button></div>
  </div></div></section>

  <footer class="cl-pie"><div class="cl-in"><span class="logo">${solSVG(24)}</span><div><b>${SYC.MARCA.nombre}</b><p>${SYC.MARCA.linea} · ${SYC.MARCA.tel} · ${SYC.MARCA.correo}</p><p>${SYC.MARCA.dominio}/p/${esc(p.codigo)}</p></div></div></footer>`;
  planos(); fotos();
}

async function planos() {
  const cont = $("[data-planos]"); if (!cont || !p.plano || !p.plano.marcas.length) return;
  const hojas = [...new Set(p.plano.marcas.map(m => m.pg))].sort();
  let faltan = false;
  for (const h of hojas) if (!(await SYC.idb.leer(`vista-${p.id}-${h}`))) faltan = true;
  if (faltan) await PLANO.exportar(p).catch(() => {});
  const html = [];
  for (const h of hojas) { const v = await SYC.idb.leer(`vista-${p.id}-${h}`); if (!v) continue; const u = URL.createObjectURL(new Blob([v.bytes], { type: "image/jpeg" })); urls.push(u); html.push(`<button class="cl-hoja" data-zoom="${u}"><img src="${u}" alt="Hoja ${h} del plano con la instalación marcada"><span>Hoja ${h}</span></button>`); }
  cont.innerHTML = html.join("") || `<p class="fino">El plano estará aquí pronto.</p>`;
}
async function fotos() {
  const cont = $("[data-fotos]"); if (!cont) return;
  const html = [];
  for (const f of p.fotos.slice().reverse()) {
    let src = f.img ? fotoMuestra(f.img) : "";
    if (f.id) { const v = await SYC.idb.leer(f.id); if (v) { src = URL.createObjectURL(new Blob([v.bytes], { type: v.tipo })); urls.push(src); } }
    html.push(`<figure class="foto" style="margin:0"><img class="img" src="${src}" alt="${esc(f.x)}"><p>${esc(f.x)}<small>${SYC.hace(f.t)}</small></p></figure>`);
  }
  cont.innerHTML = html.join("");
}
async function expediente() {
  const v = await SYC.idb.leer("exp-" + p.id);
  if (v) return v.bytes;
  if (p.plano) await PLANO.exportar(p).catch(() => {});
  return (await PDFS.expediente(p)).bytes;
}

function firmar() {
  const op = p.opciones[p.elegida || 0], tt = SYC.totales(op, p.iva);
  dialogo({ titulo: "Aceptar y firmar", ancho: 520, okTxt: "Firmar y aceptar", html: `
    <p>Acepta <b>${esc(op.n)}</b> por <b>${SYC.Q(tt.total)}</b>${p.iva ? " con IVA" : ""}. Anticipo de ${SYC.Q(tt.total * p.anticipo / 100)}.</p>
    <label class="campo"><span>Su nombre</span><input data-nom autocomplete="name" placeholder="Nombre de quien firma"></label>
    <div class="campo"><span>Firme aquí con el dedo o el mouse</span><canvas class="cl-pad" data-pad width="900" height="300" aria-label="Espacio para firmar"></canvas><button class="btn btn-s" type="button" data-limpia style="justify-self:start">${ico("undo", 14)} Borrar firma</button></div>
    <label class="interr" style="align-items:flex-start"><input type="checkbox" data-acepto style="flex:none;margin-top:2px"> <span style="font-weight:450;font-size:13.5px">Leí la propuesta, los términos y las garantías del expediente.</span></label>`,
    alAbrir: dlg => {
      const cv = $("[data-pad]", dlg), cx = cv.getContext("2d"); let dib = false, hay = false;
      cx.lineWidth = 5; cx.lineCap = "round"; cx.lineJoin = "round"; cx.strokeStyle = "#17211C";
      const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
      cv.addEventListener("pointerdown", e => { dib = true; hay = true; cv.setPointerCapture(e.pointerId); const [x, y] = pt(e); cx.beginPath(); cx.moveTo(x, y); });
      cv.addEventListener("pointermove", e => { if (!dib) return; const [x, y] = pt(e); cx.lineTo(x, y); cx.stroke(); });
      cv.addEventListener("pointerup", () => dib = false);
      $("[data-limpia]", dlg).onclick = () => { cx.clearRect(0, 0, cv.width, cv.height); hay = false; };
      dlg.__hay = () => hay;
    },
    ok: (v, dlg) => {
      const nom = $("[data-nom]", dlg).value.trim();
      if (!nom) { aviso("Escriba su nombre.", { tipo: "mal" }); return false; }
      if (!dlg.__hay()) { aviso("Falta su firma.", { tipo: "mal" }); return false; }
      if (!$("[data-acepto]", dlg).checked) { aviso("Marque que leyó la propuesta.", { tipo: "mal" }); return false; }
      p.firma = { t: SYC.ahora(), n: nom, img: $("[data-pad]", dlg).toDataURL("image/png") };
      p.etapa = Math.max(p.etapa, 2);
      SYC.evento(p, "firma", `Aceptó y firmó: ${op.n}`);
      SYC.guardar(true, "firma", p.id); pintar(); scrollTo({ top: 0, behavior: "smooth" });
      aviso("¡Gracias! Su propuesta quedó aceptada. Le escribimos para coordinar.", { tipo: "bien", dur: 6000 });
    } });
}

raiz.addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.elige != null) { const i = +b.dataset.elige; if (i === (p.elegida || 0)) return; p.elegida = i; SYC.evento(p, "eleccion", "Eligió: " + p.opciones[i].n); SYC.guardar(true, "eleccion", p.id); const y = scrollY; pintar(); scrollTo(0, y); }
  if (b.dataset.zoom) dialogo({ titulo: "Plano de su instalación", ancho: 1100, cancelar: "Cerrar", ok: false, html: `<div style="overflow:auto;max-height:72vh;border-radius:10px;background:#eee"><img src="${b.dataset.zoom}" alt="Plano" style="width:100%;min-width:640px;display:block"></div>` });
  const a = b.dataset.a;
  if (a === "firmar") firmar();
  if (a === "ver" || a === "bajar") {
    aviso("Preparando su documento…", { dur: 1500 });
    const by = await expediente();
    SYC.evento(p, "descarga", a === "ver" ? "Abrió el expediente" : "Descargó el expediente"); SYC.guardar(true, "descarga", p.id);
    a === "ver" ? PDFS.abrir(by) : PDFS.descargar(by, `Propuesta ${p.id} - Sol y Cobre.pdf`);
  }
  if (a === "preguntar") { const t = $("[data-preg]").value.trim(); if (!t) return aviso("Escriba su pregunta.", { tipo: "info" }); p.mensajes.push({ de: "cliente", t: SYC.ahora(), x: t, leido: false }); SYC.evento(p, "pregunta", "Dejó una pregunta"); SYC.guardar(true, "pregunta", p.id); const y = scrollY; pintar(); scrollTo(0, y); aviso("Pregunta enviada. Le avisamos al equipo.", { tipo: "bien" }); }
  if (a === "llamar") aviso(`En la demo no se llama. Con el sistema real marca a ${SYC.MARCA.tel}.`, { tipo: "info" });
});

// si el instalador cambia algo (etapa, fotos, respuesta), se ve al momento
SYC.bus.oir(() => { clearTimeout(window.__rp); window.__rp = setTimeout(() => { const y = scrollY; pintar(); scrollTo(0, y); }, 120); });

registrarVista();
pintar();
