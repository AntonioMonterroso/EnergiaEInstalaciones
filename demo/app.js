/* Sol & Cobre — panel del instalador: Hoy, Propuestas (cotización · plano · documentos · seguimiento), Inventario y Empresa */
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const raiz = $("#vista");
let ruta = [], editorPlano = null;

/* ---------- Estado de una propuesta ---------- */
function estado(p) {
  if (p.etapa === 0) return { n: "Borrador", c: "borr" };
  if (p.etapa === 1) return p.vistas ? { n: `Vista ${p.vistas} ${p.vistas === 1 ? "vez" : "veces"}`, c: "vista" } : { n: "Enviada", c: "" };
  if (p.etapa === 2 || p.etapa === 3) return { n: p.etapa === 2 ? "Aceptada" : "Anticipo recibido", c: "firmada" };
  if (p.etapa === 7) return { n: "Funcionando", c: "firmada" };
  return { n: SYC.ETAPAS[p.etapa].n, c: "obra" };
}
const opElegida = p => p.opciones[p.elegida || 0];
const totalDe = p => SYC.totales(opElegida(p), p.iva).total;
const esSolar = p => opElegida(p).items.some(i => SYC.art(i.sku).t === "pan");
const enlace = p => `${SYC.MARCA.dominio}/p/${p.codigo}`;
const urlCliente = p => new URL("cliente.html?c=" + encodeURIComponent(p.codigo), location.href).href;

