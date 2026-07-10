console.log("GeoEventos v1.9 carregado");
const BAIRROS_URL = "bairros-diadema.geojson?v=1.9";
const DATA_URL = "https://script.google.com/macros/s/AKfycbxBp7RUuULIm7Kbus-lIsogGKLZ78cgr_YIWBh2xX9hRCCPglTOnO2_DLQJqE-x6jih/exec";

const map = L.map("map").setView([-23.6865, -46.6234], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

const markersLayer = L.markerClusterGroup();
const streetSegmentsLayer = L.layerGroup().addTo(map);
const routeEditorLayers = new L.FeatureGroup().addTo(map);
let routeDrawHandler = null;
let heatLayer = null;
let heatActive = false;
let allEvents = [];
let selectedCalendarDate = null;
let mayorAgendaOnly = false;
let selectedNeighborhood = "";
let selectedRouteEvent=null, routeLayerSequence=[];
let bairrosActive = false;
let bairrosGeoJsonData = null;
let bairrosLayer = null;
const nowForCalendar = new Date();
let calendarYear = nowForCalendar.getFullYear();
let calendarMonth = nowForCalendar.getMonth();

const statusBox = document.getElementById("statusBox");
const searchInput = document.getElementById("searchInput");
const dateFilter = document.getElementById("dateFilter");
const regionFilter = document.getElementById("regionFilter");
const secretariaFilter = document.getElementById("secretariaFilter");
const routeEditorBtn=document.getElementById("routeEditorBtn"),routeEditorPanel=document.getElementById("routeEditorPanel"),closeRouteEditorBtn=document.getElementById("closeRouteEditorBtn"),routeEventSelect=document.getElementById("routeEventSelect"),routeEditorCode=document.getElementById("routeEditorCode"),startRouteDrawBtn=document.getElementById("startRouteDrawBtn"),removeLastRouteBtn=document.getElementById("removeLastRouteBtn"),clearRoutesBtn=document.getElementById("clearRoutesBtn"),saveRoutesBtn=document.getElementById("saveRoutesBtn"),routeEditorStatus=document.getElementById("routeEditorStatus");
const mayorAgendaBtn = document.getElementById("mayorAgendaBtn");
const dashboardBtn = document.getElementById("dashboardBtn");
const dashboardPanel = document.getElementById("dashboardPanel");
const closeDashboardBtn = document.getElementById("closeDashboardBtn");
const dashboardShowAllBtn = document.getElementById("dashboardShowAllBtn");
const metricToday = document.getElementById("metricToday");
const metricWeek = document.getElementById("metricWeek");
const metricMonth = document.getElementById("metricMonth");
const metricMayor = document.getElementById("metricMayor");
const metricRecurring = document.getElementById("metricRecurring");
const metricRegions = document.getElementById("metricRegions");
const regionRanking = document.getElementById("regionRanking");
const secretariaRanking = document.getElementById("secretariaRanking");
const regionTotalLabel = document.getElementById("regionTotalLabel");
const secretariaTotalLabel = document.getElementById("secretariaTotalLabel");
const dashboardUpdated = document.getElementById("dashboardUpdated");
const calendarBtn = document.getElementById("calendarBtn");
const calendarPanel = document.getElementById("calendarPanel");
const calendarTitle = document.getElementById("calendarTitle");
const calendarGrid = document.getElementById("calendarGrid");
const calendarSelection = document.getElementById("calendarSelection");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");
const closeCalendarBtn = document.getElementById("closeCalendarBtn");
const clearCalendarDateBtn = document.getElementById("clearCalendarDateBtn");
const todayBtn = document.getElementById("todayBtn");
const bairrosBtn = document.getElementById("bairrosBtn");
const onlyEventsBtn = document.getElementById("onlyEventsBtn");
const bairrosLegend = document.getElementById("bairrosLegend");
const heatBtn = document.getElementById("heatBtn");

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseCoordinate(value) { const text=String(value??"").replace(",", ".").trim(); if(!text)return null; const parsed=Number(text); return Number.isFinite(parsed)?parsed:null; }

function parseDateBR(value) {
  if (!value) return null;

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date(text + "T00:00:00");
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [day, month, year] = text.split("/");
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sameDay(a, b) {
  return Boolean(
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function inNextDays(date, days) {
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  limit.setHours(23, 59, 59, 999);

  return date >= today && date <= limit;
}

function getWeight(evento) {
  const prioridade = normalize(evento.prioridade);

  if (prioridade.includes("muito alta")) return 8;
  if (prioridade === "alta") return 5;
  if (prioridade === "media") return 3;

  const publico = Number(evento.publicoEstimado || 0);
  if (publico >= 1000) return 6;
  if (publico >= 500) return 4;
  if (publico >= 100) return 2;

  return 1;
}

function getCategory(evento) {
  return normalize(evento.categoria || evento.tipoEvento);
}

function createIcon(evento) {
  const category = getCategory(evento);

  let pinClass = "pin-evento";
  let symbol = "●";

  if (category.includes("agenda prefeito")) {
    pinClass = "pin-agenda";
    symbol = "★";
  } else if (category.includes("recorrente")) {
    pinClass = "pin-recorrente";
    symbol = "↻";
  }

  return L.divIcon({
    className: "",
    html: `<div class="custom-pin ${pinClass}"><span>${symbol}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32]
  });
}



function getEventRoutes(evento){if(!Array.isArray(evento.percursos))return[];return evento.percursos.map(p=>({grupo:Number(p.grupo||0),points:Array.isArray(p.pontos)?p.pontos.map(x=>{const lat=parseCoordinate(x.latitude),lng=parseCoordinate(x.longitude);return lat===null||lng===null?null:[lat,lng]}).filter(Boolean):[]})).filter(p=>p.points.length>=2).sort((x,y)=>x.grupo-y.grupo)}
function getEventPosition(evento){const lat=parseCoordinate(evento.latitude),lng=parseCoordinate(evento.longitude);if(lat!==null&&lng!==null)return[lat,lng];const r=getEventRoutes(evento),pts=r.flatMap(x=>x.points);if(!pts.length)return null;return[pts.reduce((s,p)=>s+p[0],0)/pts.length,pts.reduce((s,p)=>s+p[1],0)/pts.length]}
function hasStreetSegments(evento){return getEventRoutes(evento).length>0}
function streetSegmentKey(evento,r){return[evento.origemRegistro||"",evento.idBase||evento.id||"",r.grupo,r.points.map(p=>p.join(",")).join(";")].join("|")}

function buildDestination(evento) {
  const position = getEventPosition(evento);

  if (position) {
    return `${position[0]},${position[1]}`;
  }

  return [
    evento.local,
    evento.endereco,
    evento.bairro,
    "Diadema - SP"
  ]
    .filter(Boolean)
    .join(", ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPopup(evento) {
  const destino = buildDestination(evento);
  const linkComoChegar =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(destino) +
    "&travelmode=driving";

  const categoria = evento.categoria || evento.tipoEvento || "Evento";
  const enderecoCompleto = [
    evento.local,
    evento.endereco,
    evento.bairro,
    evento.regiao
  ]
    .filter(Boolean)
    .join(", ");

  return `
    <div class="event-popup">
      <div class="popup-badge">${escapeHtml(categoria)}</div>
      <h3 class="popup-title">${escapeHtml(evento.evento || "Evento")}</h3>

      <div class="popup-row">
        <span>📅</span>
        <div><span class="popup-label">Data:</span> ${escapeHtml(evento.data || "-")}</div>
      </div>

      <div class="popup-row">
        <span>🕒</span>
        <div><span class="popup-label">Horário:</span> ${escapeHtml(evento.horaInicio || "-")} às ${escapeHtml(evento.horaFim || "-")}</div>
      </div>

      <div class="popup-row">
        <span>📍</span>
        <div><span class="popup-label">Local:</span> ${escapeHtml(evento.local || evento.endereco || "-")}</div>
      </div>

      <div class="popup-row">
        <span>🏘️</span>
        <div><span class="popup-label">Bairro/Região:</span> ${escapeHtml(evento.bairro || "-")} / ${escapeHtml(evento.regiao || "-")}</div>
      </div>

      <div class="popup-row">
        <span>🏛️</span>
        <div><span class="popup-label">Secretaria:</span> ${escapeHtml(evento.secretariaResponsavel || evento.secretaria || "-")}</div>
      </div>

      <div class="popup-row">
        <span>👥</span>
        <div><span class="popup-label">Público estimado:</span> ${escapeHtml(evento.publicoEstimado || "-")}</div>
      </div>

      <div class="popup-row">
        <span>✅</span>
        <div><span class="popup-label">Status:</span> ${escapeHtml(evento.status || "-")}</div>
      </div>


      ${
        hasStreetSegments(evento)
          ? `
            <div class="segment-info">
              <strong>🛣️ Área ocupada pela atividade</strong><br>
              <span class="segment-count-badge">
                ${getEventRoutes(evento).length} rua(s) ou trecho(s)
              </span>
            </div>
          `
          : ""
      }

      <div class="popup-actions">
        <a
          class="como-chegar-btn"
          href="${linkComoChegar}"
          target="_blank"
          rel="noopener noreferrer"
        >
          🚗 Como chegar
        </a>

        <button
          type="button"
          class="copiar-endereco-btn"
          data-address="${escapeHtml(enderecoCompleto)}"
          onclick="copyAddress(this)"
        >
          📋 Copiar endereço
        </button>
      </div>
    </div>
  `;
}

window.copyAddress = async function(button) {
  const address = button.dataset.address || "";

  if (!address) {
    button.textContent = "Endereço não informado";
    return;
  }

  try {
    await navigator.clipboard.writeText(address);
    const original = button.textContent;
    button.textContent = "✅ Endereço copiado";

    setTimeout(() => {
      button.textContent = original;
    }, 1800);
  } catch (error) {
    window.prompt("Copie o endereço:", address);
  }
};





function uniqueRecurringEvents(){const m=new Map();allEvents.forEach(e=>{if(!getCategory(e).includes("recorrente"))return;const id=String(e.idBase??"").trim();if(id&&!m.has(id))m.set(id,e)});return[...m.values()].sort((a,b)=>String(a.evento||"").localeCompare(String(b.evento||""),"pt-BR"))}
function fillRouteEventSelect(){routeEventSelect.innerHTML='<option value="">Selecione uma feira</option>';uniqueRecurringEvents().forEach(e=>{const o=document.createElement("option");o.value=String(e.idBase);o.textContent=`${e.idBase} — ${e.evento}`;routeEventSelect.appendChild(o)})}
function setRouteEditorStatus(msg,type=""){routeEditorStatus.textContent=msg;routeEditorStatus.className="route-editor-status"+(type?` ${type}`:"")}
function clearRouteEditorLayers(){routeEditorLayers.clearLayers();routeLayerSequence=[]}
function addRouteEditorLayer(latlngs){const l=L.polyline(latlngs,{color:"#126d9c",weight:7,opacity:.9,lineCap:"round",lineJoin:"round"}).addTo(routeEditorLayers);routeLayerSequence.push(l);return l}
function loadSelectedEventRoutes(){clearRouteEditorLayers();selectedRouteEvent=uniqueRecurringEvents().find(e=>String(e.idBase)===String(routeEventSelect.value))||null;if(!selectedRouteEvent){setRouteEditorStatus("Selecione uma feira para começar.");return}getEventRoutes(selectedRouteEvent).forEach(r=>addRouteEditorLayer(r.points));if(routeLayerSequence.length)map.fitBounds(L.featureGroup(routeLayerSequence).getBounds().pad(.2),{maxZoom:18});setRouteEditorStatus(routeLayerSequence.length?`${routeLayerSequence.length} trecho(s) carregado(s). Limpe para redesenhar.`:"Nenhum percurso. Clique em Desenhar nova rua.")}
function openRouteEditor(){closeDashboard();closeCalendar();routeEditorPanel.classList.add("open");routeEditorPanel.setAttribute("aria-hidden","false");routeEditorBtn.classList.add("active");fillRouteEventSelect();loadSelectedEventRoutes()}
function closeRouteEditor(){if(routeDrawHandler){routeDrawHandler.disable();routeDrawHandler=null}routeEditorPanel.classList.remove("open");routeEditorPanel.setAttribute("aria-hidden","true");routeEditorBtn.classList.remove("active")}
function startRouteDrawing(){if(!selectedRouteEvent){setRouteEditorStatus("Selecione uma feira primeiro.","error");return}routeDrawHandler=new L.Draw.Polyline(map,{shapeOptions:{color:"#126d9c",weight:7,opacity:.9},showLength:true,metric:true});routeDrawHandler.enable();setRouteEditorStatus("Clique no começo, nas curvas e no fim. Clique no último ponto para concluir.")}
function serializeRoutes(){return routeLayerSequence.map((l,i)=>({grupo:i+1,pontos:l.getLatLngs().map((p,j)=>({ordem:j+1,latitude:p.lat,longitude:p.lng}))}))}
async function saveRoutes(){if(!selectedRouteEvent)return setRouteEditorStatus("Selecione uma feira.","error");if(!routeEditorCode.value.trim())return setRouteEditorStatus("Informe o código de edição.","error");const percursos=serializeRoutes();if(!percursos.length)return setRouteEditorStatus("Desenhe pelo menos uma rua.","error");saveRoutesBtn.disabled=true;setRouteEditorStatus("Salvando percurso...");try{const body=new URLSearchParams({acao:"salvarPercurso",codigo:routeEditorCode.value.trim(),origem:"Eventos Recorrentes",idEvento:String(selectedRouteEvent.idBase),percursos:JSON.stringify(percursos)});const response=await fetch(DATA_URL,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body});const result=await response.json();if(!result.sucesso)throw new Error(result.erro||"Não foi possível salvar");setRouteEditorStatus(`Salvo: ${result.trechos} rua(s), ${result.pontos} ponto(s).`,"success");await loadEvents();routeEventSelect.value=String(selectedRouteEvent.idBase);loadSelectedEventRoutes()}catch(e){setRouteEditorStatus(`Erro: ${e.message}`,"error")}finally{saveRoutesBtn.disabled=false}}

function bairroColor(count) {
  if (count >= 13) return "#d64545";
  if (count >= 8) return "#f4a261";
  if (count >= 4) return "#ffd966";
  if (count >= 1) return "#63be7b";
  return "#dfe4ea";
}

function bairroCounts(events) {
  const counts = new Map();

  events.forEach((evento) => {
    const bairro = normalize(evento.bairro);
    if (!bairro) return;
    counts.set(bairro, (counts.get(bairro) || 0) + 1);
  });

  return counts;
}

function bairroStats(events, bairroName) {
  const key = normalize(bairroName);

  const bairroEvents = events.filter(
    (evento) => normalize(evento.bairro) === key
  );

  return {
    total: bairroEvents.length,
    recurring: bairroEvents.filter((evento) =>
      getCategory(evento).includes("recorrente")
    ).length,
    mayor: bairroEvents.filter((evento) =>
      getCategory(evento).includes("agenda prefeito")
    ).length,
    secretarias: new Set(
      bairroEvents
        .map(
          (evento) =>
            evento.secretariaResponsavel || evento.secretaria || ""
        )
        .filter(Boolean)
    ).size
  };
}

function buildBairroPopup(bairroName, events) {
  const stats = bairroStats(events, bairroName);
  const safeName = escapeHtml(bairroName);
  const jsName = String(bairroName).replaceAll("\\", "\\\\").replaceAll("'", "\\'");

  return `
    <div class="bairro-popup">
      <h3>${safeName}</h3>

      <div class="bairro-stats">
        <div class="bairro-stat">
          <span>📅 Eventos</span>
          <strong>${stats.total}</strong>
        </div>

        <div class="bairro-stat">
          <span>👔 Agenda do Prefeito</span>
          <strong>${stats.mayor}</strong>
        </div>

        <div class="bairro-stat">
          <span>🔁 Eventos recorrentes</span>
          <strong>${stats.recurring}</strong>
        </div>

        <div class="bairro-stat">
          <span>🏛️ Secretarias</span>
          <strong>${stats.secretarias}</strong>
        </div>
      </div>

      <button
        type="button"
        class="bairro-filter-btn"
        onclick="filterNeighborhood('${jsName}')"
      >
        Ver somente este bairro
      </button>
    </div>
  `;
}

function renderBairrosLayer(events) {
  if (bairrosLayer) {
    map.removeLayer(bairrosLayer);
    bairrosLayer = null;
  }

  if (!bairrosActive || !bairrosGeoJsonData) {
    bairrosLegend.hidden = true;
    return;
  }

  const counts = bairroCounts(events);

  bairrosLayer = L.geoJSON(bairrosGeoJsonData, {
    style(feature) {
      const bairroName = feature?.properties?.bairro || "";
      const count = counts.get(normalize(bairroName)) || 0;

      return {
        color: "#23374d",
        weight: selectedNeighborhood &&
          normalize(selectedNeighborhood) === normalize(bairroName)
          ? 4
          : 1.5,
        opacity: 0.82,
        fillColor: bairroColor(count),
        fillOpacity: 0.56
      };
    },

    onEachFeature(feature, layer) {
      const bairroName = feature?.properties?.bairro || "Bairro";

      layer.bindTooltip(bairroName, {
        sticky: true,
        direction: "top",
        className: "bairro-tooltip"
      });

      layer.bindPopup(buildBairroPopup(bairroName, events), {
        maxWidth: 300
      });

      layer.on({
        mouseover(event) {
          event.target.setStyle({
            weight: 3,
            color: "#0b2f6b",
            fillOpacity: 0.7
          });
        },

        mouseout(event) {
          bairrosLayer.resetStyle(event.target);
        }
      });
    }
  }).addTo(map);

  bairrosLayer.bringToBack();
  bairrosLegend.hidden = false;
}

function updateTerritorialButtons() {
  bairrosBtn.classList.toggle("active", bairrosActive);
  bairrosBtn.textContent = bairrosActive
    ? "🗺️ Ocultar bairros"
    : "🗺️ Mostrar bairros";

  onlyEventsBtn.classList.toggle(
    "active",
    !bairrosActive && !heatActive
  );
}

window.filterNeighborhood = function filterNeighborhood(bairroName) {
  selectedNeighborhood = bairroName;
  mayorAgendaOnly = false;
  searchInput.value = "";
  dateFilter.value = "todos";
  regionFilter.value = "";
  secretariaFilter.value = "";
  selectedCalendarDate = null;

  updateMayorAgendaButton();
  todayBtn.classList.remove("active");
  todayBtn.textContent = "📅 O que tem hoje?";
  calendarSelection.textContent =
    `Mostrando somente eventos de ${bairroName}.`;

  renderCalendar();
  renderMap();
};

function showOnlyEvents() {
  bairrosActive = false;
  heatActive = false;
  selectedNeighborhood = "";

  heatBtn.classList.remove("active");
  heatBtn.textContent = "🔥 Mapa de Calor";

  updateTerritorialButtons();
  renderMap();
}

function updateMayorAgendaButton() {
  mayorAgendaBtn.classList.toggle("active", mayorAgendaOnly);
  mayorAgendaBtn.textContent = mayorAgendaOnly
    ? "↩️ Voltar para todos os eventos"
    : "👔 Agenda do Prefeito";
}

function showMayorAgenda() {
  selectedNeighborhood = "";
  mayorAgendaOnly = true;

  // Limpa filtros que poderiam esconder compromissos da agenda.
  searchInput.value = "";
  dateFilter.value = "todos";
  regionFilter.value = "";
  secretariaFilter.value = "";
  selectedCalendarDate = null;

  todayBtn.classList.remove("active");
  todayBtn.textContent = "📅 O que tem hoje?";
  calendarSelection.textContent = "Clique em uma data para filtrar o mapa.";

  closeDashboard();
  closeCalendar();
  updateMayorAgendaButton();
  renderCalendar();
  renderMap();
}

function showAllEvents() {
  mayorAgendaOnly = false;
  updateMayorAgendaButton();
  renderMap();
}

function countBy(items, getKey) {
  const counts = new Map();

  items.forEach((item) => {
    const rawKey = getKey(item);
    const key = String(rawKey || "").trim();

    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "pt-BR"));
}

function renderRanking(container, data, limit = 8) {
  container.innerHTML = "";

  if (!data.length) {
    const empty = document.createElement("div");
    empty.className = "ranking-empty";
    empty.textContent = "Nenhum dado disponível.";
    container.appendChild(empty);
    return;
  }

  const shown = data.slice(0, limit);
  const maxValue = Math.max(...shown.map((item) => item.value), 1);

  shown.forEach((item) => {
    const row = document.createElement("div");
    row.className = "ranking-item";

    const name = document.createElement("span");
    name.className = "ranking-name";
    name.title = item.name;
    name.textContent = item.name;

    const track = document.createElement("div");
    track.className = "ranking-track";

    const bar = document.createElement("div");
    bar.className = "ranking-bar";
    bar.style.width = `${Math.max((item.value / maxValue) * 100, 4)}%`;
    track.appendChild(bar);

    const value = document.createElement("span");
    value.className = "ranking-value";
    value.textContent = item.value;

    row.append(name, track, value);
    container.appendChild(row);
  });
}

function updateDashboard() {
  const today = new Date();

  const todayCount = allEvents.filter((evento) =>
    sameDay(parseDateBR(evento.data), today)
  ).length;

  const weekCount = allEvents.filter((evento) =>
    inNextDays(parseDateBR(evento.data), 7)
  ).length;

  const monthCount = allEvents.filter((evento) =>
    inNextDays(parseDateBR(evento.data), 30)
  ).length;

  const mayorCount = allEvents.filter((evento) =>
    getCategory(evento).includes("agenda prefeito")
  ).length;

  const recurringCount = allEvents.filter((evento) =>
    getCategory(evento).includes("recorrente")
  ).length;

  const uniqueRegions = new Set(
    allEvents.map((evento) => String(evento.regiao || "").trim()).filter(Boolean)
  );

  metricToday.textContent = todayCount;
  metricWeek.textContent = weekCount;
  metricMonth.textContent = monthCount;
  metricMayor.textContent = mayorCount;
  metricRecurring.textContent = recurringCount;
  metricRegions.textContent = uniqueRegions.size;

  const byRegion = countBy(allEvents, (evento) => evento.regiao);
  const bySecretaria = countBy(
    allEvents,
    (evento) => evento.secretariaResponsavel || evento.secretaria
  );

  renderRanking(regionRanking, byRegion);
  renderRanking(secretariaRanking, bySecretaria);

  regionTotalLabel.textContent = `${allEvents.length} registros`;
  secretariaTotalLabel.textContent = `${allEvents.length} registros`;

  dashboardUpdated.textContent =
    `Atualizado em ${new Date().toLocaleString("pt-BR")}.`;
}

function openDashboard() {
  closeCalendar();
  dashboardPanel.classList.add("open");
  dashboardPanel.setAttribute("aria-hidden", "false");
  dashboardBtn.classList.add("active");
  updateDashboard();
}

function closeDashboard() {
  dashboardPanel.classList.remove("open");
  dashboardPanel.setAttribute("aria-hidden", "true");
  dashboardBtn.classList.remove("active");
}

function dateKey(date) {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function eventCountsByDate() {
  const counts = new Map();

  allEvents.forEach((evento) => {
    const parsedDate = parseDateBR(evento.data);
    if (!parsedDate) return;

    const key = dateKey(parsedDate);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return counts;
}

function countClass(count) {
  if (count >= 8) return "many";
  if (count >= 4) return "medium";
  return "few";
}

function renderCalendar() {
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
  const today = new Date();
  const counts = eventCountsByDate();

  calendarTitle.textContent = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(firstDay);

  calendarGrid.innerHTML = "";

  // Converte domingo=0 para calendário começando na segunda.
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;

  for (let i = 0; i < leadingEmptyDays; i += 1) {
    const empty = document.createElement("div");
    empty.className = "calendar-empty-day";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(calendarYear, calendarMonth, day);
    const key = dateKey(date);
    const count = counts.get(key) || 0;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.dataset.date = key;
    button.setAttribute(
      "aria-label",
      `${formatLongDate(date)}: ${count} evento(s)`
    );

    if (sameDay(date, today)) {
      button.classList.add("today");
    }

    if (selectedCalendarDate && sameDay(date, selectedCalendarDate)) {
      button.classList.add("selected");
    }

    const number = document.createElement("span");
    number.className = "calendar-day-number";
    number.textContent = day;
    button.appendChild(number);

    if (count > 0) {
      const countBadge = document.createElement("span");
      countBadge.className = `calendar-event-count ${countClass(count)}`;
      countBadge.textContent = count;
      button.appendChild(countBadge);
    }

    button.addEventListener("click", () => {
      mayorAgendaOnly = false;
      updateMayorAgendaButton();
      selectedCalendarDate = date;
      dateFilter.value = "todos";

      todayBtn.classList.remove("active");
      todayBtn.textContent = "📅 O que tem hoje?";

      calendarSelection.textContent =
        `${formatLongDate(date)} — ${count} evento(s) cadastrado(s).`;

      renderCalendar();
      renderMap();
    });

    calendarGrid.appendChild(button);
  }
}

function openCalendar() {
  closeDashboard();
  calendarPanel.classList.add("open");
  calendarPanel.setAttribute("aria-hidden", "false");
  calendarBtn.classList.add("active");
  renderCalendar();
}

function closeCalendar() {
  calendarPanel.classList.remove("open");
  calendarPanel.setAttribute("aria-hidden", "true");
  calendarBtn.classList.remove("active");
}

function fillSelects(events) {
  const regioes = [...new Set(events.map((item) => item.regiao).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));

  const secretarias = [
    ...new Set(
      events
        .map((item) => item.secretariaResponsavel || item.secretaria)
        .filter(Boolean)
    )
  ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));

  regionFilter.innerHTML = '<option value="">Todas as regiões</option>';
  secretariaFilter.innerHTML =
    '<option value="">Todas as secretarias</option>';

  regioes.forEach((regiao) => {
    const option = document.createElement("option");
    option.value = regiao;
    option.textContent = regiao;
    regionFilter.appendChild(option);
  });

  secretarias.forEach((secretaria) => {
    const option = document.createElement("option");
    option.value = secretaria;
    option.textContent = secretaria;
    secretariaFilter.appendChild(option);
  });
}

function filterEvents() {
  const search = normalize(searchInput.value);
  const dateMode = dateFilter.value;
  const regiao = normalize(regionFilter.value);
  const secretaria = normalize(secretariaFilter.value);
  const today = new Date();

  return allEvents.filter((evento) => {
    if (
      selectedNeighborhood &&
      normalize(evento.bairro) !== normalize(selectedNeighborhood)
    ) {
      return false;
    }

    if (
      mayorAgendaOnly &&
      !getCategory(evento).includes("agenda prefeito")
    ) {
      return false;
    }
    const eventDate = parseDateBR(evento.data);

    if (
      selectedCalendarDate &&
      !sameDay(eventDate, selectedCalendarDate)
    ) {
      return false;
    }

    const searchableText = normalize(
      [
        evento.evento,
        evento.tipoEvento,
        evento.categoria,
        evento.bairro,
        evento.regiao,
        evento.endereco,
        evento.local,
        evento.secretariaResponsavel,
        evento.secretaria
      ].join(" ")
    );

    if (search && !searchableText.includes(search)) return false;
    if (regiao && normalize(evento.regiao) !== regiao) return false;

    const eventSecretary = normalize(
      evento.secretariaResponsavel || evento.secretaria
    );

    if (secretaria && eventSecretary !== secretaria) return false;

    if (dateMode === "hoje" && !sameDay(eventDate, today)) return false;

    if (dateMode === "amanha") {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (!sameDay(eventDate, tomorrow)) return false;
    }

    if (dateMode === "semana" && !inNextDays(eventDate, 7)) return false;
    if (dateMode === "mes" && !inNextDays(eventDate, 30)) return false;

    return true;
  });
}



function renderStreetSegments(events){streetSegmentsLayer.clearLayers();const seen=new Set();let total=0;events.forEach(evento=>getEventRoutes(evento).forEach(route=>{const key=streetSegmentKey(evento,route);if(!key||seen.has(key))return;seen.add(key);const line=L.polyline(route.points,{color:"#27864a",weight:9,opacity:.82,lineCap:"round",lineJoin:"round"}).bindPopup(buildPopup(evento),{maxWidth:350}).bindTooltip(`${evento.evento||"Evento"} — trecho ${route.grupo}`,{sticky:true,direction:"top",className:"street-segment-label"});line.on("mouseover",()=>line.setStyle({color:"#145c31",weight:12,opacity:.95}));line.on("mouseout",()=>line.setStyle({color:"#27864a",weight:9,opacity:.82}));line.addTo(streetSegmentsLayer);total++}));return total}

function renderMap() {
  const events = filterEvents();

  markersLayer.clearLayers();

  if (heatLayer) {
    map.removeLayer(heatLayer);
    heatLayer = null;
  }

  const heatPoints = [];
  const validMarkers = [];
  const segmentCount = renderStreetSegments(events);

  events.forEach((evento) => {
    const position = getEventPosition(evento);

    if (!position) return;

    const [lat, lng] = position;

    const marker = L.marker([lat, lng], {
      icon: createIcon(evento)
    }).bindPopup(buildPopup(evento), {
      maxWidth: 330
    });

    markersLayer.addLayer(marker);
    validMarkers.push(marker);
    heatPoints.push([lat, lng, getWeight(evento)]);
  });

  if (!map.hasLayer(markersLayer)) {
    map.addLayer(markersLayer);
  }

  if (heatActive && heatPoints.length) {
    heatLayer = L.heatLayer(heatPoints, {
      radius: 38,
      blur: 28,
      maxZoom: 17,
      minOpacity: 0.35
    }).addTo(map);
  }

  renderBairrosLayer(events);
  updateTerritorialButtons();

  if (mayorAgendaOnly && events.length === 0) {
    statusBox.textContent = "Nenhum compromisso cadastrado na Agenda do Prefeito.";
  } else if (selectedCalendarDate && events.length === 0) {
    statusBox.textContent =
      `Nenhum evento cadastrado em ${selectedCalendarDate.toLocaleDateString("pt-BR")}.`;
  } else if (dateFilter.value === "hoje" && events.length === 0) {
    statusBox.textContent = "Nenhum evento cadastrado para hoje.";
  } else {
    statusBox.textContent =
      `${events.length} evento(s) encontrado(s) · ` +
      `${validMarkers.length} ponto(s) · ` +
      `${segmentCount} trecho(s) de rua`;
  }

  if (validMarkers.length > 0) {
    const group = L.featureGroup(validMarkers);
    map.fitBounds(group.getBounds().pad(0.16), {
      maxZoom: 16
    });
  } else if (selectedNeighborhood && bairrosLayer) {
    bairrosLayer.eachLayer((layer) => {
      const bairroName = layer.feature?.properties?.bairro || "";
      if (normalize(bairroName) === normalize(selectedNeighborhood)) {
        map.fitBounds(layer.getBounds().pad(0.08), {
          maxZoom: 15
        });
      }
    });
  }
}

async function loadEvents() {
  try {
    statusBox.textContent = "Carregando eventos...";

    const response = await fetch(DATA_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("A resposta do Apps Script não é uma lista de eventos.");
    }

    allEvents = data;

    try {
      const bairrosResponse = await fetch(BAIRROS_URL, {
        cache: "no-store"
      });

      if (!bairrosResponse.ok) {
        throw new Error(`Erro ao carregar bairros: HTTP ${bairrosResponse.status}`);
      }

      bairrosGeoJsonData = await bairrosResponse.json();
    } catch (bairrosError) {
      console.error(bairrosError);
      bairrosGeoJsonData = null;
    }

    fillSelects(allEvents);
    fillRouteEventSelect();
    updateMayorAgendaButton();
    updateTerritorialButtons();
    renderCalendar();
    updateDashboard();
    renderMap();
  } catch (error) {
    console.error(error);
    statusBox.textContent =
      "Erro ao carregar eventos. Verifique a planilha e o Apps Script.";
  }
}

map.on(L.Draw.Event.CREATED,e=>{if(e.layerType!=="polyline")return;addRouteEditorLayer(e.layer.getLatLngs());routeDrawHandler=null;setRouteEditorStatus(`${routeLayerSequence.length} rua(s) desenhada(s). Desenhe outra ou salve.`)});
routeEditorBtn.addEventListener("click",()=>routeEditorPanel.classList.contains("open")?closeRouteEditor():openRouteEditor());closeRouteEditorBtn.addEventListener("click",closeRouteEditor);routeEventSelect.addEventListener("change",loadSelectedEventRoutes);startRouteDrawBtn.addEventListener("click",startRouteDrawing);removeLastRouteBtn.addEventListener("click",()=>{const l=routeLayerSequence.pop();if(l){routeEditorLayers.removeLayer(l);setRouteEditorStatus(`${routeLayerSequence.length} trecho(s) permanecem.`)}else setRouteEditorStatus("Não há trecho para remover.","error")});clearRoutesBtn.addEventListener("click",()=>{clearRouteEditorLayers();setRouteEditorStatus("Desenho limpo.")});saveRoutesBtn.addEventListener("click",saveRoutes);

searchInput.addEventListener("input", renderMap);
dateFilter.addEventListener("change", () => {
  mayorAgendaOnly = false;
  updateMayorAgendaButton();
  selectedCalendarDate = null;
  calendarSelection.textContent = "Clique em uma data para filtrar o mapa.";
  renderCalendar();

  todayBtn.classList.toggle("active", dateFilter.value === "hoje");
  todayBtn.textContent =
    dateFilter.value === "hoje"
      ? "✅ Mostrando eventos de hoje"
      : "📅 O que tem hoje?";
  renderMap();
});
regionFilter.addEventListener("change", renderMap);
secretariaFilter.addEventListener("change", renderMap);




mayorAgendaBtn.addEventListener("click", () => {
  if (mayorAgendaOnly) {
    showAllEvents();
  } else {
    showMayorAgenda();
  }
});

dashboardBtn.addEventListener("click", () => {
  if (dashboardPanel.classList.contains("open")) {
    closeDashboard();
    closeRouteEditor();
  } else {
    openDashboard();
  }
});

closeDashboardBtn.addEventListener("click", closeDashboard);

dashboardShowAllBtn.addEventListener("click", () => {
  searchInput.value = "";
  dateFilter.value = "todos";
  regionFilter.value = "";
  secretariaFilter.value = "";
  selectedCalendarDate = null;
  selectedNeighborhood = "";
  mayorAgendaOnly = false;
  updateMayorAgendaButton();
  todayBtn.classList.remove("active");
  todayBtn.textContent = "📅 O que tem hoje?";
  closeDashboard();
  renderCalendar();
  renderMap();
});

calendarBtn.addEventListener("click", () => {
  if (calendarPanel.classList.contains("open")) {
    closeCalendar();
  } else {
    openCalendar();
  }
});

closeCalendarBtn.addEventListener("click", closeCalendar);

prevMonthBtn.addEventListener("click", () => {
  calendarMonth -= 1;

  if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear -= 1;
  }

  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  calendarMonth += 1;

  if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear += 1;
  }

  renderCalendar();
});

clearCalendarDateBtn.addEventListener("click", () => {
  selectedCalendarDate = null;
  dateFilter.value = "todos";
  todayBtn.classList.remove("active");
  todayBtn.textContent = "📅 O que tem hoje?";
  calendarSelection.textContent = "Mostrando eventos de todas as datas.";
  renderCalendar();
  renderMap();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCalendar();
    closeDashboard();
    closeRouteEditor();
  }
});

todayBtn.addEventListener("click", () => {
  mayorAgendaOnly = false;
  updateMayorAgendaButton();
  selectedCalendarDate = null;
  calendarSelection.textContent = "Clique em uma data para filtrar o mapa.";
  renderCalendar();

  const showingToday = dateFilter.value === "hoje";

  if (showingToday) {
    dateFilter.value = "todos";
    todayBtn.classList.remove("active");
    todayBtn.textContent = "📅 O que tem hoje?";
  } else {
    dateFilter.value = "hoje";
    todayBtn.classList.add("active");
    todayBtn.textContent = "✅ Mostrando eventos de hoje";
  }

  renderMap();
});


bairrosBtn.addEventListener("click", () => {
  bairrosActive = !bairrosActive;
  updateTerritorialButtons();
  renderMap();
});

onlyEventsBtn.addEventListener("click", showOnlyEvents);

heatBtn.addEventListener("click", () => {
  heatActive = !heatActive;
  heatBtn.classList.toggle("active", heatActive);
  heatBtn.textContent = heatActive
    ? "🔥 Desligar Mapa de Calor"
    : "🔥 Mapa de Calor";
  updateTerritorialButtons();
  renderMap();
});

loadEvents();
