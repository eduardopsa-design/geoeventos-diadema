console.log("GeoDiadema 2.1 carregado");
const BAIRROS_URL = "bairros-diadema.geojson?v=1.9";
const DATA_URL = "https://script.google.com/macros/s/AKfycbxBp7RUuULIm7Kbus-lIsogGKLZ78cgr_YIWBh2xX9hRCCPglTOnO2_DLQJqE-x6jih/exec";

const map = L.map("map").setView([-23.6865, -46.6234], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

const markersLayer = L.markerClusterGroup();
const hortasLayer = L.markerClusterGroup();
const streetSegmentsLayer = L.layerGroup().addTo(map);
const routeEditorLayers = new L.FeatureGroup().addTo(map);
const fairLocationAssistLayer = new L.FeatureGroup().addTo(map);
let routeDrawHandler = null;
let heatLayer = null;
let heatActive = false;
let allEvents = [];
let allHortas = [];
let hortasActive = false;
let eventsActive = true;
let gabineteResults = [];
let gabineteSelectedIds = new Set();
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
const hortasBtn = document.getElementById("hortasBtn");
const exploreBtn = document.getElementById("exploreBtn");
const explorePanel = document.getElementById("explorePanel");
const closeExploreBtn = document.getElementById("closeExploreBtn");
const exploreBackdrop = document.getElementById("exploreBackdrop");
const exploreEventsToggle = document.getElementById("exploreEventsToggle");
const exploreHortasToggle = document.getElementById("exploreHortasToggle");
const exploreAgendaBtn = document.getElementById("exploreAgendaBtn");
const exploreEventsCount = document.getElementById("exploreEventsCount");
const exploreAgendaCount = document.getElementById("exploreAgendaCount");
const exploreHortasCount = document.getElementById("exploreHortasCount");
const exploreSummaryText = document.getElementById("exploreSummaryText");
const moreToolsBtn = document.getElementById("moreToolsBtn");
const advancedToolbar = document.getElementById("advancedToolbar");

const gabineteBtn = document.getElementById("gabineteBtn");
const gabinetePanel = document.getElementById("gabinetePanel");
const closeGabineteBtn = document.getElementById("closeGabineteBtn");
const gabineteBackdrop = document.getElementById("gabineteBackdrop");
const gabineteQueryStep = document.getElementById("gabineteQueryStep");
const gabineteResultsStep = document.getElementById("gabineteResultsStep");
const gabineteLocationType = document.getElementById("gabineteLocationType");
const gabineteLocationValue = document.getElementById("gabineteLocationValue");
const gabineteDate = document.getElementById("gabineteDate");
const gabinetePeriod = document.getElementById("gabinetePeriod");
const gabineteCustomTime = document.getElementById("gabineteCustomTime");
const gabineteStartTime = document.getElementById("gabineteStartTime");
const gabineteEndTime = document.getElementById("gabineteEndTime");
const gabineteSearchBtn = document.getElementById("gabineteSearchBtn");
const gabineteQueryStatus = document.getElementById("gabineteQueryStatus");
const gabineteResultTitle = document.getElementById("gabineteResultTitle");
const gabineteResultSubtitle = document.getElementById("gabineteResultSubtitle");
const gabineteNewQueryBtn = document.getElementById("gabineteNewQueryBtn");
const gabineteEventsSummary = document.getElementById("gabineteEventsSummary");
const gabineteHortasSummary = document.getElementById("gabineteHortasSummary");
const gabineteSelectAllBtn = document.getElementById("gabineteSelectAllBtn");
const gabineteClearSelectionBtn = document.getElementById("gabineteClearSelectionBtn");
const gabineteSort = document.getElementById("gabineteSort");
const gabineteItemsList = document.getElementById("gabineteItemsList");
const gabineteBriefingTitle = document.getElementById("gabineteBriefingTitle");
const gabineteBriefingObjective = document.getElementById("gabineteBriefingObjective");
const gabineteBriefingNotes = document.getElementById("gabineteBriefingNotes");
const gabineteSelectionBar = document.getElementById("gabineteSelectionBar");
const gabineteSelectedCount = document.getElementById("gabineteSelectedCount");
const gabinetePreviewBtn = document.getElementById("gabinetePreviewBtn");
const gabinetePreview = document.getElementById("gabinetePreview");
const gabinetePreviewDocument = document.getElementById("gabinetePreviewDocument");
const closeGabinetePreviewBtn = document.getElementById("closeGabinetePreviewBtn");
const printGabinetePreviewBtn = document.getElementById("printGabinetePreviewBtn");
const routeEditorBtn=document.getElementById("routeEditorBtn"),routeEditorPanel=document.getElementById("routeEditorPanel"),closeRouteEditorBtn=document.getElementById("closeRouteEditorBtn"),routeEventSelect=document.getElementById("routeEventSelect"),routeEditorCode=document.getElementById("routeEditorCode"),routeRegistrationStatus=document.getElementById("routeRegistrationStatus"),routeMainActions=document.getElementById("routeMainActions"),routeDrawingActions=document.getElementById("routeDrawingActions"),createRouteBtn=document.getElementById("createRouteBtn"),editRouteBtn=document.getElementById("editRouteBtn"),deleteRouteBtn=document.getElementById("deleteRouteBtn"),cancelRouteEditBtn=document.getElementById("cancelRouteEditBtn"),startRouteDrawBtn=document.getElementById("startRouteDrawBtn"),finishRouteDrawBtn=document.getElementById("finishRouteDrawBtn"),undoRoutePointBtn=document.getElementById("undoRoutePointBtn"),removeLastRouteBtn=document.getElementById("removeLastRouteBtn"),clearRoutesBtn=document.getElementById("clearRoutesBtn"),saveRoutesBtn=document.getElementById("saveRoutesBtn"),routeEditorStatus=document.getElementById("routeEditorStatus"),routeCounter=document.getElementById("routeCounter"),fairBasePanel=document.getElementById("fairBasePanel"),fairBaseName=document.getElementById("fairBaseName"),fairBaseSchedule=document.getElementById("fairBaseSchedule"),fairSegmentsList=document.getElementById("fairSegmentsList"),fairProgressText=document.getElementById("fairProgressText"),fairProgressBar=document.getElementById("fairProgressBar"),manualFairMarkers=document.getElementById("manualFairMarkers"),markFairStartBtn=document.getElementById("markFairStartBtn"),markFairEndBtn=document.getElementById("markFairEndBtn"),clearFairMarkersBtn=document.getElementById("clearFairMarkersBtn");
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




function getHortaTypeClass(tipo) {
  const normalized = normalize(tipo);

  if (normalized.includes("comunit")) return "horta-comunitaria";
  if (normalized.includes("escolar")) return "horta-escolar";
  if (normalized.includes("institucional")) return "horta-institucional";

  return "horta-outro";
}

function createHortaIcon(horta) {
  return L.divIcon({
    className: "",
    html: `<div class="horta-pin ${getHortaTypeClass(horta.tipo)}"><span>🌱</span></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -35]
  });
}

function getHortaPosition(horta) {
  const lat = parseCoordinate(horta.latitude);
  const lng = parseCoordinate(horta.longitude);

  if (lat === null || lng === null) return null;
  return [lat, lng];
}

function buildHortaPopup(horta) {
  const position = getHortaPosition(horta);
  const destino = position
    ? `${position[0]},${position[1]}`
    : [horta.endereco, horta.bairro, "Diadema - SP"].filter(Boolean).join(", ");

  const linkComoChegar =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(destino) +
    "&travelmode=driving";

  return `
    <div class="horta-popup">
      <div class="popup-badge">🌱 ${escapeHtml(horta.tipo || "Horta")}</div>
      <h3 class="popup-title">${escapeHtml(horta.nome || "Horta")}</h3>

      <div class="popup-row">
        <span>📊</span>
        <div><span class="popup-label">Status:</span> ${escapeHtml(horta.status || "-")}</div>
      </div>

      <div class="popup-row">
        <span>🏘️</span>
        <div><span class="popup-label">Bairro/Região:</span> ${escapeHtml(horta.bairro || "-")} / ${escapeHtml(horta.regiao || "-")}</div>
      </div>

      <div class="popup-row">
        <span>📍</span>
        <div><span class="popup-label">Endereço:</span> ${escapeHtml(horta.endereco || "-")}</div>
      </div>

      ${horta.observacoes ? `
        <div class="popup-row">
          <span>📝</span>
          <div><span class="popup-label">Observações:</span> ${escapeHtml(horta.observacoes)}</div>
        </div>
      ` : ""}

      <a
        class="popup-action"
        href="${linkComoChegar}"
        target="_blank"
        rel="noopener noreferrer"
      >🚗 Como chegar</a>
    </div>
  `;
}

function filterHortas() {
  if (!hortasActive) return [];

  const search = normalize(searchInput.value);
  const regiao = normalize(regionFilter.value);

  return allHortas.filter((horta) => {
    const searchableText = normalize(
      [
        horta.nome,
        horta.tipo,
        horta.status,
        horta.regiao,
        horta.bairro,
        horta.endereco,
        horta.observacoes
      ].join(" ")
    );

    if (search && !searchableText.includes(search)) return false;
    if (regiao && normalize(horta.regiao) !== regiao) return false;

    return true;
  });
}

function renderHortasLayer() {
  hortasLayer.clearLayers();

  if (!hortasActive) {
    if (map.hasLayer(hortasLayer)) {
      map.removeLayer(hortasLayer);
    }
    return [];
  }

  const hortas = filterHortas();
  const markers = [];

  hortas.forEach((horta) => {
    const position = getHortaPosition(horta);
    if (!position) return;

    const marker = L.marker(position, {
      icon: createHortaIcon(horta)
    }).bindPopup(buildHortaPopup(horta), {
      maxWidth: 330
    });

    hortasLayer.addLayer(marker);
    markers.push(marker);
  });

  if (!map.hasLayer(hortasLayer)) {
    map.addLayer(hortasLayer);
  }

  return markers;
}

function updateHortasButton() {
  hortasBtn.classList.toggle("active", hortasActive);
  hortasBtn.textContent = hortasActive
    ? "🌱 Ocultar hortas"
    : "🌱 Hortas";
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

function getFairBase(evento){
  return evento&&evento.feiraBase&&typeof evento.feiraBase==="object"
    ?evento.feiraBase
    :null
}

function getFairSegments(evento){
  const base=getFairBase(evento);
  return base&&Array.isArray(base.trechos)
    ?base.trechos.filter(Boolean)
    :[]
}

function getDiademaBounds(){
  if(bairrosGeoJsonData){
    try{
      return L.geoJSON(bairrosGeoJsonData).getBounds()
    }catch(error){
      console.warn("Não foi possível calcular os limites dos bairros.",error)
    }
  }

  return L.latLngBounds(
    L.latLng(-23.735,-46.675),
    L.latLng(-23.635,-46.565)
  )
}

function parseOfficialFairSegment(text){
  const cleaned=String(text||"")
    .replace(/\s+/g," ")
    .trim();

  const numbers=[...cleaned.matchAll(/\d+/g)].map(match=>({
    value:match[0],
    index:match.index
  }));

  if(numbers.length<2){
    return null
  }

  const first=numbers[0];
  const last=numbers[numbers.length-1];

  let street=cleaned.slice(0,first.index)
    .replace(/[,;\s]*(n[º°o.]*)?\s*$/i,"")
    .trim();

  street=street.replace(/[,\s]+$/,"").trim();

  if(!street){
    return null
  }

  return{
    street,
    startNumber:first.value,
    endNumber:last.value
  }
}

async function geocodeInDiadema(street,number){
  const bounds=getDiademaBounds();
  const west=bounds.getWest();
  const north=bounds.getNorth();
  const east=bounds.getEast();
  const south=bounds.getSouth();

  const params=new URLSearchParams({
    q:`${street}, ${number}, Diadema, SP, Brasil`,
    format:"jsonv2",
    addressdetails:"1",
    limit:"5",
    countrycodes:"br",
    bounded:"1",
    viewbox:`${west},${north},${east},${south}`
  });

  const response=await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers:{
        "Accept":"application/json",
        "Accept-Language":"pt-BR"
      }
    }
  );

  if(!response.ok){
    throw new Error(`Serviço de localização indisponível (HTTP ${response.status}).`)
  }

  const results=await response.json();

  const valid=results
    .map(item=>({
      lat:Number(item.lat),
      lng:Number(item.lon),
      label:item.display_name||""
    }))
    .find(item=>
      Number.isFinite(item.lat)&&
      Number.isFinite(item.lng)&&
      bounds.contains([item.lat,item.lng])
    );

  if(!valid){
    throw new Error(`O número ${number} não foi encontrado dentro de Diadema.`)
  }

  return valid
}

function makeFairSearchIcon(letter,type){
  return L.divIcon({
    className:"",
    html:`<div class="fair-search-marker ${type}">${letter}</div>`,
    iconSize:[28,28],
    iconAnchor:[14,14]
  })
}


function distanceMeters(pointA,pointB){
  if(!pointA||!pointB)return Infinity;
  return map.distance(
    L.latLng(pointA.lat,pointA.lng),
    L.latLng(pointB.lat,pointB.lng)
  )
}

function updateManualFairMarkerButtons(){
  markFairStartBtn.classList.toggle("active",manualFairMarkerMode==="start");
  markFairEndBtn.classList.toggle("active",manualFairMarkerMode==="end")
}

function drawManualFairMarkers(){
  fairLocationAssistLayer.clearLayers();

  if(manualFairStartPoint){
    L.marker(
      [manualFairStartPoint.lat,manualFairStartPoint.lng],
      {icon:makeFairSearchIcon("A","start"),interactive:false}
    ).addTo(fairLocationAssistLayer)
  }

  if(manualFairEndPoint){
    L.marker(
      [manualFairEndPoint.lat,manualFairEndPoint.lng],
      {icon:makeFairSearchIcon("B","end"),interactive:false}
    ).addTo(fairLocationAssistLayer)
  }

  if(manualFairStartPoint&&manualFairEndPoint){
    L.polyline(
      [
        [manualFairStartPoint.lat,manualFairStartPoint.lng],
        [manualFairEndPoint.lat,manualFairEndPoint.lng]
      ],
      {
        color:"#126d9c",
        weight:4,
        opacity:.75,
        dashArray:"9 7",
        interactive:false
      }
    ).addTo(fairLocationAssistLayer);

    map.fitBounds(
      L.latLngBounds(
        [manualFairStartPoint.lat,manualFairStartPoint.lng],
        [manualFairEndPoint.lat,manualFairEndPoint.lng]
      ).pad(.35),
      {maxZoom:19}
    );

    setRouteEditorStatus(
      "Marcadores A e B definidos. Agora crie ou edite o percurso e desenhe seguindo a rua.",
      "success"
    )
  }
}

function enableManualFairMarkers(centerPoint=null){
  manualFairMarkers.hidden=false;
  manualFairMarkerMode="start";
  manualFairStartPoint=null;
  manualFairEndPoint=null;
  updateManualFairMarkerButtons();

  if(centerPoint){
    map.setView([centerPoint.lat,centerPoint.lng],18)
  }

  setRouteEditorStatus(
    "Clique no mapa para marcar o início A. Depois marque o fim B.",
    "error"
  )
}

function clearFairLocationAssist(){
  fairLocationAssistLayer.clearLayers();
  locatedFairSegmentIndex=null;
  manualFairMarkerMode=null;
  manualFairStartPoint=null;
  manualFairEndPoint=null;
  manualFairMarkers.hidden=!selectedRouteEvent;
  updateManualFairMarkerButtons()
}

async function locateFairSegment(index,address,button){
  const parsed=parseOfficialFairSegment(address);

  if(!parsed){
    setRouteEditorStatus(
      "Não consegui interpretar esse trecho. Use o formato: Rua X nº 10 ao nº 200.",
      "error"
    );
    return
  }

  button.disabled=true;
  button.textContent="Localizando...";
  setRouteEditorStatus(`Procurando ${parsed.street}, do nº ${parsed.startNumber} ao nº ${parsed.endNumber}...`);

  try{
    const [startPoint,endPoint]=await Promise.all([
      geocodeInDiadema(parsed.street,parsed.startNumber),
      geocodeInDiadema(parsed.street,parsed.endNumber)
    ]);

    const separation=distanceMeters(startPoint,endPoint);

    clearFairLocationAssist();
    locatedFairSegmentIndex=index;

    document.querySelectorAll(".fair-segment-card").forEach((card,cardIndex)=>{
      card.classList.toggle("located",cardIndex===index)
    });

    if(separation<25){
      button.textContent="⚠ Marcar manualmente";
      enableManualFairMarkers(startPoint);
      return
    }

    manualFairStartPoint=startPoint;
    manualFairEndPoint=endPoint;
    drawManualFairMarkers();
    manualFairMarkers.hidden=false;
    button.textContent="✔ Trecho localizado";

    setRouteEditorStatus(
      "Marcadores A e B encontrados dentro de Diadema. Agora clique em “Criar percurso” ou “Editar percurso” e desenhe seguindo a rua.",
      "success"
    )
  }catch(error){
    console.error(error);
    button.textContent="📍 Localizar trecho";
    setRouteEditorStatus(error.message,"error")
  }finally{
    button.disabled=false
  }
}

function updateFairProgress(){
  const fairs=new Map;

  allEvents.forEach(evento=>{
    const base=getFairBase(evento);
    if(!base||base.id===undefined||base.id===null)return;

    const key=String(base.id);
    if(!fairs.has(key)){
      fairs.set(key,{
        registered:getEventRoutes(evento).length>0
      })
    }
  });

  const total=fairs.size;
  const registered=[...fairs.values()].filter(item=>item.registered).length;
  const percent=total?Math.round((registered/total)*100):0;

  fairProgressText.textContent=`${registered} de ${total} cadastradas`;
  fairProgressBar.style.width=`${percent}%`
}

function renderFairBasePanel(){
  clearFairLocationAssist();

  const base=getFairBase(selectedRouteEvent);

  if(!base){
    fairBasePanel.hidden=true;
    return
  }

  fairBasePanel.hidden=false;
  manualFairMarkers.hidden=false;
  fairBaseName.textContent=base.feira||selectedRouteEvent.evento||"Feira";
  fairBaseSchedule.textContent=[
    base.dia,
    base.horarioInicio&&base.horarioFim
      ?`${base.horarioInicio} às ${base.horarioFim}`
      :"",
    base.regiao?`Região: ${base.regiao}`:""
  ].filter(Boolean).join(" • ");

  const segments=getFairSegments(selectedRouteEvent);
  fairSegmentsList.innerHTML="";

  if(!segments.length){
    fairSegmentsList.innerHTML=
      '<div class="fair-segment-card"><p class="fair-segment-address">Nenhum trecho foi informado na aba Feiras_Base.</p></div>'
  }else{
    segments.forEach((address,index)=>{
      const card=document.createElement("article");
      card.className="fair-segment-card";

      const title=document.createElement("div");
      title.className="fair-segment-title";
      title.innerHTML=`<strong>Trecho ${index+1}</strong>`;

      const paragraph=document.createElement("p");
      paragraph.className="fair-segment-address";
      paragraph.textContent=address;

      const button=document.createElement("button");
      button.type="button";
      button.className="locate-segment-btn";
      button.textContent="📍 Localizar trecho";
      button.addEventListener("click",()=>locateFairSegment(index,address,button));

      card.append(title,paragraph,button);
      fairSegmentsList.appendChild(card)
    })
  }

  updateFairProgress()
}

function setRouteEditorStatus(msg,type=""){
  routeEditorStatus.textContent=msg;
  routeEditorStatus.className="route-editor-status"+(type?` ${type}`:"");
}

function updateRouteCounter(){
  const total=routeLayerSequence.length;
  routeCounter.textContent=`${total} ${total===1?"rua concluída":"ruas concluídas"}`
}

function updateDrawingButtons(){
  const drawing=Boolean(routeDrawHandler);
  finishRouteDrawBtn.disabled=!drawing||currentRouteVertexCount<2;
  undoRoutePointBtn.disabled=!drawing||currentRouteVertexCount<1;
  startRouteDrawBtn.disabled=drawing
}

function hasRegisteredRoute(){
  return Boolean(selectedRouteEvent&&getEventRoutes(selectedRouteEvent).length)
}

function setRouteEditorMode(editing){
  routeEditMode=editing;
  routeDrawingActions.hidden=!editing;
  routeEditorPanel.classList.toggle("locked",!editing);

  if(!editing&&routeDrawHandler){
    routeDrawHandler.disable();
    routeDrawHandler=null;
    currentRouteVertexCount=0
  }

  updateDrawingButtons()
}

function updateRouteRegistrationUI(){
  const registered=hasRegisteredRoute();

  routeRegistrationStatus.className=
    "route-registration-status "+(registered?"registered":"pending");

  routeRegistrationStatus.textContent=registered
    ?`🟢 Percurso cadastrado — ${getEventRoutes(selectedRouteEvent).length} rua(s)`
    :"⚪ Percurso pendente";

  createRouteBtn.hidden=registered;
  editRouteBtn.hidden=!registered;
  deleteRouteBtn.hidden=!registered;

  if(!selectedRouteEvent){
    createRouteBtn.hidden=true;
    editRouteBtn.hidden=true;
    deleteRouteBtn.hidden=true;
    routeRegistrationStatus.textContent="Selecione uma feira";
    routeRegistrationStatus.className="route-registration-status pending"
  }
}

function clearRouteEditorLayers(){
  if(routeDrawHandler){
    routeDrawHandler.disable();
    routeDrawHandler=null
  }

  routeEditorLayers.clearLayers();
  routeLayerSequence=[];
  currentRouteVertexCount=0;
  updateRouteCounter();
  updateDrawingButtons()
}

function addRouteEditorLayer(latlngs){
  const l=L.polyline(latlngs,{
    color:"#27864a",
    weight:8,
    opacity:.92,
    lineCap:"round",
    lineJoin:"round",
    className:"route-finalized"
  }).addTo(routeEditorLayers);

  routeLayerSequence.push(l);
  updateRouteCounter();
  return l
}

function getRouteSnapshot(){
  return routeLayerSequence.map(l=>
    l.getLatLngs().map(p=>({lat:p.lat,lng:p.lng}))
  )
}

function restoreRouteSnapshot(snapshot){
  clearRouteEditorLayers();
  snapshot.forEach(points=>addRouteEditorLayer(points))
}

function fillRouteEventSelect(){
  const mapEvents=new Map;

  allEvents.forEach(e=>{
    if(!getCategory(e).includes("recorrente"))return;

    const id=String(e.idBase??"").trim();

    if(id&&!mapEvents.has(id)){
      mapEvents.set(id,e)
    }
  });

  routeEventSelect.innerHTML=
    '<option value="">Selecione uma feira</option>';

  [...mapEvents.values()]
    .sort((a,b)=>String(a.evento).localeCompare(String(b.evento),"pt-BR"))
    .forEach(e=>{
      const o=document.createElement("option");
      o.value=String(e.idBase);
      o.textContent=`${e.idBase} — ${e.evento}`;
      routeEventSelect.appendChild(o)
    })
}

function loadSelectedEventRoutes(){
  clearRouteEditorLayers();

  selectedRouteEvent=allEvents.find(e=>
    getCategory(e).includes("recorrente")&&
    String(e.idBase)===String(routeEventSelect.value)
  )||null;

  setRouteEditorMode(false);

  if(!selectedRouteEvent){
    originalRouteSnapshot=[];
    fairBasePanel.hidden=true;
    clearFairLocationAssist();
    updateRouteRegistrationUI();
    updateFairProgress();
    setRouteEditorStatus("Selecione uma feira para começar.");
    return
  }

  renderFairBasePanel();

  getEventRoutes(selectedRouteEvent).forEach(r=>
    addRouteEditorLayer(r.points)
  );

  originalRouteSnapshot=getRouteSnapshot();

  if(routeLayerSequence.length){
    map.fitBounds(
      L.featureGroup(routeLayerSequence).getBounds().pad(.2),
      {maxZoom:18}
    )
  }else{
    const p=getEventPosition(selectedRouteEvent);
    if(p)map.setView(p,17)
  }

  updateRouteRegistrationUI();

  setRouteEditorStatus(
    routeLayerSequence.length
      ?"Percurso protegido. Clique em “Editar percurso” para alterar ou em “Apagar percurso” para remover."
      :"Clique em “Criar percurso” para começar."
  )
}

function openRouteEditor(){
  closeDashboard();
  closeCalendar();

  routeEditorPanel.classList.add("open");
  routeEditorPanel.setAttribute("aria-hidden","false");
  routeEditorBtn.classList.add("active");

  fillRouteEventSelect();
  loadSelectedEventRoutes()
}

function closeRouteEditor(){
  if(routeEditMode&&routeLayerSequence.length!==originalRouteSnapshot.length){
    if(!window.confirm("Fechar o editor e descartar as alterações não salvas?")){
      return
    }
  }

  if(routeDrawHandler){
    routeDrawHandler.disable();
    routeDrawHandler=null
  }

  currentRouteVertexCount=0;
  setRouteEditorMode(false);
  clearFairLocationAssist();

  routeEditorPanel.classList.remove("open");
  routeEditorPanel.setAttribute("aria-hidden","true");
  routeEditorBtn.classList.remove("active")
}

function beginRouteCreation(){
  if(!selectedRouteEvent){
    setRouteEditorStatus("Selecione uma feira primeiro.","error");
    return
  }

  clearRouteEditorLayers();
  originalRouteSnapshot=[];
  setRouteEditorMode(true);
  setRouteEditorStatus("Clique em “Nova rua” para começar o percurso.")
}

function beginRouteEditing(){
  if(!selectedRouteEvent||!hasRegisteredRoute()){
    setRouteEditorStatus("Não há percurso cadastrado para editar.","error");
    return
  }

  originalRouteSnapshot=getRouteSnapshot();
  setRouteEditorMode(true);
  setRouteEditorStatus("Modo de edição ativo. Você pode remover, redesenhar ou acrescentar ruas.")
}

function cancelRouteEditing(){
  if(!routeEditMode)return;

  if(!window.confirm("Cancelar a edição e descartar as alterações?")){
    return
  }

  restoreRouteSnapshot(originalRouteSnapshot);
  setRouteEditorMode(false);
  updateRouteRegistrationUI();

  setRouteEditorStatus(
    hasRegisteredRoute()
      ?"Edição cancelada. O percurso salvo foi restaurado."
      :"Criação cancelada."
  )
}

function startRouteDrawing(){
  if(!routeEditMode){
    setRouteEditorStatus("Clique em “Criar percurso” ou “Editar percurso” primeiro.","error");
    return
  }

  if(!selectedRouteEvent){
    setRouteEditorStatus("Selecione uma feira primeiro.","error");
    return
  }

  if(routeDrawHandler)return;

  currentRouteVertexCount=0;

  routeDrawHandler=new L.Draw.Polyline(map,{
    shapeOptions:{
      color:"#126d9c",
      weight:7,
      opacity:.95,
      lineCap:"round",
      lineJoin:"round"
    },
    showLength:true,
    metric:true,
    repeatMode:false
  });

  routeDrawHandler.enable();
  updateDrawingButtons();

  setRouteEditorStatus(
    "Clique no início, nas curvas e no final. Depois clique em “Finalizar rua”."
  )
}

function finishCurrentRoute(){
  if(!routeDrawHandler||currentRouteVertexCount<2){
    setRouteEditorStatus("Marque pelo menos dois pontos antes de finalizar.","error");
    return
  }

  try{
    if(typeof routeDrawHandler.completeShape==="function"){
      routeDrawHandler.completeShape()
    }else if(typeof routeDrawHandler._finishShape==="function"){
      routeDrawHandler._finishShape()
    }else{
      throw new Error("O navegador não conseguiu finalizar a rua.")
    }
  }catch(e){
    setRouteEditorStatus(e.message,"error")
  }
}

function undoCurrentRoutePoint(){
  if(!routeDrawHandler||currentRouteVertexCount<1){
    setRouteEditorStatus("Não há ponto para desfazer.","error");
    return
  }

  routeDrawHandler.deleteLastVertex();
  currentRouteVertexCount=Math.max(0,currentRouteVertexCount-1);
  updateDrawingButtons();

  setRouteEditorStatus(
    currentRouteVertexCount
      ?`${currentRouteVertexCount} ponto(s) na rua atual.`
      :"Todos os pontos da rua atual foram removidos."
  )
}

function removeLastRoute(){
  if(!routeEditMode){
    setRouteEditorStatus("Ative o modo de edição primeiro.","error");
    return
  }

  const l=routeLayerSequence.pop();

  if(l){
    routeEditorLayers.removeLayer(l);
    updateRouteCounter();
    setRouteEditorStatus(`${routeLayerSequence.length} rua(s) permanecem no desenho.`)
  }else{
    setRouteEditorStatus("Não há rua concluída para remover.","error")
  }
}

function serializeRoutes(){
  return routeLayerSequence.map((l,i)=>({
    grupo:i+1,
    pontos:l.getLatLngs().map((p,j)=>({
      ordem:j+1,
      latitude:p.lat,
      longitude:p.lng
    }))
  }))
}

async function postRouteAction(action, routes=[]){
  const body=new URLSearchParams({
    acao:action,
    codigo:routeEditorCode.value.trim(),
    origem:"Eventos Recorrentes",
    idEvento:String(selectedRouteEvent.idBase),
    percursos:JSON.stringify(routes)
  });

  const response=await fetch(DATA_URL,{
    method:"POST",
    headers:{
      "Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"
    },
    body
  });

  return response.json()
}

async function saveRoutes(){
  if(!routeEditMode){
    setRouteEditorStatus("Clique em criar ou editar antes de salvar.","error");
    return
  }

  if(routeDrawHandler){
    setRouteEditorStatus("Finalize a rua atual antes de salvar.","error");
    return
  }

  if(!selectedRouteEvent){
    setRouteEditorStatus("Selecione uma feira.","error");
    return
  }

  if(!routeEditorCode.value.trim()){
    setRouteEditorStatus("Informe o código de edição.","error");
    return
  }

  const percursos=serializeRoutes();

  if(!percursos.length){
    setRouteEditorStatus("Desenhe pelo menos uma rua.","error");
    return
  }

  const totalPontos=percursos.reduce((s,r)=>s+r.pontos.length,0);

  if(!window.confirm(
    `Salvar ${percursos.length} rua(s) e ${totalPontos} ponto(s) para “${selectedRouteEvent.evento}”?`
  ))return;

  saveRoutesBtn.disabled=true;
  setRouteEditorStatus("Salvando percurso...");

  try{
    const result=await postRouteAction("salvarPercurso",percursos);

    if(!result.sucesso){
      throw new Error(result.erro||"Não foi possível salvar")
    }

    const selectedId=String(selectedRouteEvent.idBase);

    setRouteEditorStatus(
      `Salvo com sucesso: ${result.trechos} rua(s) e ${result.pontos} ponto(s).`,
      "success"
    );

    await loadEvents();

    routeEventSelect.value=selectedId;
    loadSelectedEventRoutes()
  }catch(e){
    setRouteEditorStatus(`Erro: ${e.message}`,"error")
  }finally{
    saveRoutesBtn.disabled=false
  }
}

async function deleteRegisteredRoute(){
  if(!selectedRouteEvent||!hasRegisteredRoute()){
    setRouteEditorStatus("Não existe percurso cadastrado para apagar.","error");
    return
  }

  if(!routeEditorCode.value.trim()){
    setRouteEditorStatus("Informe o código de edição.","error");
    return
  }

  if(!window.confirm(
    `Apagar definitivamente todas as ruas da feira “${selectedRouteEvent.evento}”?`
  ))return;

  deleteRouteBtn.disabled=true;
  setRouteEditorStatus("Apagando percurso...");

  try{
    const result=await postRouteAction("apagarPercurso",[]);

    if(!result.sucesso){
      throw new Error(result.erro||"Não foi possível apagar")
    }

    const selectedId=String(selectedRouteEvent.idBase);

    await loadEvents();

    routeEventSelect.value=selectedId;
    loadSelectedEventRoutes();

    setRouteEditorStatus("Percurso apagado com sucesso.","success")
  }catch(e){
    setRouteEditorStatus(`Erro: ${e.message}`,"error")
  }finally{
    deleteRouteBtn.disabled=false
  }
}

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


function updateExplorePanel() {
  exploreEventsToggle.checked = eventsActive;
  exploreHortasToggle.checked = hortasActive;

  const agendaCount = allEvents.filter(
    evento => getCategory(evento).includes("agenda prefeito")
  ).length;

  exploreEventsCount.textContent = String(allEvents.length);
  exploreAgendaCount.textContent = String(agendaCount);
  exploreHortasCount.textContent = String(allHortas.length);

  exploreSummaryText.textContent =
    `${allEvents.length} eventos • ` +
    `${agendaCount} compromissos da agenda • ` +
    `${allHortas.length} hortas`;
}

function openExplorePanel() {
  closeDashboard();
  closeCalendar();

  explorePanel.classList.add("open");
  explorePanel.setAttribute("aria-hidden", "false");
  exploreBackdrop.hidden = false;
  exploreBtn.classList.add("active");
  updateExplorePanel();
}

function closeExplorePanel() {
  explorePanel.classList.remove("open");
  explorePanel.setAttribute("aria-hidden", "true");
  exploreBackdrop.hidden = true;
  exploreBtn.classList.remove("active");
}

function toggleExplorePanel() {
  if (explorePanel.classList.contains("open")) {
    closeExplorePanel();
  } else {
    openExplorePanel();
  }
}


function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToMinutes(value) {
  if (!value) return null;
  const match = String(value).match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function isInGabinetePeriod(item) {
  if (item.kind === "horta") return true;

  const start = timeToMinutes(item.horaInicio);
  if (start === null || gabinetePeriod.value === "dia") return true;

  if (gabinetePeriod.value === "manha") return start >= 0 && start < 12 * 60;
  if (gabinetePeriod.value === "tarde") return start >= 12 * 60 && start < 18 * 60;
  if (gabinetePeriod.value === "noite") return start >= 18 * 60;

  if (gabinetePeriod.value === "personalizado") {
    const customStart = timeToMinutes(gabineteStartTime.value);
    const customEnd = timeToMinutes(gabineteEndTime.value);
    return start >= customStart && start <= customEnd;
  }

  return true;
}

function getGabineteLocationLabel() {
  const option = gabineteLocationValue.options[gabineteLocationValue.selectedIndex];
  return option ? option.textContent : "";
}

function fillGabineteLocations() {
  const type = gabineteLocationType.value;
  const values = new Set();

  [...allEvents, ...allHortas].forEach(item => {
    const value = type === "regiao" ? item.regiao : item.bairro;
    if (String(value || "").trim()) values.add(String(value).trim());
  });

  gabineteLocationValue.innerHTML = '<option value="">Selecione</option>';

  [...values]
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      gabineteLocationValue.appendChild(option);
    });
}

function openGabinetePanel() {
  closeExplorePanel();
  closeDashboard();
  closeCalendar();

  gabinetePanel.classList.add("open");
  gabinetePanel.setAttribute("aria-hidden", "false");
  gabineteBackdrop.hidden = false;
  gabineteBtn.classList.add("active");

  if (!gabineteDate.value) {
    gabineteDate.value = formatDateInputValue(new Date());
  }

  fillGabineteLocations();
}

function closeGabinetePanel() {
  gabinetePanel.classList.remove("open");
  gabinetePanel.setAttribute("aria-hidden", "true");
  gabineteBackdrop.hidden = true;
  gabineteBtn.classList.remove("active");
}

function toggleGabinetePanel() {
  if (gabinetePanel.classList.contains("open")) {
    closeGabinetePanel();
  } else {
    openGabinetePanel();
  }
}

function gabineteItemId(item) {
  return `${item.kind}:${item.id ?? item.idBase ?? item.nome ?? item.evento}`;
}

function createGabineteResults() {
  const location = gabineteLocationValue.value;
  const locationType = gabineteLocationType.value;
  const selectedDate = gabineteDate.value
    ? new Date(gabineteDate.value + "T00:00:00")
    : null;

  if (!location) {
    gabineteQueryStatus.textContent = "Selecione uma região ou bairro.";
    gabineteQueryStatus.className = "gabinete-query-status error";
    return;
  }

  if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
    gabineteQueryStatus.textContent = "Escolha uma data válida.";
    gabineteQueryStatus.className = "gabinete-query-status error";
    return;
  }

  const events = allEvents
    .filter(evento => {
      const itemLocation = locationType === "regiao"
        ? evento.regiao
        : evento.bairro;

      return normalize(itemLocation) === normalize(location) &&
        sameDay(parseDateBR(evento.data), selectedDate);
    })
    .map(evento => ({
      ...evento,
      kind: "evento",
      displayName: evento.evento || "Evento"
    }))
    .filter(isInGabinetePeriod);

  const hortas = allHortas
    .filter(horta => {
      const itemLocation = locationType === "regiao"
        ? horta.regiao
        : horta.bairro;

      return normalize(itemLocation) === normalize(location);
    })
    .map(horta => ({
      ...horta,
      kind: "horta",
      displayName: horta.nome || "Horta"
    }));

  gabineteResults = events.concat(hortas);
  gabineteSelectedIds = new Set();

  gabineteResultTitle.textContent = getGabineteLocationLabel();
  gabineteResultSubtitle.textContent =
    `${selectedDate.toLocaleDateString("pt-BR")} • ` +
    `${gabinetePeriod.options[gabinetePeriod.selectedIndex].textContent}`;

  gabineteEventsSummary.querySelector("strong").textContent = String(events.length);
  gabineteHortasSummary.querySelector("strong").textContent = String(hortas.length);

  gabineteBriefingTitle.value =
    `Visita a ${getGabineteLocationLabel()}`;

  gabineteQueryStep.hidden = true;
  gabineteResultsStep.hidden = false;
  gabineteSelectionBar.hidden = false;

  gabineteQueryStatus.textContent = "Consulta concluída.";
  gabineteQueryStatus.className = "gabinete-query-status";

  renderGabineteItems();
  updateGabineteSelection();
}

function sortGabineteItems(items) {
  const mode = gabineteSort.value;

  return [...items].sort((a, b) => {
    if (mode === "nome") {
      return a.displayName.localeCompare(b.displayName, "pt-BR");
    }

    if (mode === "tipo") {
      return a.kind.localeCompare(b.kind) ||
        a.displayName.localeCompare(b.displayName, "pt-BR");
    }

    const timeA = timeToMinutes(a.horaInicio);
    const timeB = timeToMinutes(b.horaInicio);

    if (a.kind === "horta" && b.kind !== "horta") return 1;
    if (b.kind === "horta" && a.kind !== "horta") return -1;

    return (timeA ?? 9999) - (timeB ?? 9999) ||
      a.displayName.localeCompare(b.displayName, "pt-BR");
  });
}

function renderGabineteItems(filterKind = "") {
  gabineteItemsList.innerHTML = "";

  const items = sortGabineteItems(
    filterKind
      ? gabineteResults.filter(item => item.kind === filterKind)
      : gabineteResults
  );

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "gabinete-empty";
    empty.textContent = "Nenhum item encontrado para esta consulta.";
    gabineteItemsList.appendChild(empty);
    return;
  }

  items.forEach(item => {
    const id = gabineteItemId(item);
    const label = document.createElement("label");
    label.className = "gabinete-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = gabineteSelectedIds.has(id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        gabineteSelectedIds.add(id);
      } else {
        gabineteSelectedIds.delete(id);
      }
      updateGabineteSelection();
    });

    const main = document.createElement("div");
    main.className = "gabinete-item-main";

    const head = document.createElement("div");
    head.className = "gabinete-item-head";

    const name = document.createElement("strong");
    name.textContent = item.displayName;

    const badge = document.createElement("span");
    badge.textContent = item.kind === "evento"
      ? (item.horaInicio || "Evento")
      : "Horta";

    head.append(name, badge);

    const meta = document.createElement("div");
    meta.className = "gabinete-item-meta";
    meta.textContent = [
      item.kind === "evento"
        ? (item.secretariaResponsavel || item.tipoEvento)
        : item.tipo,
      item.local || item.endereco,
      item.bairro,
      item.regiao
    ].filter(Boolean).join(" • ");

    const note = document.createElement("input");
    note.type = "text";
    note.className = "gabinete-item-note";
    note.placeholder = "Observação do gabinete para este item";
    note.value = item.gabineteNote || "";
    note.addEventListener("input", () => {
      item.gabineteNote = note.value;
    });

    main.append(head, meta, note);
    label.append(checkbox, main);
    gabineteItemsList.appendChild(label);
  });
}

function updateGabineteSelection() {
  const count = gabineteSelectedIds.size;
  gabineteSelectedCount.textContent = String(count);
  gabinetePreviewBtn.disabled = count === 0;
}

function resetGabineteQuery() {
  gabineteResults = [];
  gabineteSelectedIds = new Set();
  gabineteResultsStep.hidden = true;
  gabineteSelectionBar.hidden = true;
  gabineteQueryStep.hidden = false;
  gabineteItemsList.innerHTML = "";
  updateGabineteSelection();
}

function getSelectedGabineteItems() {
  return gabineteResults.filter(item =>
    gabineteSelectedIds.has(gabineteItemId(item))
  );
}

function buildGabinetePreview() {
  const items = sortGabineteItems(getSelectedGabineteItems());
  if (!items.length) return;

  const location = getGabineteLocationLabel();
  const selectedDate = new Date(gabineteDate.value + "T00:00:00");
  const title = gabineteBriefingTitle.value.trim() ||
    `Visita a ${location}`;
  const objective = gabineteBriefingObjective.value.trim();
  const notes = gabineteBriefingNotes.value.trim();

  const itemHtml = items.map(item => {
    const time = item.kind === "evento"
      ? (item.horaInicio || "A definir")
      : "Ponto territorial";

    const category = item.kind === "evento"
      ? (item.tipoEvento || item.categoria || "Evento")
      : (item.tipo || "Horta");

    const place = [
      item.local || item.endereco,
      item.bairro,
      item.regiao
    ].filter(Boolean).join(" • ");

    return `
      <section class="briefing-item">
        <div class="briefing-item-time">${escapeHtml(time)}</div>
        <div>
          <h3>${escapeHtml(item.displayName)}</h3>
          <p><strong>${escapeHtml(category)}</strong></p>
          <p>${escapeHtml(place || "-")}</p>
          ${item.gabineteNote ? `<p><strong>Observação do gabinete:</strong> ${escapeHtml(item.gabineteNote)}</p>` : ""}
        </div>
      </section>
    `;
  }).join("");

  gabinetePreviewDocument.innerHTML = `
    <header class="briefing-brand">
      <h1>GeoDiadema</h1>
      <p>Trabalhando por Diadema</p>
    </header>

    <section class="briefing-heading">
      <div class="eyebrow">BRIEFING EXECUTIVO</div>
      <h2>${escapeHtml(title)}</h2>
      <p><strong>Data:</strong> ${selectedDate.toLocaleDateString("pt-BR")}</p>
      <p><strong>Local:</strong> ${escapeHtml(location)}</p>
      <p><strong>Período:</strong> ${escapeHtml(gabinetePeriod.options[gabinetePeriod.selectedIndex].textContent)}</p>
      ${objective ? `<p><strong>Objetivo:</strong> ${escapeHtml(objective)}</p>` : ""}
    </section>

    <section>
      ${itemHtml}
    </section>

    ${notes ? `
      <section class="briefing-general-notes">
        <strong>Observações gerais do gabinete</strong>
        <p>${escapeHtml(notes)}</p>
      </section>
    ` : ""}

    <footer class="briefing-footer">
      Prévia gerada pelo GeoDiadema em
      ${new Date().toLocaleString("pt-BR")}
    </footer>
  `;

  gabinetePreview.classList.add("open");
  gabinetePreview.setAttribute("aria-hidden", "false");
}

function closeGabinetePreview() {
  gabinetePreview.classList.remove("open");
  gabinetePreview.setAttribute("aria-hidden", "true");
}

function showOnlyEvents() {
  eventsActive = true;
  bairrosActive = false;
  heatActive = false;
  hortasActive = false;
  selectedNeighborhood = "";

  heatBtn.classList.remove("active");
  heatBtn.textContent = "🔥 Mapa de Calor";
  updateHortasButton();

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
  eventsActive = true;
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
  if (!eventsActive) return [];

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
  const hortaMarkers = renderHortasLayer();

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
      `${segmentCount} trecho(s) de rua` +
      (hortasActive ? ` · ${hortaMarkers.length} horta(s)` : "");
  }

  const fitMarkers = validMarkers.concat(hortaMarkers);

  if (fitMarkers.length > 0) {
    const group = L.featureGroup(fitMarkers);
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

    allHortas = data.filter(
      item => item && item.origemRegistro === "Hortas_Base"
    );

    allEvents = data.filter(
      item => !item || item.origemRegistro !== "Hortas_Base"
    );

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
    updateExplorePanel();
    fillGabineteLocations();
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

map.on(L.Draw.Event.DRAWVERTEX,()=>{
  if(!routeDrawHandler)return;
  currentRouteVertexCount+=1;
  updateDrawingButtons();
  setRouteEditorStatus(`${currentRouteVertexCount} ponto(s) na rua atual.`)
});

map.on(L.Draw.Event.CREATED,e=>{
  if(e.layerType!=="polyline")return;
  addRouteEditorLayer(e.layer.getLatLngs());
  routeDrawHandler=null;
  currentRouteVertexCount=0;
  updateDrawingButtons();
  setRouteEditorStatus(
    `Rua ${routeLayerSequence.length} concluída. Clique em “Nova rua” para acrescentar outra ou salve o percurso.`,
    "success"
  )
});

map.on(L.Draw.Event.DRAWSTOP,()=>{
  if(routeDrawHandler&&currentRouteVertexCount<2){
    routeDrawHandler=null;
    currentRouteVertexCount=0;
    updateDrawingButtons()
  }
});

routeEditorBtn.addEventListener("click",()=>
  routeEditorPanel.classList.contains("open")
    ?closeRouteEditor()
    :openRouteEditor()
);

closeRouteEditorBtn.addEventListener("click",closeRouteEditor);
createRouteBtn.addEventListener("click",beginRouteCreation);
editRouteBtn.addEventListener("click",beginRouteEditing);
deleteRouteBtn.addEventListener("click",deleteRegisteredRoute);
cancelRouteEditBtn.addEventListener("click",cancelRouteEditing);
routeEventSelect.addEventListener("change",loadSelectedEventRoutes);
startRouteDrawBtn.addEventListener("click",startRouteDrawing);
finishRouteDrawBtn.addEventListener("click",finishCurrentRoute);
undoRoutePointBtn.addEventListener("click",undoCurrentRoutePoint);
removeLastRouteBtn.addEventListener("click",removeLastRoute);

clearRoutesBtn.addEventListener("click",()=>{
  if(!routeEditMode){
    setRouteEditorStatus("Ative o modo de edição primeiro.","error");
    return
  }

  if(routeLayerSequence.length&&!window.confirm("Apagar todas as ruas desenhadas nesta tela?"))return;

  clearRouteEditorLayers();
  setRouteEditorStatus("Desenho limpo. Clique em “Nova rua” para recomeçar.")
});

saveRoutesBtn.addEventListener("click",saveRoutes);

markFairStartBtn.addEventListener("click",()=>{
  fairLocationAssistLayer.clearLayers();
  manualFairStartPoint=null;
  manualFairEndPoint=null;
  manualFairMarkerMode="start";
  updateManualFairMarkerButtons();
  setRouteEditorStatus("Clique no mapa exatamente onde começa a feira.")
});

markFairEndBtn.addEventListener("click",()=>{
  manualFairMarkerMode="end";
  updateManualFairMarkerButtons();
  setRouteEditorStatus("Clique no mapa exatamente onde termina a feira.")
});

clearFairMarkersBtn.addEventListener("click",()=>{
  manualFairStartPoint=null;
  manualFairEndPoint=null;
  manualFairMarkerMode="start";
  fairLocationAssistLayer.clearLayers();
  updateManualFairMarkerButtons();
  setRouteEditorStatus("Marcações limpas. Clique no mapa para marcar o início A.")
});

map.on("click",event=>{
  if(!manualFairMarkerMode||manualFairMarkers.hidden)return;

  const point={lat:event.latlng.lat,lng:event.latlng.lng};

  if(manualFairMarkerMode==="start"){
    manualFairStartPoint=point;
    manualFairMarkerMode="end";
    setRouteEditorStatus("Início A marcado. Agora clique no mapa para marcar o fim B.")
  }else{
    manualFairEndPoint=point;
    manualFairMarkerMode=null
  }

  updateManualFairMarkerButtons();
  drawManualFairMarkers()
});

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
    closeExplorePanel();
    closeGabinetePanel();
    closeGabinetePreview();
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

gabineteBtn.addEventListener("click", toggleGabinetePanel);
closeGabineteBtn.addEventListener("click", closeGabinetePanel);
gabineteBackdrop.addEventListener("click", closeGabinetePanel);

gabineteLocationType.addEventListener("change", fillGabineteLocations);

gabinetePeriod.addEventListener("change", () => {
  gabineteCustomTime.hidden = gabinetePeriod.value !== "personalizado";
});

gabineteSearchBtn.addEventListener("click", createGabineteResults);
gabineteNewQueryBtn.addEventListener("click", resetGabineteQuery);

gabineteSort.addEventListener("change", () => renderGabineteItems());

gabineteEventsSummary.addEventListener("click", () => renderGabineteItems("evento"));
gabineteHortasSummary.addEventListener("click", () => renderGabineteItems("horta"));

gabineteSelectAllBtn.addEventListener("click", () => {
  gabineteResults.forEach(item =>
    gabineteSelectedIds.add(gabineteItemId(item))
  );
  renderGabineteItems();
  updateGabineteSelection();
});

gabineteClearSelectionBtn.addEventListener("click", () => {
  gabineteSelectedIds.clear();
  renderGabineteItems();
  updateGabineteSelection();
});

gabinetePreviewBtn.addEventListener("click", buildGabinetePreview);
closeGabinetePreviewBtn.addEventListener("click", closeGabinetePreview);
printGabinetePreviewBtn.addEventListener("click", () => window.print());

exploreBtn.addEventListener("click", toggleExplorePanel);
closeExploreBtn.addEventListener("click", closeExplorePanel);
exploreBackdrop.addEventListener("click", closeExplorePanel);

moreToolsBtn.addEventListener("click", () => {
  advancedToolbar.hidden = !advancedToolbar.hidden;
  moreToolsBtn.classList.toggle("active", !advancedToolbar.hidden);
  moreToolsBtn.textContent = advancedToolbar.hidden
    ? "⚙️ Mais opções"
    : "✖ Fechar opções";
});

exploreEventsToggle.addEventListener("change", () => {
  eventsActive = exploreEventsToggle.checked;

  if (!eventsActive) {
    mayorAgendaOnly = false;
    updateMayorAgendaButton();
  }

  renderMap();
  updateExplorePanel();
});

exploreHortasToggle.addEventListener("change", () => {
  hortasActive = exploreHortasToggle.checked;
  updateHortasButton();
  renderMap();
  updateExplorePanel();
});

exploreAgendaBtn.addEventListener("click", () => {
  eventsActive = true;
  closeExplorePanel();
  showMayorAgenda();
  updateExplorePanel();
});

hortasBtn.addEventListener("click", () => {
  hortasActive = !hortasActive;
  updateHortasButton();
  renderMap();
  updateExplorePanel();
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