/* ---------- Rutas ---------- */
function ir(h) { if (location.hash === h) pintar(); else location.hash = h; }
addEventListener("hashchange", pintar);
function pintar() {
  ruta = (location.hash.replace(/^#\/?/, "") || "hoy").split("/");
  if (editorPlano) { editorPlano.destruir(); editorPlano = null; }
  const [v, id, tab] = ruta;
  $$("[data-nav]").forEach(a => a.classList.toggle("on", a.dataset.nav === (v === "p" ? "proyectos" : v)));
  const vistas = { hoy: vHoy, proyectos: vProyectos, p: () => vProyecto(id, tab || "cotizacion"), inventario: vInventario, empresa: vEmpresa };
  (vistas[v] || vHoy)();
  raiz.classList.remove("entra"); void raiz.offsetWidth; raiz.classList.add("entra");
}
function repintarSuave() { // sin mover la página
  const y = scrollY;
  pintar(); scrollTo(0, y);
}

/* ---------- Hoy ---------- */
function saludo() { const h = new Date().getHours(); return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches"; }
function vHoy() {
  const ps = SYC.db.proyectos, t = SYC.ahora();
  const abiertas = ps.filter(p => p.etapa === 1), aceptadas = ps.filter(p => p.etapa >= 2);
  const cotizado = ps.filter(p => t - p.creada < 30 * SYC.D).reduce((s, p) => s + totalDe(p), 0);
  const enObra = ps.filter(p => p.etapa >= 3 && p.etapa < 7);
  const vistasHoy = ps.reduce((s, p) => s + p.eventos.filter(e => e.k === "vista" && t - e.t < SYC.D).length, 0);
  const pendientes = [];
  abiertas.filter(p => p.vistas >= 2).forEach(p => pendientes.push({ i: "eye", c: "vista", t: `${p.cliente.n} abrió su propuesta ${p.vistas} veces y no ha firmado`, d: "Buen momento para llamar y resolver dudas.", h: `#/p/${p.id}/seguimiento` }));
  ps.filter(p => p.mensajes.some(m => m.de === "cliente" && !m.leido)).forEach(p => pendientes.push({ i: "chat", c: "vista", t: `${p.cliente.n} le dejó una pregunta`, d: "Responda desde su seguimiento.", h: `#/p/${p.id}/seguimiento` }));
  ps.filter(p => p.etapa === 0).forEach(p => pendientes.push({ i: "pen", c: "", t: `Borrador sin enviar: ${p.cliente.n}`, d: "Termine la cotización y mande su enlace.", h: `#/p/${p.id}/cotizacion` }));
  abiertas.filter(p => !p.vistas).forEach(p => pendientes.push({ i: "clock", c: "", t: `${p.cliente.n} todavía no abre su enlace`, d: "Enviado " + SYC.hace(p.eventos.find(e => e.k === "enviada")?.t || p.creada) + ". Puede reenviarlo.", h: `#/p/${p.id}/seguimiento` }));
  SYC.CATALOGO.filter(a => a.s != null && SYC.db.existencias[a.sku] < a.min).forEach(a => pendientes.push({ i: "box", c: "", t: `Quedan ${SYC.db.existencias[a.sku]} de ${a.n}`, d: `El mínimo es ${a.min}. Revise el inventario.`, h: "#/inventario" }));
  const evs = ps.flatMap(p => p.eventos.map(e => ({ ...e, p }))).sort((a, b) => b.t - a.t).slice(0, 6);
  raiz.innerHTML = `
    ${marcaMovil()}
    <div class="cab"><div><h1>${saludo()}</h1><p class="fino">${new Date().toLocaleDateString("es-GT", { weekday: "long", day: "numeric", month: "long" })} · Esto es lo que pasa con sus propuestas.</p></div>
      <button class="btn btn-c" data-nuevo>${ico("plus")} Nueva cotización</button></div>
    <div class="cifras">
      <div class="cifra osc"><span>Cotizado en 30 días</span><b>${SYC.Q(cotizado)}</b><small>${ps.filter(p => t - p.creada < 30 * SYC.D).length} propuestas</small></div>
      <div class="cifra"><span>Esperando respuesta</span><b>${abiertas.length}</b><small>${abiertas.filter(p => p.vistas).length} ya la vieron</small></div>
      <div class="cifra"><span>Aceptadas</span><b>${aceptadas.length} de ${ps.filter(p => p.etapa >= 1).length}</b><small>${SYC.Q(aceptadas.reduce((s, p) => s + totalDe(p), 0))}</small></div>
      <div class="cifra"><span>En obra</span><b>${enObra.length}</b><small>${vistasHoy} ${vistasHoy === 1 ? "vista" : "vistas"} de clientes hoy</small></div>
    </div>
    <div class="dos">
      <section class="tarj"><h2>Para hoy</h2>
        ${pendientes.length ? `<ul class="act">${pendientes.slice(0, 7).map(x => `<li><span class="ic ${x.c}">${ico(x.i, 15)}</span><a href="${x.h}" style="color:inherit;text-decoration:none"><b style="font-weight:600">${esc(x.t)}</b><small>${esc(x.d)}</small></a></li>`).join("")}</ul>` : `<p class="fino">Todo al día.</p>`}
      </section>
      <section class="tarj"><h2>Lo que hicieron sus clientes</h2>
        <ul class="act" data-act>${evs.map(e => `<li><span class="ic ${e.k === "vista" || e.k === "descarga" ? "vista" : e.k === "firma" ? "firma" : ""}">${ico({ vista: "eye", descarga: "download", firma: "pen", creada: "file", enviada: "send", plano: "layers", etapa: "check", pregunta: "chat", eleccion: "tag", docs: "merge" }[e.k] || "info", 15)}</span><a href="#/p/${e.p.id}/seguimiento" style="color:inherit;text-decoration:none"><b style="font-weight:600">${esc(e.p.cliente.n)}</b> · ${esc(e.x)}<small>${SYC.hace(e.t)}</small></a></li>`).join("")}</ul>
      </section>
    </div>
    <section style="margin-top:18px"><div class="cab" style="margin-bottom:12px"><h2 style="font-size:20px">Propuestas recientes</h2><a class="btn btn-s" href="#/proyectos">Ver todas ${ico("arrowR", 15)}</a></div>
      <div class="proys">${ps.slice().sort((a, b) => b.creada - a.creada).slice(0, 4).map(tarjProy).join("")}</div></section>`;
}
function tarjProy(p) {
  const e = estado(p), tt = SYC.totales(opElegida(p), p.iva);
  return `<a class="proy" href="#/p/${p.id}/cotizacion"><span class="proy-ic ${esSolar(p) ? "" : "el"}">${ico(esSolar(p) ? "sun" : "plug", 20)}</span>
    <div><h3>${esc(p.cliente.n)}</h3><div class="meta"><span>${p.id}</span><span>${esc(p.titulo)}</span>${tt.kwp ? `<span>${SYC.num(tt.kwp, 2)} kWp</span>` : ""}</div></div>
    <div class="der"><b>${SYC.Q(tt.total)}</b><span class="est ${e.c}">${e.n}</span></div></a>`;
}
function marcaMovil() { return `<div class="marca-movil"><span class="marca-sol">${solSVG(22)}</span><div><b style="font-family:var(--f-tit);font-size:17px">Sol &amp; Cobre</b></div></div>`; }

/* ---------- Propuestas ---------- */
let filtroP = "todas", buscaP = "";
function vProyectos() {
  const F = [["todas", "Todas"], ["borr", "Borradores"], ["abiertas", "Esperando respuesta"], ["acept", "Aceptadas"], ["obra", "En obra"], ["fin", "Funcionando"]];
  const pasa = p => ({ todas: 1, borr: p.etapa === 0, abiertas: p.etapa === 1, acept: p.etapa === 2 || p.etapa === 3, obra: p.etapa >= 4 && p.etapa < 7, fin: p.etapa === 7 })[filtroP];
  const q = buscaP.toLowerCase();
  const lista = SYC.db.proyectos.filter(p => pasa(p) && (!q || (p.cliente.n + p.id + p.titulo + p.cliente.dir).toLowerCase().includes(q))).sort((a, b) => b.creada - a.creada);
  raiz.innerHTML = `${marcaMovil()}<div class="cab"><div><h1>Propuestas</h1><p class="fino">Cada cliente con su cotización, su plano, sus documentos y su enlace de seguimiento.</p></div><button class="btn btn-c" data-nuevo>${ico("plus")} Nueva cotización</button></div>
    <div class="buscar" style="margin-bottom:12px">${ico("search")}<input type="search" placeholder="Buscar por cliente, número o dirección" value="${esc(buscaP)}" data-buscap aria-label="Buscar propuestas"></div>
    <div class="filtros">${F.map(([k, n]) => `<button class="chip ${filtroP === k ? "on" : ""}" data-fp="${k}">${n}</button>`).join("")}</div>
    <div class="proys" data-lista>${lista.map(tarjProy).join("") || `<p class="fino">No hay propuestas con ese filtro.</p>`}</div>`;
}

/* ---------- Una propuesta ---------- */
function vProyecto(id, tab) {
  const p = SYC.proyecto(id); if (!p) return ir("#/proyectos");
  const e = estado(p), sinLeer = p.mensajes.filter(m => m.de === "cliente" && !m.leido).length;
  const T = [["cotizacion", "Cotización", "tag"], ["plano", "Plano", "layers"], ["documentos", "Documentos", "merge"], ["seguimiento", "Seguimiento", "link"]];
  raiz.innerHTML = `<a class="miga" href="#/proyectos">${ico("chevL", 15)} Propuestas</a>
    <div class="cab"><div><h1>${esc(p.cliente.n)}</h1><p class="fino">${p.id} · ${esc(p.titulo)} · <span class="est ${e.c}">${e.n}</span></p></div>
      <div class="fila-b"><button class="btn" data-a="cliente">${ico("pen", 16)} Datos del cliente</button><a class="btn btn-p" href="#/p/${p.id}/seguimiento" ${tab === "seguimiento" ? "hidden" : ""}>${ico("send", 16)} Enviar al cliente</a></div></div>
    <nav class="pestanas" aria-label="Partes de la propuesta">${T.map(([k, n, i]) => `<a href="#/p/${p.id}/${k}" class="${tab === k ? "on" : ""}">${ico(i, 16)}${n}${k === "seguimiento" && sinLeer ? `<span class="n">${sinLeer}</span>` : ""}</a>`).join("")}</nav>
    <div data-tab></div>`;
  const cont = $("[data-tab]");
  ({ cotizacion: tCotizacion, plano: tPlano, documentos: tDocumentos, seguimiento: tSeguimiento }[tab] || tCotizacion)(p, cont);
}

/* ----- Cotización ----- */
let tipoBusca = "", textoBusca = "";
function tCotizacion(p, c) {
  const iop = Math.min(p.elegidaEdit ?? p.elegida ?? 0, p.opciones.length - 1), op = p.opciones[iop];
  const tt = SYC.totales(op, p.iva);
  const grupos = SYC.TIPOS.map(t => ({ t, items: op.items.map((it, i) => ({ it, i })).filter(x => SYC.art(x.it.sku).t === t.id) })).filter(g => g.items.length);
  const s = tt.kwp ? SYC.solar(tt.kwp, p.consumo) : null;
  c.innerHTML = `<div class="cot">
    <section class="tarj">
      <div class="ops">${p.opciones.map((o, i) => `<button class="chip ${i === iop ? "on" : ""}" data-op="${i}">${esc(o.n)}</button>`).join("")}
        <button class="chip" data-a="op-nueva">${ico("plus", 15)} Otra opción</button>
        <button class="ib" data-a="op-nombre" title="Cambiar nombre de la opción" aria-label="Cambiar nombre de la opción">${ico("pen", 15)}</button>
        ${p.opciones.length > 1 ? `<button class="ib" data-a="op-quitar" title="Quitar esta opción" aria-label="Quitar esta opción">${ico("trash", 15)}</button>` : ""}</div>
      <p class="fino">El cliente ve las opciones lado a lado en su enlace y elige una. ${p.opciones.length > 1 ? "" : "Agregue otra opción para darle a escoger (por ejemplo, con y sin batería)."}</p>
      <div class="it-cab" style="margin-top:14px"><span>Partida</span><span>Cantidad</span><span>Precio</span><span>Total</span><span></span></div>
      ${grupos.map(g => `<div class="grupo-t"><h4>${ico(g.t.i, 14)}${g.t.n}</h4>${g.items.map(({ it, i }) => { const a = SYC.art(it.sku), ex = SYC.db.existencias[it.sku]; const falta = ex != null && it.cant > ex;
        return `<div class="it"><div class="nom">${esc(a.n)}${it.origen === "plano" ? `<span class="tag-pl">del plano</span>` : ""}<small>${a.sku} · ${a.u}${ex != null ? ` · <span class="stock ${falta ? "bajo" : ""}">${falta ? `faltan ${SYC.num(it.cant - ex)} en bodega` : `${SYC.num(ex)} en bodega`}</span>` : ""}</small></div>
        <label class="c"><span class="sr">Cantidad</span><input type="number" min="0" step="${a.u === "metro" ? "0.5" : "1"}" inputmode="decimal" value="${it.cant}" data-cant="${i}"></label>
        <label class="p"><span class="sr">Precio</span><input type="number" min="0" step="0.01" inputmode="decimal" value="${it.precio}" data-precio="${i}"></label>
        <span class="tot">${SYC.Q(it.cant * it.precio * (1 - (it.desc || 0) / 100))}</span>
        <button class="ib" data-quitar="${i}" aria-label="Quitar ${esc(a.n)}" title="Quitar">${ico("x", 16)}</button></div>`; }).join("")}</div>`).join("") || `<p class="fino" style="padding:20px 0">Esta opción está vacía. Agregue productos del inventario abajo o márquelos en el plano.</p>`}
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--linea)">
        <h3 style="margin-bottom:10px">Agregar del inventario</h3>
        <div class="buscar">${ico("search")}<input type="search" placeholder="Buscar panel, inversor, cable, breaker…" value="${esc(textoBusca)}" data-busca aria-label="Buscar en el inventario"></div>
        <div class="filtros" style="margin:10px 0 0"><button class="chip ${!tipoBusca ? "on" : ""}" data-tb="">Todo</button>${SYC.TIPOS.map(t => `<button class="chip ${tipoBusca === t.id ? "on" : ""}" data-tb="${t.id}">${ico(t.i, 14)}${t.n}</button>`).join("")}</div>
        <div class="cat-res" data-res></div>
        <div class="fila-b" style="margin-top:12px"><button class="btn btn-s" data-a="kit">${ico("sun", 15)} Kit solar según el consumo</button><button class="btn btn-s" data-a="punto">${ico("plug", 15)} 10 puntos eléctricos</button></div>
      </div>
    </section>
    <aside class="resumen">
      <div class="tarj">
        <h3 style="margin-bottom:8px">${esc(op.n)}</h3>
        <div class="r-fila"><span>Subtotal</span><b>${SYC.Q(tt.sub)}</b></div>
        <div class="r-fila"><label class="interr"><input type="checkbox" data-iva ${p.iva ? "checked" : ""}> IVA 12 %</label><b>${SYC.Q(tt.iva)}</b></div>
        <div class="r-fila r-total"><span>Total</span><b>${SYC.Q(tt.total)}</b></div>
        <div class="r-fila"><label class="campo" style="grid-template-columns:auto 90px;align-items:center;gap:10px"><span>Anticipo</span><select data-anticipo>${[0, 30, 40, 50, 60, 70, 100].map(v => `<option ${v === p.anticipo ? "selected" : ""} value="${v}">${v} %</option>`).join("")}</select></label><b>${SYC.Q(tt.total * p.anticipo / 100)}</b></div>
        <div class="interno"><div class="fino" style="margin-bottom:4px">${ico("lock", 13)} Solo usted lo ve</div>
          <div class="r-fila"><span>Costo</span><b>${SYC.Q(tt.costo)}</b></div><div class="r-fila"><span>Ganancia</span><b>${SYC.Q(tt.ganancia)}</b></div><div class="r-fila"><span>Margen</span><b>${SYC.num(tt.margen * 100, 1)} %</b></div></div>
      </div>
      <div class="tarj solar-c">
        <h3 style="margin-bottom:8px">${ico("sun", 16)} Lo que ahorra</h3>
        <label class="campo" style="margin-bottom:8px"><span>Consumo del recibo (kWh al mes)</span><input type="number" min="0" inputmode="numeric" value="${p.consumo || ""}" data-consumo placeholder="Ej. 650"></label>
        ${s ? `<div class="r-fila"><span>Sistema</span><b>${SYC.num(tt.kwp, 2)} kWp · ${tt.paneles} paneles</b></div>
          <div class="r-fila"><span>Genera al mes</span><b>${SYC.num(s.genera)} kWh</b></div>
          ${p.consumo ? `<div class="r-fila"><span>Cubre</span><b>${Math.round(s.cubre * 100)} %</b></div><div class="r-fila"><span>Ahorro al mes</span><b>${SYC.Q(s.ahorro)}</b></div><div class="r-fila"><span>Se paga solo en</span><b>${SYC.num(tt.total / (s.ahorro * 12), 1)} años</b></div>` : ""}`
          : `<p class="fino">Cuando la opción lleve paneles, aquí sale cuánto genera y en cuánto se paga.</p>`}
      </div>
      <div class="fila-b"><button class="btn" data-a="ver-pdf">${ico("eye", 16)} Ver PDF</button><a class="btn btn-p" href="#/p/${p.id}/documentos">${ico("merge", 16)} Armar el expediente</a></div>
    </aside></div>`;
  resultados(p, op, c);
  const guardarYRepintar = () => { SYC.guardar(true, "cotizacion"); repintarSuave(); };
  c.oninput = e => {
    const t = e.target;
    if (t.matches("[data-busca]")) { textoBusca = t.value; resultados(p, op, c); }
  };
  c.onchange = e => {
    const t = e.target;
    if (t.matches("[data-cant]")) { op.items[+t.dataset.cant].cant = Math.max(0, parseFloat(t.value) || 0); if (op.items[+t.dataset.cant].origen === "plano") op.items[+t.dataset.cant].origen = "manual"; guardarYRepintar(); }
    if (t.matches("[data-precio]")) { op.items[+t.dataset.precio].precio = Math.max(0, parseFloat(t.value) || 0); guardarYRepintar(); }
    if (t.matches("[data-iva]")) { p.iva = t.checked; guardarYRepintar(); }
    if (t.matches("[data-anticipo]")) { p.anticipo = +t.value; guardarYRepintar(); }
    if (t.matches("[data-consumo]")) { p.consumo = Math.max(0, parseFloat(t.value) || 0); guardarYRepintar(); }
  };
  c.onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.op != null) { p.elegidaEdit = +b.dataset.op; repintarSuave(); }
    if (b.dataset.tb != null) { tipoBusca = b.dataset.tb; $$("[data-tb]", c).forEach(x => x.classList.toggle("on", x === b)); resultados(p, op, c); }
    if (b.dataset.add) {
      const ex = op.items.find(i => i.sku === b.dataset.add);
      if (ex) ex.cant += SYC.art(b.dataset.add).u === "metro" ? 10 : 1; else op.items.push({ sku: b.dataset.add, cant: SYC.art(b.dataset.add).u === "metro" ? 10 : 1, precio: SYC.precio(b.dataset.add), desc: 0, origen: "manual" });
      aviso(`${SYC.art(b.dataset.add).n} agregado.`, { tipo: "bien" }); guardarYRepintar();
    }
    if (b.dataset.quitar != null) { const [q] = op.items.splice(+b.dataset.quitar, 1); SYC.guardar(true); repintarSuave(); aviso(`Quitado: ${SYC.art(q.sku).n}`, { accion: ["Deshacer", () => { op.items.splice(+b.dataset.quitar, 0, q); guardarYRepintar(); }] }); }
    const a = b.dataset.a;
    if (a === "op-nueva") { p.opciones.push({ n: "Opción " + String.fromCharCode(65 + p.opciones.length), items: JSON.parse(JSON.stringify(op.items)) }); p.elegidaEdit = p.opciones.length - 1; aviso("Opción nueva, copiada de la actual. Cámbiele lo que quiera.", { tipo: "bien" }); guardarYRepintar(); }
    if (a === "op-nombre") dialogo({ titulo: "Nombre de la opción", campo: { valor: op.n }, ok: v => { if (v.trim()) { op.n = v.trim(); guardarYRepintar(); } } });
    if (a === "op-quitar") dialogo({ titulo: "¿Quitar esta opción?", html: `<p>Se quita «${esc(op.n)}» con sus ${op.items.length} partidas. Las demás opciones se quedan.</p>`, okTxt: "Quitar", ok: () => { p.opciones.splice(iop, 1); p.elegidaEdit = 0; if (p.elegida >= p.opciones.length) p.elegida = 0; guardarYRepintar(); } });
    if (a === "kit") {
      if (!p.consumo) { aviso("Escriba primero el consumo del recibo, a la derecha.", { tipo: "info" }); $("[data-consumo]", c).focus(); return; }
      const n = SYC.sugerirPaneles(p.consumo);
      const kit = [["PAN-550", n], ["EST-TL", n], ["INV-5K", Math.ceil(n * 0.55 / 5)], ["PRO-DC", 1], ["PRO-BRK", 2], ["PRO-TIE", 1], ["CAB-PV6", 30 + n * 2], ["CAB-10", 25], ["DUC-34", 18], ["MO-PAN", n], ["MO-PUE", 1], ["TRA-GD", 1]];
      kit.forEach(([sku, q]) => { const ex = op.items.find(i => i.sku === sku); if (ex) ex.cant = q; else op.items.push({ sku, cant: q, precio: SYC.precio(sku), desc: 0, origen: "manual" }); });
      aviso(`Kit de ${n} paneles para ${SYC.num(p.consumo)} kWh al mes.`, { tipo: "bien" }); guardarYRepintar();
    }
    if (a === "punto") { [["ACC-TOM", 6], ["ACC-APA", 4], ["ACC-CAJ", 10], ["CAB-12", 60], ["DUC-34", 40], ["MO-PTO", 10]].forEach(([sku, q]) => { const ex = op.items.find(i => i.sku === sku); if (ex) ex.cant += q; else op.items.push({ sku, cant: q, precio: SYC.precio(sku), desc: 0, origen: "manual" }); }); aviso("10 puntos eléctricos agregados.", { tipo: "bien" }); guardarYRepintar(); }
    if (a === "ver-pdf") PDFS.cotizacion(p).then(PDFS.abrir);
  };
}
function resultados(p, op, c) {
  const q = textoBusca.trim().toLowerCase();
  const lista = SYC.CATALOGO.filter(a => (!tipoBusca || a.t === tipoBusca) && (!q || (a.n + " " + a.sku + " " + SYC.tipo(a.t).n).toLowerCase().includes(q))).slice(0, 40);
  $("[data-res]", c).innerHTML = lista.map(a => { const ex = SYC.db.existencias[a.sku]; return `<button class="cat-it" data-add="${a.sku}"><span><span style="font-weight:600;font-size:14px">${esc(a.n)}</span><small>${SYC.tipo(a.t).n} · ${a.sku} · por ${a.u}${ex != null ? ` · ${SYC.num(ex)} en bodega` : ""}</small></span><b>${SYC.Q(SYC.precio(a.sku))}</b></button>`; }).join("") || `<p class="fino">Nada con «${esc(textoBusca)}».</p>`;
}

/* ----- Plano ----- */
function tPlano(p, c) {
  c.innerHTML = `<div data-plano></div>`;
  editorPlano = PLANO.montar($("[data-plano]", c), p, { irCotizacion: () => ir(`#/p/${p.id}/cotizacion`) });
}

/* ----- Documentos: todo en un solo PDF ----- */
const paginasCache = {};
async function contarPaginas(p, pz) {
  const k = pz.key === "cotizacion" || pz.key === "plano" ? null : pz.key;
  if (k && paginasCache[k]) return paginasCache[k];
  try {
    if (pz.key === "cotizacion") return await PDFS.paginasDe(await PDFS.cotizacion(p));
    if (pz.key === "plano") return [...new Set(p.plano.marcas.map(m => m.pg))].length || 1;
    const v = await PDFS.obtener(pz.key); return (paginasCache[k] = v ? v.paginas : 0);
  } catch (e) { return 0; }
}
function tDocumentos(p, c) {
  const { orden, quitados } = PDFS.piezas(p);
  const tipoTxt = { fijo: ["fijo", "Fijo"], auto: ["auto", "Se agrega solo"], subido: ["sub", "Subido"] };
  const fila = (pz, i, lista) => {
    const [cl, tx] = tipoTxt[pz.tipo]; const mov = pz.tipo !== "fijo";
    const desc = pz.tipo === "fijo" ? "Va en todas sus propuestas. Se cambia en Empresa." : pz.key === "cotizacion" ? "Sale de la pestaña Cotización, siempre al día." : pz.key === "plano" ? "Hojas del plano con lo que dibujó encima." : pz.key.startsWith("ficha-") ? "Porque la cotización lleva este equipo." : "Lo subió para este cliente.";
    const primeroMov = lista.findIndex(x => x.tipo !== "fijo"), ultimoMov = lista.length - 1 - [...lista].reverse().findIndex(x => x.tipo !== "fijo");
    return `<div class="doc ${pz.tipo === "fijo" ? "fijo" : ""}" data-key="${esc(pz.key)}"><span class="doc-ic">${ico(pz.tipo === "fijo" ? "pin" : pz.tipo === "subido" ? "upload" : "file", 16)}</span>
      <div><b>${esc(pz.n)}</b><span class="sello ${cl}">${tx}</span><small>${desc} · <span data-pags="${esc(pz.key)}">…</span></small></div>
      <div class="acc"><button class="ib" data-ver="${esc(pz.key)}" title="Ver" aria-label="Ver ${esc(pz.n)}">${ico("eye", 16)}</button>
      ${mov ? `<button class="ib" data-sube="${esc(pz.key)}" ${i === primeroMov ? "disabled" : ""} title="Subir" aria-label="Subir en el orden">${ico("chevU", 16)}</button><button class="ib" data-baja="${esc(pz.key)}" ${i === ultimoMov ? "disabled" : ""} title="Bajar" aria-label="Bajar en el orden">${ico("chevD", 16)}</button><button class="ib" data-saca="${esc(pz.key)}" title="No incluir" aria-label="No incluir ${esc(pz.n)}">${ico("x", 16)}</button>` : `<span class="ib" style="border:0;color:var(--gris)" title="Fijo">${ico("lock", 15)}</span>`}</div></div>`;
  };
  c.innerHTML = `<div class="dos">
    <section class="tarj"><h2>Expediente de ${esc(p.cliente.n)}</h2>
      <p class="fino" style="margin-bottom:14px">Todo sale en <b>un solo PDF</b>, en este orden. Los fijos van siempre; lo demás se agrega solo o lo sube usted. Lo puede subir y bajar.</p>
      <div class="docs" data-docs>${orden.map((pz, i) => fila(pz, i, orden)).join("")}</div>
      ${quitados.length ? `<h3 style="margin:16px 0 8px;font-size:14px">No van esta vez</h3><div class="docs">${quitados.map(pz => `<div class="doc" style="opacity:.7"><span class="doc-ic">${ico("file", 16)}</span><div><b>${esc(pz.n)}</b></div><div class="acc"><button class="btn btn-s" data-pone="${esc(pz.key)}">${ico("plus", 14)} Volver a poner</button></div></div>`).join("")}</div>` : ""}
      <div class="soltar" data-soltar style="margin-top:16px">${ico("upload", 26)}<b>Suelte aquí sus PDF</b><p class="fino">Recibos, estudios de sombra, fotos del lugar, permisos. Puede subir varios a la vez: se unen con lo demás.</p>
        <div class="fila-b" style="justify-content:center"><label class="btn btn-p">${ico("upload", 16)} Elegir PDF<input type="file" accept="application/pdf" multiple hidden data-subir></label><button class="btn" data-a="ejemplos">Probar con 3 PDF de ejemplo</button></div></div>
    </section>
    <aside class="rejilla lado-docs">
      <div class="tarj"><h3 style="margin-bottom:12px">Así queda</h3>
        <div class="union"><div class="pila" data-pila></div><span class="flecha" style="color:var(--cobre)">${ico("arrowR", 22)}</span>
          <div class="unido"><b>Propuesta ${p.id}.pdf</b><span data-total>Contando páginas…</span></div></div>
        <div class="fila-b" style="margin-top:14px"><button class="btn" data-a="ver">${ico("eye", 16)} Ver el PDF unido</button><button class="btn" data-a="bajar">${ico("download", 16)} Descargar</button></div>
        <button class="btn btn-c" data-a="publicar" style="width:100%;margin-top:10px">${ico("link", 16)} Publicar en el enlace del cliente</button>
        <p class="fino" style="margin-top:8px">${p.expediente ? `Publicado ${SYC.hace(p.expediente.t)} · ${p.expediente.paginas} páginas. Si cambia algo, vuelva a publicar.` : "Todavía no se ha publicado. El cliente lo descarga desde su enlace."}</p>
      </div>
      <div class="tarj"><h3 style="margin-bottom:6px">Documentos fijos</h3><p class="fino" style="margin-bottom:10px">Carta, certificaciones, garantías y términos: se suben una vez y entran en todas las propuestas.</p><a class="btn btn-s" href="#/empresa">${ico("pin", 15)} Ver documentos fijos</a></div>
    </aside></div>`;
  // conteo de páginas y pila visual
  (async () => {
    let total = 0, hojas = "";
    for (const pz of orden) {
      const n = await contarPaginas(p, pz); total += n;
      const el = c.querySelector(`[data-pags="${CSS.escape(pz.key)}"]`); if (el) el.textContent = n + (n === 1 ? " página" : " páginas");
      hojas += Array.from({ length: Math.min(n, 6) }, () => `<span class="hojita ${pz.tipo === "fijo" ? "f" : pz.tipo === "subido" ? "s" : "a"}" title="${esc(pz.n)}"></span>`).join("");
    }
    const pila = c.querySelector("[data-pila]"); if (pila) pila.innerHTML = hojas;
    const t = c.querySelector("[data-total]"); if (t) t.textContent = `${orden.length} documentos · ${total} páginas en un solo archivo`;
  })();
  const mover = (key, d) => {
    const { orden } = PDFS.piezas(p); const mov = orden.filter(x => x.tipo !== "fijo").map(x => x.key);
    const i = mov.indexOf(key), j = i + d; if (j < 0 || j >= mov.length) return;
    [mov[i], mov[j]] = [mov[j], mov[i]]; p.orden = mov; SYC.guardar(true, "docs"); repintarSuave();
  };
  async function subir(files) {
    const pdfs = [...files].filter(f => f.type === "application/pdf" || /\.pdf$/i.test(f.name));
    if (!pdfs.length) return aviso("Solo se aceptan archivos PDF.", { tipo: "mal" });
    let n = 0;
    for (const f of pdfs) {
      const id = `sub-${p.id}-${SYC.uid()}`;
      try { await PDFS.guardarPDF(id, f.name, await f.arrayBuffer(), "subido"); p.docsSubidos.push({ id, n: f.name.replace(/\.pdf$/i, ""), t: SYC.ahora() }); n++; }
      catch (e) { aviso(`«${f.name}» no se pudo leer. ¿Está dañado o con contraseña?`, { tipo: "mal" }); }
    }
    if (n) { SYC.evento(p, "docs", `${n} ${n === 1 ? "documento subido" : "documentos subidos"} al expediente`); SYC.guardar(true, "docs"); repintarSuave(); aviso(`${n} PDF ${n === 1 ? "agregado" : "agregados"}. Ya forman parte del archivo único.`, { tipo: "bien" }); }
  }
  async function ejemplos() {
    const L = PDFLib, nombres = [["Recibo de luz del cliente", ["Consumo de los últimos 12 meses", "Promedio: " + SYC.num(p.consumo || 650) + " kWh al mes", "Tarifa social: no aplica"]], ["Estudio de sombras", ["Revisión de sombras de 8:00 a 16:00 h", "Árbol al oriente: sombra antes de las 8:30 h", "Pérdida estimada: 3 %"]], ["Fotos del lugar", ["Techo de lámina en buen estado", "Tablero principal de 12 polos", "Acometida aérea de 2 hilos"]]];
    for (const [n, lineas] of nombres) {
      const d = await L.PDFDocument.create(); const f = await d.embedFont(L.StandardFonts.Helvetica), fb = await d.embedFont(L.StandardFonts.HelveticaBold);
      const pg = d.addPage([612, 792]);
      pg.drawRectangle({ x: 0, y: 742, width: 612, height: 50, color: L.rgb(0.93, 0.91, 0.86) });
      pg.drawText(n, { x: 50, y: 760, size: 18, font: fb, color: L.rgb(0.1, 0.13, 0.11) });
      lineas.forEach((l, i) => pg.drawText("• " + l, { x: 50, y: 690 - i * 26, size: 13, font: f, color: L.rgb(0.2, 0.22, 0.2) }));
      pg.drawRectangle({ x: 50, y: 300, width: 512, height: 260, color: L.rgb(0.95, 0.94, 0.9), borderColor: L.rgb(0.8, 0.78, 0.72), borderWidth: 1 });
      pg.drawText("Documento de ejemplo subido por el instalador", { x: 170, y: 425, size: 11, font: f, color: L.rgb(0.5, 0.5, 0.48) });
      const id = `sub-${p.id}-${SYC.uid()}`;
      await PDFS.guardarPDF(id, n + ".pdf", await d.save(), "subido"); p.docsSubidos.push({ id, n, t: SYC.ahora() });
    }
    SYC.evento(p, "docs", "3 documentos subidos al expediente"); SYC.guardar(true, "docs"); repintarSuave();
    aviso("3 PDF agregados. Mire cómo quedan en un solo archivo.", { tipo: "bien" });
  }
  async function armar() { aviso("Uniendo los documentos…", { dur: 1500 }); return PDFS.expediente(p); }
  c.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.sube) mover(b.dataset.sube, -1);
    if (b.dataset.baja) mover(b.dataset.baja, 1);
    if (b.dataset.saca) { p.docsQuitar.push(b.dataset.saca); const sub = p.docsSubidos.find(d => d.id === b.dataset.saca); SYC.guardar(true, "docs"); repintarSuave(); aviso(sub ? "Ese PDF no irá esta vez. Sigue guardado abajo." : "No irá en esta propuesta.", { accion: ["Deshacer", () => { p.docsQuitar = p.docsQuitar.filter(k => k !== b.dataset.saca); SYC.guardar(true); repintarSuave(); }] }); }
    if (b.dataset.pone) { p.docsQuitar = p.docsQuitar.filter(k => k !== b.dataset.pone); SYC.guardar(true, "docs"); repintarSuave(); }
    if (b.dataset.ver) { const k = b.dataset.ver; if (k === "plano") await PLANO.exportar(p); const by = k === "cotizacion" ? await PDFS.cotizacion(p) : k === "plano" ? await PDFS.planoMarcado(p) : (await PDFS.obtener(k)).bytes; PDFS.abrir(by); }
    const a = b.dataset.a;
    if (a === "ejemplos") ejemplos();
    if (a === "ver") { const r = await armar(); PDFS.abrir(r.bytes); }
    if (a === "bajar") { const r = await armar(); PDFS.descargar(r.bytes, `Propuesta ${p.id} - ${p.cliente.n}.pdf`); }
    if (a === "publicar") {
      if (p.plano) await PLANO.exportar(p);
      const r = await armar(); await SYC.idb.poner("exp-" + p.id, { bytes: r.bytes });
      p.expediente = { t: SYC.ahora(), paginas: r.paginas, partes: r.partes.map(x => ({ n: x.n, paginas: x.paginas, tipo: x.tipo })) };
      SYC.evento(p, "docs", `Expediente publicado (${r.paginas} páginas)`); SYC.guardar(true, "docs"); repintarSuave();
      aviso(`Listo: ${r.paginas} páginas en un solo PDF, ya en el enlace del cliente.`, { tipo: "bien", accion: ["Ver como el cliente", () => window.open(urlCliente(p), "_blank")] });
    }
  };
  c.onchange = e => { if (e.target.matches("[data-subir]")) { subir(e.target.files); e.target.value = ""; } };
  const zona = $("[data-soltar]", c);
  ["dragenter", "dragover"].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.classList.add("sobre"); }));
  ["dragleave", "drop"].forEach(ev => zona.addEventListener(ev, e => { e.preventDefault(); zona.classList.remove("sobre"); }));
  zona.addEventListener("drop", e => subir(e.dataTransfer.files));
}

