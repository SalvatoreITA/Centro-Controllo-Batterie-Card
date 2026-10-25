/*! DomHouse Battery Card — Centro Controllo Batterie
 *  Lovelace custom card per Home Assistant · https://www.domhouse.it
 *  (c) 2026 Salvatore Lentini — Licenza MIT
 *  Si auto-configura dal dispositivo dell'integrazione Centro Controllo Batterie:
 *  basta scegliere il dispositivo e la card pesca batterie, soglia, switch e orari.
 */
const CARD_VERSION = "3.0";
const CCB_DOMAIN = "centro_controllo_batterie";

console.info(
  `%c DOMHOUSE-BATTERY-CARD %c v${CARD_VERSION} `,
  "color:#fff;background:#2e9e44;font-weight:700;border-radius:4px 0 0 4px;padding:2px 6px",
  "color:#2e9e44;background:#0a3a16;border-radius:0 4px 4px 0;padding:2px 6px"
);

/* ---------------------------------- icone ---------------------------------- */
const ICON = {
  logo: `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="8" width="15" height="9" rx="2"/><line x1="20.5" y1="11" x2="20.5" y2="14"/><path d="M11.5 9.5 L8.8 13 h2.2 L10 16"/></svg>`,
  warn: `<span class="warn-i"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17.3" r="0.4" fill="currentColor"/></svg></span>`,
  google: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12a8 8 0 0 1 8-8"/><path d="M12 4a8 8 0 0 1 8 8"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>`,
  alexa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>`,
  push: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M10.5 20a2 2 0 0 0 3 0"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>`,
  chev: `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
  sliders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><circle cx="10" cy="9" r="2.3" fill="var(--card-background-color,#fff)"/><circle cx="15" cy="15" r="2.3" fill="var(--card-background-color,#fff)"/></svg>`,
};

/* --- suffissi entity_id generati dal component (robusti al rinominare device) --- */
const SUF = {
  sensor: ["sensor", "_batterie_scariche"],
  threshold: ["number", "_soglia_alert_batteria"],
  sw_google: ["switch", "_notifica_google"],
  sw_alexa: ["switch", "_notifica_alexa"],
  sw_push: ["switch", "_notifica_push"],
  t_start: ["time", "_orario_inizio_notifiche"],
  t_end: ["time", "_orario_fine_notifiche"],
};