/* ----- Seguimiento ----- */
function tSeguimiento(p, c) {
  const ult = p.eventos.filter(e => e.k === "vista").pop();
  p.mensajes.forEach(m => { if (m.de === "cliente") m.leido = true; }); SYC.guardar(false);
  const sig = SYC.ETAPAS[p.etapa + 1];
  c.innerHTML = `<div class="dos">
    <div class="rejilla">
      <section class="tarj"><h2>Enlace personal de ${esc(p.cliente.n)}</h2>
        <div class="enlace"><div class="qr" data-qr aria-label="Código QR del enlace"></div>
          <div style="display:grid;gap:10px;min-width:0"><div class="url">${esc(enlace(p))}</div>
            <div class="fila-b"><button class="btn btn-p" data-a="wa">${ico("send", 16)} Enviar por WhatsApp</button><button class="btn" data-a="copiar">${ico("copy", 16)} Copiar</button><a class="btn" href="${urlCliente(p)}" target="_blank" rel="noopener">${ico("ext", 16)} Abrirlo como el cliente</a><button class="ib" data-a="slug" title="Cambiar el enlace" aria-label="Cambiar el enlace">${ico("pen", 15)}</button></div>
            <p class="fino">Ahí ve su propuesta con su marca, compara opciones, firma, descarga el expediente y sigue la obra con fotos. Usted se entera cuando lo abre.</p></div></div>
      </section>
      <section class="tarj"><h2>Avance de la obra</h2>
        <ol class="etapas">${SYC.ETAPAS.map((e, i) => `<li class="${i < p.etapa ? "hecha" : i === p.etapa ? "ahora" : ""}"><span class="pt">${i < p.etapa ? ico("check", 14) : ""}</span><div><b>${e.n}</b><small>${e.d}</small></div></li>`).join("")}</ol>
        <div class="fila-b">${sig ? `<button class="btn btn-c" data-a="avanzar">${ico("arrowR", 16)} Pasar a: ${sig.n}</button>` : `<span class="est firmada">Proyecto entregado</span>`}${p.etapa > 0 ? `<button class="btn btn-s" data-a="regresar">${ico("undo", 14)} Regresar una etapa</button>` : ""}</div>
        <p class="fino" style="margin-top:8px">El cliente ve cada cambio en su enlace al momento.</p>
      </section>
      <section class="tarj"><div class="cab" style="margin-bottom:12px"><h2 style="margin:0">Fotos del avance</h2><label class="btn btn-s">${ico("camera", 15)} Agregar foto<input type="file" accept="image/*" hidden data-foto></label></div>
        <div class="fotos" data-fotos>${p.fotos.length ? "" : `<p class="fino">Suba fotos desde el teléfono en la obra: el cliente las ve en su enlace.</p>`}</div>
      </section>
    </div>
    <aside class="rejilla">
      <section class="tarj"><h2>Lo que hizo el cliente</h2>
        <div class="cifras" style="grid-template-columns:1fr 1fr;margin-bottom:12px"><div class="cifra"><span>Veces que lo abrió</span><b>${p.vistas}</b><small>${ult ? SYC.hace(ult.t) : "todavía no"}</small></div><div class="cifra"><span>Eligió</span><b style="font-size:15px;font-family:var(--f-txt)">${esc(opElegida(p).n)}</b><small>${p.firma ? "firmó " + SYC.hace(p.firma.t) : "sin firmar"}</small></div></div>
        <ul class="act">${p.eventos.slice().reverse().slice(0, 10).map(e => `<li><span class="ic ${e.k === "vista" || e.k === "descarga" ? "vista" : e.k === "firma" ? "firma" : ""}">${ico({ vista: "eye", descarga: "download", firma: "pen", creada: "file", enviada: "send", plano: "layers", etapa: "check", pregunta: "chat", eleccion: "tag", docs: "merge" }[e.k] || "info", 15)}</span><span>${esc(e.x)}<small>${SYC.hace(e.t)}</small></span></li>`).join("")}</ul>
      </section>
      <section class="tarj"><h2>Preguntas</h2>
        <div class="rejilla" style="gap:8px">${p.mensajes.map(m => `<div style="padding:10px 12px;border-radius:12px;background:${m.de === "cliente" ? "var(--papel)" : "var(--azul-s)"};${m.de === "cliente" ? "" : "margin-left:24px"}"><small class="fino">${m.de === "cliente" ? esc(p.cliente.n) : "Usted"} · ${SYC.hace(m.t)}</small><p>${esc(m.x)}</p></div>`).join("") || `<p class="fino">Cuando el cliente pregunte algo desde su enlace, aparece aquí.</p>`}</div>
        <label class="campo" style="margin-top:10px"><span class="sr">Respuesta</span><textarea data-resp placeholder="Escriba una respuesta para su enlace"></textarea></label>
        <button class="btn btn-s" data-a="responder" style="margin-top:8px">${ico("send", 14)} Responder</button>
      </section>
    </aside></div>`;
  // QR
  try { new QRCode($("[data-qr]", c), { text: urlCliente(p), width: 96, height: 96, colorDark: "#17211C", colorLight: "#FFFFFF", correctLevel: QRCode.CorrectLevel.M }); } catch (e) {}
  // fotos
  (async () => {
    const cont = $("[data-fotos]", c); if (!p.fotos.length) return;
    const html = [];
    for (const f of p.fotos.slice().reverse()) {
      let src = f.img ? fotoMuestra(f.img) : "";
      if (f.id) { const v = await SYC.idb.leer(f.id); if (v) src = URL.createObjectURL(new Blob([v.bytes], { type: v.tipo })); }
      html.push(`<figure class="foto" style="margin:0"><img class="img" src="${src}" alt="${esc(f.x)}"><p>${esc(f.x)}<small>${SYC.hace(f.t)}</small></p></figure>`);
    }
    cont.innerHTML = html.join("");
  })();
  c.onclick = e => {
    const b = e.target.closest("button"); if (!b) return; const a = b.dataset.a;
    if (a === "copiar") { navigator.clipboard?.writeText(urlCliente(p)).then(() => aviso("Enlace copiado.", { tipo: "bien" }), () => aviso("No se pudo copiar.", { tipo: "mal" })); }
    if (a === "wa") {
      const tt = SYC.totales(opElegida(p), p.iva);
      const msg = `Buen día. Le comparto su propuesta de ${SYC.MARCA.nombre}: ${p.titulo.toLowerCase()}${tt.kwp ? ` de ${SYC.num(tt.kwp, 2)} kWp` : ""}.\n\nAhí puede ver las opciones, el plano y todos los documentos, y aceptarla cuando esté listo:\n${enlace(p)}\n\nCualquier duda, aquí estamos.`;
      dialogo({ titulo: "Mensaje para WhatsApp", html: `<div style="background:#E7F5DF;border-radius:12px 12px 12px 4px;padding:12px 14px;white-space:pre-wrap;font-size:14.5px">${esc(msg)}</div><p class="fino">En la demo no se envía nada. Con el sistema real se abre WhatsApp con este mensaje listo para ${esc(p.cliente.tel)}.</p>`, okTxt: "Marcar como enviado", ok: () => { if (p.etapa === 0) p.etapa = 1; SYC.evento(p, "enviada", "Enlace enviado por WhatsApp"); SYC.guardar(true, "enviada"); repintarSuave(); aviso("Marcado como enviado.", { tipo: "bien" }); } });
    }
    if (a === "slug") dialogo({ titulo: "Cambiar el enlace", html: `<p class="fino">Como quiere que se lea después de ${esc(SYC.MARCA.dominio)}/p/</p>`, campo: { valor: p.codigo }, ok: v => { const s = SYC.slug(v); if (!s) return false; if (SYC.db.proyectos.some(x => x !== p && x.codigo === s)) { aviso("Ese enlace ya lo usa otro cliente.", { tipo: "mal" }); return false; } p.codigo = s; SYC.guardar(true); repintarSuave(); } });
    if (a === "avanzar" && sig) {
      if (p.etapa === 1 && !p.firma) return dialogo({ titulo: "¿Pasar a aceptada sin firma?", html: `<p>El cliente todavía no firma en su enlace. Puede marcarla aceptada si ya le confirmó por otro medio.</p>`, okTxt: "Sí, marcar aceptada", ok: () => avanzar() });
      avanzar();
    }
    if (a === "regresar") { p.etapa--; SYC.evento(p, "etapa", "Etapa regresada a: " + SYC.ETAPAS[p.etapa].n); SYC.guardar(true, "etapa"); repintarSuave(); }
    if (a === "responder") { const t = $("[data-resp]", c).value.trim(); if (!t) return; p.mensajes.push({ de: "nosotros", t: SYC.ahora(), x: t }); SYC.guardar(true, "respuesta"); repintarSuave(); aviso("Respuesta enviada a su enlace.", { tipo: "bien" }); }
  };
  function avanzar() {
    p.etapa++; SYC.evento(p, "etapa", SYC.ETAPAS[p.etapa].n);
    if (p.etapa === 3) apartar(p); // con el anticipo se aparta el equipo del inventario
    SYC.guardar(true, "etapa"); repintarSuave(); aviso(`Ahora: ${SYC.ETAPAS[p.etapa].n}. El cliente ya lo ve.`, { tipo: "bien" });
  }
  c.onchange = async e => {
    if (!e.target.matches("[data-foto]")) return; const f = e.target.files[0]; if (!f) return;
    const id = "foto-" + SYC.uid();
    await SYC.idb.poner(id, { bytes: await f.arrayBuffer(), tipo: f.type });
    dialogo({ titulo: "¿Qué muestra la foto?", campo: { valor: "" }, okTxt: "Publicar", cancelar: "Sin texto", ok: v => { p.fotos.push({ t: SYC.ahora(), x: v.trim() || "Avance de la obra", id }); SYC.guardar(true, "foto"); repintarSuave(); aviso("Foto publicada en el enlace del cliente.", { tipo: "bien" }); } });
  };
}
function apartar(p) {
  for (const it of opElegida(p).items) if (SYC.db.existencias[it.sku] != null) SYC.db.existencias[it.sku] = Math.max(0, SYC.db.existencias[it.sku] - it.cant);
  SYC.evento(p, "etapa", "Equipo apartado del inventario");
}

/* ---------- Inventario ---------- */
let invTipo = "";
function vInventario() {
  const apartado = sku => SYC.db.proyectos.filter(p => p.etapa === 2).reduce((s, p) => s + (opElegida(p).items.find(i => i.sku === sku)?.cant || 0), 0);
  const cotizado = sku => SYC.db.proyectos.filter(p => p.etapa === 1).reduce((s, p) => s + (opElegida(p).items.find(i => i.sku === sku)?.cant || 0), 0);
  const valor = SYC.CATALOGO.filter(a => a.s != null).reduce((s, a) => s + SYC.db.existencias[a.sku] * a.c, 0);
  const bajos = SYC.CATALOGO.filter(a => a.s != null && SYC.db.existencias[a.sku] < a.min);
  raiz.innerHTML = `${marcaMovil()}<div class="cab"><div><h1>Inventario</h1><p class="fino">${SYC.TIPOS.length} tipos, ${SYC.CATALOGO.length} productos y servicios. Lo que cotiza sale de aquí con su precio.</p></div><button class="btn" data-a="precio">${ico("tag", 16)} Cambiar un precio</button></div>
    <div class="cifras"><div class="cifra osc"><span>Valor en bodega (al costo)</span><b>${SYC.Q(valor)}</b></div><div class="cifra"><span>Bajo el mínimo</span><b>${bajos.length}</b><small>${bajos.map(a => a.sku).join(", ") || "ninguno"}</small></div><div class="cifra"><span>Tipos de inventario</span><b>${SYC.TIPOS.length}</b><small>productos, por metro y servicios</small></div></div>
    <div class="filtros"><button class="chip ${!invTipo ? "on" : ""}" data-it="">Todo</button>${SYC.TIPOS.map(t => `<button class="chip ${invTipo === t.id ? "on" : ""}" data-it="${t.id}">${ico(t.i, 14)}${t.n}</button>`).join("")}</div>
    <div class="inv">${SYC.TIPOS.filter(t => !invTipo || t.id === invTipo).map(t => `<div class="inv-g"><h3>${ico(t.i, 16)}${t.n}</h3><div class="inv-lista">${SYC.CATALOGO.filter(a => a.t === t.id).map(a => {
      const ex = SYC.db.existencias[a.sku], pct = ex != null ? Math.min(100, ex / (a.min * 3) * 100) : 0, ap = apartado(a.sku), co = cotizado(a.sku);
      return `<div class="inv-f"><code>${a.sku}</code><div><b style="font-weight:600">${esc(a.n)}</b><small class="fino" style="display:block">por ${a.u}${co ? ` · ${SYC.num(co)} en propuestas abiertas` : ""}${ap ? ` · ${SYC.num(ap)} apartados` : ""}</small></div>
        <span class="n">${ex != null ? `<b class="${ex < a.min ? "stock bajo" : ""}">${SYC.num(ex)}</b>` : `<span class="fino">servicio</span>`}</span>
        <span class="barra-c">${ex != null ? `<span class="barra-s"><i class="${ex < a.min ? "bajo" : ""}" style="width:${pct}%"></i></span>` : ""}</span>
        <span class="n c">${SYC.Q(SYC.precio(a.sku))}</span></div>`; }).join("")}</div></div>`).join("")}</div>`;
}