/* ----------------------------------- stile --------------------------------- */
const STYLES = `
:host{
  --ccb-good: var(--success-color, #2fa84f);
  --ccb-warn: var(--warning-color, #e0920a);
  --ccb-crit: var(--error-color, #e5484d);
  --ccb-accent: var(--domhouse-accent, #2e9e44);
  --ccb-muted: var(--secondary-text-color, #6b7a72);
  --ccb-track: var(--secondary-background-color, #f1f3f2);
  --ccb-edge: var(--divider-color, #d8ded9);
}
ha-card{ overflow:hidden; }
.head{ display:flex; align-items:center; gap:12px; padding:16px 16px 12px; }
.logo{ width:38px;height:38px;border-radius:10px;flex:none;display:grid;place-items:center;background:linear-gradient(145deg,var(--ccb-accent),#0a3a16);box-shadow:inset 0 1px 0 rgba(255,255,255,.25); }
.logo svg{ width:22px;height:22px; }
.titles{ display:flex;flex-direction:column;min-width:0; }
.titles h1{ margin:0;font-size:16px;font-weight:700;letter-spacing:-.01em;line-height:1.2;color:var(--primary-text-color); }
.titles span{ font-size:12px;color:var(--ccb-muted);font-weight:500; }
.pill{ margin-left:auto;display:inline-flex;align-items:center;gap:7px;padding:6px 11px;border-radius:999px;font-size:12.5px;font-weight:600;white-space:nowrap; }
.pill .dot{ width:8px;height:8px;border-radius:50%; }
.pill.ok{ color:var(--ccb-good);background:color-mix(in srgb,var(--ccb-good) 15%,transparent); }
.pill.ok .dot{ background:var(--ccb-good); }
.pill.bad{ color:var(--ccb-crit);background:color-mix(in srgb,var(--ccb-crit) 15%,transparent); }
.pill.bad .dot{ background:var(--ccb-crit); }
.summary{ display:flex;gap:8px;padding:0 16px 14px;flex-wrap:wrap; }
.stat{ display:flex;align-items:baseline;gap:6px;background:var(--ccb-track);border-radius:9px;padding:7px 11px; }
.stat b{ font-weight:700;font-size:15px;font-variant-numeric:tabular-nums;color:var(--primary-text-color); }
.stat small{ font-size:11px;color:var(--ccb-muted); }
.divider{ height:1px;background:var(--divider-color);margin:0 16px; }
.list{ display:flex;flex-direction:column;padding:8px; }
.row{ display:flex;align-items:center;gap:12px;padding:9px 8px;border-radius:10px;cursor:pointer; }
.row:hover{ background:color-mix(in srgb,var(--primary-text-color) 5%,transparent); }
.row.low{ background:color-mix(in srgb,var(--ccb-crit) 10%,transparent); }
.row .name{ font-size:14px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--primary-text-color); }
.row .pct{ font-weight:600;font-size:14px;min-width:46px;text-align:right;font-variant-numeric:tabular-nums;color:var(--primary-text-color); }
.warn-i{ color:var(--ccb-crit);display:inline-flex; }
.batt-h{ position:relative;width:62px;height:24px;flex:none;border:2px solid var(--ccb-edge);border-radius:5px;padding:2.5px; }
.batt-h::after{ content:"";position:absolute;right:-5px;top:50%;transform:translateY(-50%);width:3px;height:10px;background:var(--ccb-edge);border-radius:0 2px 2px 0; }
.batt-h .fill{ display:block;height:100%;border-radius:2.5px;transition:width .35s ease,background .2s; }
.grid{ display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:10px;padding:12px; }
.tile{ display:flex;flex-direction:column;align-items:center;gap:7px;padding:14px 8px 12px;border-radius:12px;border:1px solid var(--divider-color);background:color-mix(in srgb,var(--ccb-track) 55%,transparent);cursor:pointer; }
.tile.low{ background:color-mix(in srgb,var(--ccb-crit) 10%,transparent);border-color:color-mix(in srgb,var(--ccb-crit) 32%,var(--divider-color)); }
.batt-v{ position:relative;width:40px;height:72px;border:2px solid var(--ccb-edge);border-radius:7px;padding:3px;display:flex;align-items:flex-end; }
.batt-v::before{ content:"";position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:16px;height:4px;background:var(--ccb-edge);border-radius:2px 2px 0 0; }
.batt-v .fill{ display:block;width:100%;border-radius:3px;transition:height .35s ease,background .2s; }
.tile .name{ font-size:12.5px;font-weight:500;text-align:center;color:var(--primary-text-color); }
.tile .pct{ font-weight:600;font-size:14px;display:flex;align-items:center;gap:4px;color:var(--primary-text-color); }
.legend{ display:flex;gap:14px;flex-wrap:wrap;padding:2px 18px 6px; }
.legend span{ font-size:11.5px;color:var(--ccb-muted);display:inline-flex;align-items:center;gap:6px; }
.legend i{ width:9px;height:9px;border-radius:50%; }
.foldhead{ list-style:none;display:flex;align-items:center;gap:10px;padding:13px 16px;cursor:pointer;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ccb-muted); }
.foldhead::-webkit-details-marker{ display:none; }
.foldhead>svg{ width:18px;height:18px;flex:none; }
.foldhead .chev{ margin-left:auto;transition:transform .2s; }
details[open] .foldhead .chev{ transform:rotate(180deg); }
.settings{ display:flex;flex-direction:column;gap:14px;padding:4px 16px 16px; }
.srow{ display:flex;flex-direction:column;gap:7px; }
.srow>.lbl{ font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ccb-muted); }
.seg{ display:inline-flex;background:var(--ccb-track);border-radius:9px;padding:3px;gap:2px;align-self:flex-start; }
.seg button{ font:inherit;font-size:13px;font-weight:500;cursor:pointer;border:0;background:transparent;color:var(--ccb-muted);padding:5px 12px;border-radius:7px;line-height:1; }
.seg button[aria-pressed="true"]{ background:var(--card-background-color,#fff);color:var(--primary-text-color);box-shadow:0 1px 2px rgba(0,0,0,.12); }
.slider{ display:flex;align-items:center;gap:10px; }
.slider input[type=range]{ flex:1;accent-color:var(--ccb-accent); }
.slider b{ font-weight:600;min-width:42px;text-align:right;font-variant-numeric:tabular-nums;color:var(--primary-text-color); }
.chans{ display:flex;gap:8px;flex-wrap:wrap; }
.chan{ display:inline-flex;align-items:center;gap:8px;padding:6px 10px 6px 8px;border-radius:999px;background:var(--ccb-track);cursor:pointer;user-select:none; }
.chan svg{ width:16px;height:16px;color:var(--ccb-muted); }
.chan .cl{ font-size:12.5px;font-weight:500;color:var(--primary-text-color); }
.sw{ width:34px;height:20px;border-radius:999px;background:color-mix(in srgb,var(--ccb-muted) 45%,transparent);position:relative;transition:background .18s;flex:none; }
.sw::after{ content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3);transition:transform .18s; }
.chan[aria-checked="true"] .sw{ background:var(--ccb-accent); }
.chan[aria-checked="true"] .sw::after{ transform:translateX(14px); }
.window{ display:inline-flex;align-items:center;gap:7px;font-size:13px;color:var(--ccb-muted);cursor:pointer;align-self:flex-start; }
.window svg{ width:15px;height:15px; }
.window b{ font-weight:600;color:var(--primary-text-color);font-variant-numeric:tabular-nums; }
.empty{ padding:26px 16px;text-align:center;color:var(--ccb-muted);font-size:13px; }
:focus-visible{ outline:2px solid var(--ccb-accent);outline-offset:2px;border-radius:8px; }
@media (prefers-reduced-motion: reduce){ *{ transition:none!important; } }
`;