/* ---------- Empresa: marca y documentos fijos ---------- */
function vEmpresa() {
  const f = SYC.db.fijos;
  raiz.innerHTML = `${marcaMovil()}<div class="cab"><div><h1>Su empresa</h1><p class="fino">Su marca y los documentos que van en todas las propuestas.</p></div></div>
    <div class="dos">
      <section class="tarj"><h2>Documentos fijos</h2><p class="fino" style="margin-bottom:12px">Se suben una vez y entran solos en cada expediente, al inicio o al final. Si cambia un certificado, lo reemplaza aquí y todas las propuestas nuevas lo llevan.</p>
        <div class="docs">${f.map((d, i) => `<div class="doc fijo"><span class="doc-ic">${ico("pin", 16)}</span><div><b>${esc(d.n)}</b><small>Va al ${d.pos} · <span data-fp="${d.id}">…</span></small></div>
          <div class="acc" style="align-items:center;flex-wrap:wrap;justify-content:flex-end"><label class="interr" title="Incluir en todas las propuestas"><input type="checkbox" data-on="${i}" ${d.on ? "checked" : ""}><span class="sr">Incluir</span></label>
          <button class="ib" data-pos="${i}" title="Cambiar a ${d.pos === "inicio" ? "final" : "inicio"}" aria-label="Mover al ${d.pos === "inicio" ? "final" : "inicio"}">${ico(d.pos === "inicio" ? "chevD" : "chevU", 16)}</button>
          <button class="ib" data-verf="${d.id}" title="Ver" aria-label="Ver ${esc(d.n)}">${ico("eye", 16)}</button>
          <label class="ib" title="Reemplazar con su PDF" aria-label="Reemplazar ${esc(d.n)}">${ico("upload", 16)}<input type="file" accept="application/pdf" hidden data-reemp="${d.id}"></label></div></div>`).join("")}</div>
        <label class="btn btn-s" style="margin-top:12px">${ico("plus", 15)} Agregar otro documento fijo<input type="file" accept="application/pdf" hidden data-nuevof></label>
      </section>
      <section class="tarj"><h2>Su marca</h2>
        <div style="background:var(--tinta);border-radius:14px;padding:18px;color:#fff;display:flex;gap:12px;align-items:center;border-bottom:4px solid var(--cobre)">${solSVG(34)}<div><b style="font-family:var(--f-tit);font-size:22px">${esc(SYC.MARCA.nombre)}</b><div style="color:#C9C3B4;font-size:13px">${esc(SYC.MARCA.linea)}</div></div></div>
        <p class="fino" style="margin:12px 0">Así sale en cada PDF y en el enlace de sus clientes. Con el sistema real va su logo, sus colores y su dominio.</p>
        <div class="r-fila"><span>Dominio</span><b>${SYC.MARCA.dominio}</b></div><div class="r-fila"><span>Teléfono</span><b>${SYC.MARCA.tel}</b></div><div class="r-fila"><span>Correo</span><b style="font-family:var(--f-txt)">${SYC.MARCA.correo}</b></div>
        <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--linea)"><h3 style="margin-bottom:6px">Volver a empezar la demo</h3><p class="fino" style="margin-bottom:10px">Borra lo que hizo en este navegador y deja los datos de ejemplo.</p><button class="btn btn-s" data-a="reiniciar">${ico("rotate", 15)} Reiniciar la demo</button></div>
      </section></div>`;
  f.forEach(async d => { const v = await PDFS.obtener(d.id); const el = $(`[data-fp="${d.id}"]`); if (el && v) el.textContent = `${v.paginas} ${v.paginas === 1 ? "página" : "páginas"} · ${v.origen === "subido" ? "su archivo" : "de ejemplo"}`; });
  raiz.onclick = async e => {
    const b = e.target.closest("button"); if (!b || ruta[0] !== "empresa") return;
    if (b.dataset.pos != null) { const d = f[+b.dataset.pos]; d.pos = d.pos === "inicio" ? "final" : "inicio"; SYC.guardar(true); repintarSuave(); }
    if (b.dataset.verf) { const v = await PDFS.obtener(b.dataset.verf); PDFS.abrir(v.bytes); }
    if (b.dataset.a === "reiniciar") dialogo({ titulo: "¿Reiniciar la demo?", html: "<p>Se borran las propuestas, planos y PDF que agregó en este navegador. Vuelven los datos de ejemplo.</p>", okTxt: "Reiniciar", ok: () => { SYC.reiniciar().then(() => { aviso("Demo reiniciada.", { tipo: "bien" }); ir("#/hoy"); }); } });
  };
  raiz.onchange = async e => {
    const t = e.target; if (ruta[0] !== "empresa") return;
    if (t.dataset.on != null) { f[+t.dataset.on].on = t.checked; SYC.guardar(true); aviso(t.checked ? "Ahora va en todas las propuestas." : "Ya no va en las propuestas.", { tipo: "info" }); }
    if (t.dataset.reemp && t.files[0]) { try { await PDFS.guardarPDF(t.dataset.reemp, t.files[0].name, await t.files[0].arrayBuffer(), "subido"); delete paginasCache[t.dataset.reemp]; aviso("Documento reemplazado. Las propuestas ya llevan el suyo.", { tipo: "bien" }); repintarSuave(); } catch (er) { aviso("No se pudo leer ese PDF.", { tipo: "mal" }); } }
    if (t.matches("[data-nuevof]") && t.files[0]) { const id = "fijo-" + SYC.uid(); try { await PDFS.guardarPDF(id, t.files[0].name, await t.files[0].arrayBuffer(), "subido"); f.push({ id, n: t.files[0].name.replace(/\.pdf$/i, ""), pos: "final", on: true }); SYC.guardar(true); repintarSuave(); aviso("Documento fijo agregado.", { tipo: "bien" }); } catch (er) { aviso("No se pudo leer ese PDF.", { tipo: "mal" }); } }
  };
}