/* ----------------------------------- card ---------------------------------- */
class DomHouseBatteryCard extends HTMLElement {
  static getConfigElement() { return document.createElement("domhouse-battery-card-editor"); }

  static getStubConfig(hass) {
    const dev = Object.values(hass.devices || {}).find((d) =>
      (d.identifiers || []).some((i) => i[0] === CCB_DOMAIN)
    );
    return dev ? { device: dev.id } : {};
  }

  setConfig(config) {
    if (!config) throw new Error("Configurazione mancante");
    this._cfg = {
      device: config.device || null,
      title: config.title ?? "Centro Controllo Batterie",
      subtitle: config.subtitle ?? "DomHouse.it",
      layout: config.layout === "grid" ? "grid" : "list",
      layout_toggle: config.layout_toggle ?? true,
      show_legend: config.show_legend ?? true,
      collapsible: config.collapsible ?? true,
      collapsed: config.collapsed ?? true,
      accent: config.accent || null,
      // override manuali opzionali (uso avanzato / senza integrazione)
      sensor: config.sensor || null,
      entities: config.entities || null,
      threshold_entity: config.threshold_entity || null,
      switch_google: config.switch_google || null,
      switch_alexa: config.switch_alexa || null,
      switch_push: config.switch_push || null,
      time_start: config.time_start || null,
      time_end: config.time_end || null,
    };
    this._layout = this._restoreLayout() || this._cfg.layout;
    this._built = false;
    if (this._hass) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._cfg) return;
    this._ids = this._resolve();
    if (!this._built) { this._render(); return; }
    const sig = this._signature();
    if (sig !== this._sig) { this._sig = sig; this._update(); }
  }

  /* ------------------------------ risoluzione ids --------------------------- */
  _resolve() {
    const c = this._cfg;
    const pick = (key) => c[key] || null;
    let ids = {
      sensor: pick("sensor"),
      threshold_entity: pick("threshold_entity"),
      switch_google: pick("switch_google"),
      switch_alexa: pick("switch_alexa"),
      switch_push: pick("switch_push"),
      time_start: pick("time_start"),
      time_end: pick("time_end"),
    };
    if (c.device && this._hass && this._hass.entities) {
      const ents = Object.values(this._hass.entities).filter((e) => e.device_id === c.device);
      const find = ([domain, suffix]) => {
        const e = ents.find((x) => x.entity_id.startsWith(domain + ".") && x.entity_id.endsWith(suffix));
        return e ? e.entity_id : null;
      };
      ids = {
        sensor: ids.sensor || find(SUF.sensor),
        threshold_entity: ids.threshold_entity || find(SUF.threshold),
        switch_google: ids.switch_google || find(SUF.sw_google),
        switch_alexa: ids.switch_alexa || find(SUF.sw_alexa),
        switch_push: ids.switch_push || find(SUF.sw_push),
        time_start: ids.time_start || find(SUF.t_start),
        time_end: ids.time_end || find(SUF.t_end),
      };
    }
    return ids;
  }

  /* -------------------------------- helpers -------------------------------- */
  _esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  _$(id) { return this._root.getElementById(id); }

  _threshold() {
    const e = this._ids && this._ids.threshold_entity;
    if (e && this._hass.states[e]) { const v = Number(this._hass.states[e].state); if (!isNaN(v)) return Math.round(v); }
    return Number(this._cfg.threshold ?? 20);
  }

  _status(lvl) {
    // Fasce colore FISSE: 1-30 rosso, 31-60 arancione, 61-100 verde
    if (lvl <= 30) return "crit";
    if (lvl <= 60) return "warn";
    return "good";
  }

  _batteries() {
    const ids = this._ids || {};
    // Modalità integrazione: elenco completo dall'attributo del sensore
    if (ids.sensor && this._hass.states[ids.sensor]) {
      const attr = this._hass.states[ids.sensor].attributes.batterie_tutte;
      if (Array.isArray(attr)) {
        return attr
          .map((b) => {
            const level = b.level === null || b.level === undefined ? null : Math.round(Number(b.level));
            return { entity: b.entity_id, name: b.name || b.entity_id, level, status: level == null ? "na" : this._status(level) };
          })
          .sort((a, b) => (a.level == null) - (b.level == null) || (a.level ?? 999) - (b.level ?? 999));
      }
    }
    // Fallback manuale: lista entità in config
    const out = [];
    for (const it of (this._cfg.entities || [])) {
      const id = typeof it === "string" ? it : it.entity;
      const st = this._hass.states[id];
      const name = (typeof it === "object" && it.name) || (st && st.attributes.friendly_name) || id;
      if (!st || ["unavailable", "unknown"].includes(st.state)) { out.push({ entity: id, name, level: null, status: "na" }); continue; }
      const lvl = Math.round(Number(st.state));
      if (isNaN(lvl)) { out.push({ entity: id, name, level: null, status: "na" }); continue; }
      out.push({ entity: id, name, level: lvl, status: this._status(lvl) });
    }
    out.sort((a, b) => (a.level == null) - (b.level == null) || (a.level ?? 999) - (b.level ?? 999));
    return out;
  }

  _signature() {
    const h = this._hass, ids = this._ids || {}, p = ["lay:" + this._layout];
    if (ids.sensor) {
      const st = h.states[ids.sensor];
      p.push("s:" + (st && st.state));
      const a = st && st.attributes.batterie_tutte;
      if (Array.isArray(a)) p.push("b:" + a.map((x) => x.entity_id + "=" + x.level).join(","));
    }
    for (const k of ["threshold_entity", "switch_google", "switch_alexa", "switch_push", "time_start", "time_end"]) {
      const e = ids[k]; if (e) { const st = h.states[e]; p.push(k + ":" + (st && st.state)); }
    }
    for (const it of (this._cfg.entities || [])) { const id = typeof it === "string" ? it : it.entity; const st = h.states[id]; p.push(id + ":" + (st && st.state)); }
    return p.join("|");
  }

  _restoreLayout() { try { return localStorage.getItem("ccb-layout:" + (this._cfg.device || this._cfg.title || "")); } catch (e) { return null; } }
  _saveLayout() { try { localStorage.setItem("ccb-layout:" + (this._cfg.device || this._cfg.title || ""), this._layout); } catch (e) {} }
  _moreInfo(entityId) { if (!entityId) return; this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true })); }

  /* --------------------------------- render -------------------------------- */
  _chanHTML(key, label, svg, entity) {
    if (!entity) return "";
    return `<div class="chan" role="switch" tabindex="0" aria-checked="false" data-ch="${key}" data-entity="${entity}"><span class="sw"></span>${svg}<span class="cl">${label}</span></div>`;
  }

  _settingsHTML() {
    const ids = this._ids || {};
    const rows = [];
    if (this._cfg.layout_toggle)
      rows.push(`<div class="srow"><span class="lbl">Layout</span><div class="seg" id="seg"><button type="button" data-l="list">Lista</button><button type="button" data-l="grid">Griglia</button></div></div>`);
    if (ids.threshold_entity)
      rows.push(`<div class="srow"><span class="lbl">Soglia allarme</span><div class="slider"><input type="range" id="thr" min="1" max="100" step="1"><b id="thrv">—</b></div></div>`);
    const chans = this._chanHTML("google", "Google", ICON.google, ids.switch_google)
      + this._chanHTML("alexa", "Alexa", ICON.alexa, ids.switch_alexa)
      + this._chanHTML("push", "Push", ICON.push, ids.switch_push);
    if (chans) rows.push(`<div class="srow"><span class="lbl">Notifiche</span><div class="chans" id="chans">${chans}</div></div>`);
    if (ids.time_start && ids.time_end)
      rows.push(`<div class="window" id="win">${ICON.clock}<b id="winv">--:-- – --:--</b></div>`);
    return rows.length ? `<div class="settings">${rows.join("")}</div>` : "";
  }

  _skeleton() {
    const settings = this._settingsHTML();
    let block = "";
    if (settings) {
      block = this._cfg.collapsible
        ? `<div class="divider"></div><details class="fold"${this._cfg.collapsed ? "" : " open"}><summary class="foldhead">${ICON.sliders}<span>Impostazioni e notifiche</span>${ICON.chev}</summary>${settings}</details>`
        : `<div class="divider"></div>${settings}`;
    }
    const legend = this._cfg.show_legend
      ? `<div class="legend"><span><i style="background:var(--ccb-crit)"></i>Scarica 1–30%</span><span><i style="background:var(--ccb-warn)"></i>In calo 31–60%</span><span><i style="background:var(--ccb-good)"></i>Carica 61–100%</span></div>`
      : "";
    return `<ha-card>
      <div class="head"><div class="logo">${ICON.logo}</div><div class="titles"><h1>${this._esc(this._cfg.title)}</h1><span>${this._esc(this._cfg.subtitle)}</span></div><div class="pill ok" id="pill"><span class="dot"></span><span id="pillt"></span></div></div>
      <div class="summary"><div class="stat"><b id="sTot">0</b><small>monitorate</small></div><div class="stat"><b id="sLow">0</b><small>scariche</small></div><div class="stat"><b id="sThr">—</b><small>soglia</small></div></div>
      <div class="divider"></div>
      <div id="body"></div>
      ${legend}
      ${block}
    </ha-card>`;
  }

  _render() {
    if (!this._root) this._root = this.attachShadow({ mode: "open" });
    this._ids = this._resolve();
    if (this._cfg.accent) this.style.setProperty("--domhouse-accent", this._cfg.accent);
    this._root.innerHTML = `<style>${STYLES}</style>` + this._skeleton();
    this._attach();
    this._built = true;
    this._sig = null;
    if (this._hass) { this._sig = this._signature(); this._update(); }
  }

  _attach() {
    const seg = this._$("seg");
    if (seg) seg.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { this._layout = b.dataset.l; this._saveLayout(); this._update(); } });

    const thr = this._$("thr");
    if (thr) {
      thr.addEventListener("input", () => { this._dragging = true; this._$("thrv").textContent = thr.value + "%"; });
      thr.addEventListener("change", () => { this._dragging = false; const e = this._ids.threshold_entity; if (e && this._hass) this._hass.callService("number", "set_value", { entity_id: e, value: Number(thr.value) }); });
    }

    const chans = this._$("chans");
    if (chans) {
      const toggle = (c) => this._hass && this._hass.callService("switch", "toggle", { entity_id: c.dataset.entity });
      chans.addEventListener("click", (e) => { const c = e.target.closest(".chan"); if (c) toggle(c); });
      chans.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { const c = e.target.closest(".chan"); if (c) { e.preventDefault(); toggle(c); } } });
    }

    const win = this._$("win");
    if (win) win.addEventListener("click", () => this._moreInfo(this._ids.time_start));

    const body = this._$("body");
    body.addEventListener("click", (e) => { const el = e.target.closest("[data-entity]"); if (el) this._moreInfo(el.dataset.entity); });
  }

  _bodyHTML(bats) {
    const color = { crit: "var(--ccb-crit)", warn: "var(--ccb-warn)", good: "var(--ccb-good)", na: "var(--ccb-edge)" };
    if (this._layout === "grid") {
      return `<div class="grid">` + bats.map((b) => {
        const pct = b.level == null ? "—" : b.level + "%";
        const h = b.level == null ? 0 : Math.max(b.level, 5);
        return `<div class="tile ${b.status === "crit" ? "low" : ""}" data-entity="${b.entity}"><span class="batt-v"><span class="fill" style="height:${h}%;background:${color[b.status]}"></span></span><span class="name">${this._esc(b.name)}</span><span class="pct">${b.status === "crit" ? ICON.warn : ""}${pct}</span></div>`;
      }).join("") + `</div>`;
    }
    return `<div class="list">` + bats.map((b) => {
      const pct = b.level == null ? "—" : b.level + "%";
      const w = b.level == null ? 0 : Math.max(b.level, 4);
      return `<div class="row ${b.status === "crit" ? "low" : ""}" data-entity="${b.entity}"><span class="name">${this._esc(b.name)}</span>${b.status === "crit" ? ICON.warn : ""}<span class="batt-h"><span class="fill" style="width:${w}%;background:${color[b.status]}"></span></span><span class="pct">${pct}</span></div>`;
    }).join("") + `</div>`;
  }

  _update() {
    if (!this._hass || !this._built) return;
    const bats = this._batteries();
    const low = bats.filter((b) => b.status === "crit").length;

    this._$("sTot").textContent = bats.length;
    this._$("sLow").textContent = low;
    this._$("sThr").textContent = this._threshold() + "%";

    const pill = this._$("pill"), pt = this._$("pillt");
    if (low > 0) { pill.className = "pill bad"; pt.textContent = low + (low === 1 ? " scarica" : " scariche"); }
    else { pill.className = "pill ok"; pt.textContent = "Tutte cariche"; }

    const emptyMsg = this._cfg.device
      ? "Nessuna batteria: controlla i sensori nel component"
      : "Seleziona il dispositivo Centro Controllo Batterie";
    this._$("body").innerHTML = bats.length ? this._bodyHTML(bats) : `<div class="empty">${emptyMsg}</div>`;

    const seg = this._$("seg");
    if (seg) seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.l === this._layout)));

    const thr = this._$("thr");
    if (thr && this._ids.threshold_entity) {
      const st = this._hass.states[this._ids.threshold_entity];
      if (st && !this._dragging) {
        const a = st.attributes;
        thr.min = a.min ?? 1; thr.max = a.max ?? 100; thr.step = a.step ?? 1; thr.value = st.state;
        this._$("thrv").textContent = Math.round(Number(st.state)) + "%";
      }
    }

    ["google", "alexa", "push"].forEach((k) => {
      const el = this._root.querySelector(`.chan[data-ch="${k}"]`);
      if (el) { const st = this._hass.states[el.dataset.entity]; el.setAttribute("aria-checked", String(!!st && st.state === "on")); }
    });

    const win = this._$("winv");
    if (win) {
      const f = (e) => { const s = this._hass.states[e]; return s && s.state ? String(s.state).slice(0, 5) : "--:--"; };
      win.textContent = `${f(this._ids.time_start)} – ${f(this._ids.time_end)}`;
    }
  }

  getCardSize() {
    const n = (this._ids && this._ids.sensor && this._hass && this._hass.states[this._ids.sensor]
      && (this._hass.states[this._ids.sensor].attributes.batterie_tutte || []).length) || 4;
    return 2 + (this._layout === "grid" ? Math.ceil(n / 3) * 2 : n);
  }
}