/* ---------- Nueva cotización y datos del cliente ---------- */
function formCliente(p = {}) {
  const c = p.cliente || {};
  return `<div class="campos"><label class="campo"><span>Cliente o lugar</span><input name="n" value="${esc(c.n || "")}" placeholder="Ej. Casa de la familia, Ferretería El Puente" required></label>
    <label class="campo"><span>Teléfono</span><input name="tel" value="${esc(c.tel || "")}" inputmode="tel"></label>
    <label class="campo"><span>Dirección</span><input name="dir" value="${esc(c.dir || "")}"></label>
    <label class="campo"><span>Tipo</span><select name="tipo">${["Residencial", "Comercial", "Industrial"].map(x => `<option ${x === c.tipo ? "selected" : ""}>${x}</option>`).join("")}</select></label>
    <label class="campo"><span>Trabajo</span><input name="titulo" value="${esc(p.titulo || "")}" placeholder="Ej. Sistema solar de 6 kWp"></label></div>`;
}
function nuevaCotizacion() {
  dialogo({ titulo: "Nueva cotización", ancho: 620, html: formCliente() + `<div class="campos" style="margin-top:12px"><label class="campo"><span>Empezar con</span><select name="plant"><option value="solar">Kit solar según el consumo</option><option value="elec">Instalación eléctrica</option><option value="nada">En blanco</option></select></label><label class="campo"><span>Consumo del recibo (kWh al mes)</span><input name="consumo" type="number" inputmode="numeric" placeholder="Ej. 650"></label></div>`, okTxt: "Crear", ok: (v, dlg) => {
    const F = n => dlg.querySelector(`[name=${n}]`).value.trim();
    if (!F("n")) { aviso("Escriba el nombre del cliente o del lugar.", { tipo: "mal" }); return false; }
    const consumo = parseFloat(F("consumo")) || 0, plant = F("plant");
    let items = [];
    if (plant === "solar") { const n = consumo ? SYC.sugerirPaneles(consumo) : 8; items = [["PAN-550", n], ["EST-TL", n], ["INV-5K", Math.ceil(n * 0.55 / 5)], ["PRO-DC", 1], ["PRO-BRK", 2], ["PRO-TIE", 1], ["CAB-PV6", 30 + n * 2], ["CAB-10", 25], ["DUC-34", 18], ["MO-PAN", n], ["MO-PUE", 1], ["TRA-GD", 1]]; }
    if (plant === "elec") items = [["TAB-12", 1], ["ACC-TOM", 8], ["ACC-APA", 5], ["ACC-CAJ", 13], ["LUM-PAN", 6], ["CAB-12", 90], ["DUC-34", 60], ["MO-PTO", 19]];
    const id = "SYC-0" + SYC.db.siguiente++;
    let codigo = SYC.slug(F("n")); while (SYC.db.proyectos.some(x => x.codigo === codigo)) codigo += "-2";
    const p = { id, codigo, titulo: F("titulo") || (plant === "elec" ? "Instalación eléctrica" : "Sistema solar"), cliente: { n: F("n"), tel: F("tel"), dir: F("dir"), tipo: F("tipo") }, consumo, creada: SYC.ahora(), etapa: 0, vistas: 0, iva: true, anticipo: 60, elegida: 0, firma: null, fotos: [], mensajes: [], plano: null, docsSubidos: [], docsQuitar: [],
      opciones: [{ n: "Opción A", items: items.map(([s, q]) => ({ sku: s, cant: q, precio: SYC.precio(s), desc: 0, origen: "manual" })) }], eventos: [{ t: SYC.ahora(), k: "creada", x: "Cotización creada" }] };
    SYC.db.proyectos.push(p); SYC.guardar(true, "nueva"); ir(`#/p/${id}/cotizacion`); aviso("Cotización creada. Ajuste las partidas o márquelas en el plano.", { tipo: "bien" });
  } });
}
document.addEventListener("click", e => {
  if (e.target.closest("[data-nuevo]")) nuevaCotizacion();
  const fp = e.target.closest("[data-fp]"); if (fp && ruta[0] === "proyectos") { filtroP = fp.dataset.fp; vProyectos(); }
  const it = e.target.closest("[data-it]"); if (it) { invTipo = it.dataset.it; const y = scrollY; vInventario(); scrollTo(0, y); }
  const pr = e.target.closest("[data-a=precio]"); if (pr) dialogo({ titulo: "Cambiar un precio", ancho: 560, html: `<label class="campo"><span>Producto</span><select data-sku>${SYC.CATALOGO.map(a => `<option value="${a.sku}">${esc(a.n)} (${SYC.Q(SYC.precio(a.sku))})</option>`).join("")}</select></label><label class="campo"><span>Precio nuevo</span><input type="number" step="0.01" data-pn></label><p class="fino">Aplica a las cotizaciones nuevas. Las que ya envió conservan su precio.</p>`, okTxt: "Guardar", ok: (v, d) => { const sku = d.querySelector("[data-sku]").value, n = parseFloat(d.querySelector("[data-pn]").value); if (!(n >= 0)) { aviso("Escriba un precio.", { tipo: "mal" }); return false; } SYC.db.precios[sku] = n; SYC.guardar(true); repintarSuave(); aviso(`Precio de ${SYC.art(sku).n}: ${SYC.Q(n)}`, { tipo: "bien" }); } });
  const dc = e.target.closest("[data-a=cliente]"); if (dc) { const p = SYC.proyecto(ruta[1]); dialogo({ titulo: "Datos del cliente", ancho: 620, html: formCliente(p), okTxt: "Guardar", ok: (v, d) => { const F = n => d.querySelector(`[name=${n}]`).value.trim(); if (!F("n")) return false; Object.assign(p.cliente, { n: F("n"), tel: F("tel"), dir: F("dir"), tipo: F("tipo") }); p.titulo = F("titulo") || p.titulo; SYC.guardar(true); repintarSuave(); aviso("Datos guardados.", { tipo: "bien" }); } }); }
});
document.addEventListener("input", e => { if (e.target.matches("[data-buscap]")) { buscaP = e.target.value; const sel = e.target.selectionStart; vProyectos(); const i = $("[data-buscap]"); i.focus(); i.setSelectionRange(sel, sel); } });

/* ---------- En vivo: el panel se entera de lo que hace el cliente en su enlace ---------- */
SYC.bus.oir(m => {
  const txt = { vista: "abrió su propuesta", firma: "aceptó y firmó su propuesta", pregunta: "le dejó una pregunta", eleccion: "eligió una opción", descarga: "descargó su expediente" }[m.que];
  if (txt && m.p) { const p = SYC.proyecto(m.p); if (p) aviso(`${p.cliente.n} ${txt}.`, { tipo: m.que === "firma" ? "bien" : "vista", accion: ["Ver", () => ir(`#/p/${p.id}/seguimiento`)], dur: 7000 }); }
  // los datos se recargaron desde otra pestaña: se vuelve a pintar (agrupado para no parpadear)
  clearTimeout(window.__rp); window.__rp = setTimeout(repintarSuave, 120);
});

pintar();