customElements.define("domhouse-battery-card", DomHouseBatteryCard);

/* --------------------------------- editor ---------------------------------- */
const LABELS = {
  device: "Dispositivo Centro Controllo Batterie",
  title: "Titolo",
  subtitle: "Sottotitolo",
  layout: "Layout predefinito",
  layout_toggle: "Mostra selettore Lista/Griglia",
  show_legend: "Mostra legenda",
  collapsible: "Impostazioni a scomparsa",
  collapsed: "Chiusa di default",
};

const SCHEMA = [
  { name: "device", selector: { device: { integration: CCB_DOMAIN } } },
  { name: "title", selector: { text: {} } },
  { type: "expandable", title: "Aspetto", schema: [
    { name: "layout", selector: { select: { mode: "dropdown", options: [ { value: "list", label: "Lista" }, { value: "grid", label: "Griglia" } ] } } },
    { name: "layout_toggle", selector: { boolean: {} } },
    { name: "show_legend", selector: { boolean: {} } },
    { name: "collapsible", selector: { boolean: {} } },
    { name: "collapsed", selector: { boolean: {} } },
  ] },
];

class DomHouseBatteryCardEditor extends HTMLElement {
  setConfig(config) { this._config = config; this._render(); }
  set hass(hass) { this._hass = hass; if (this._form) this._form.hass = hass; }

  _render() {
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => LABELS[s.name] || s.name;
      this._form.addEventListener("value-changed", (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent("config-changed", {
          detail: { config: { type: "custom:domhouse-battery-card", ...e.detail.value } },
          bubbles: true, composed: true,
        }));
      });
      this.appendChild(this._form);
      this._attr = document.createElement("div");
      this._attr.style.cssText = "text-align:center;padding:14px 0 2px;font-size:12px;color:var(--secondary-text-color);";
      this._attr.innerHTML = `Salvatore Lentini · <a href="https://www.domhouse.it" target="_blank" rel="noopener noreferrer" style="color:var(--primary-color);text-decoration:none;">DomHouse.it</a> · v${CARD_VERSION}`;
      this.appendChild(this._attr);
    }
    this._form.schema = SCHEMA;
    this._form.data = this._config;
    if (this._hass) this._form.hass = this._hass;
  }
}

customElements.define("domhouse-battery-card-editor", DomHouseBatteryCardEditor);

/* ----------------------------- registro schede ----------------------------- */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "domhouse-battery-card",
  name: "DomHouse Battery Card",
  description: "Centro Controllo Batterie — si auto-configura dal dispositivo (DomHouse.it)",
  preview: true,
  documentationURL: "https://github.com/SalvatoreITA/domhouse-battery-card",
});
