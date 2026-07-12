console.log("GeoDiadema 2.8 carregado");
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
let gabineteSelectedOrder = [];
let dailyReportEvents = [];
let dataCenterUnlocked=false;
let dataCenterActiveModule="events";
let eventFormMode="new";
let eventFormSourceRecord=null;
let saveAndCreateAnother=false;
let hortaFormMode="new";
let saveAndCreateAnotherHorta=false;
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
const gabineteLocationOptions = document.getElementById("gabineteLocationOptions");
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
const gabineteIncludeEventos = document.getElementById("gabineteIncludeEventos");
const gabineteIncludeHortas = document.getElementById("gabineteIncludeHortas");
const gabineteIncludeFeiras = document.getElementById("gabineteIncludeFeiras");
const gabineteCategoryResults = document.getElementById("gabineteCategoryResults");
const gabineteSelectedOrderSection = document.getElementById("gabineteSelectedOrderSection");
const gabineteSelectedOrderList = document.getElementById("gabineteSelectedOrderList");
const gabineteClearSelectionBtn = document.getElementById("gabineteClearSelectionBtn");
const gabineteSelectionSummary = document.getElementById("gabineteSelectionSummary");
const gabineteRecipientName = document.getElementById("gabineteRecipientName");
const gabineteRecipientRole = document.getElementById("gabineteRecipientRole");
const gabineteRecipientDepartment = document.getElementById("gabineteRecipientDepartment");
const gabineteBriefingTitle = document.getElementById("gabineteBriefingTitle");
const gabineteBriefingObjective = document.getElementById("gabineteBriefingObjective");
const gabineteBriefingNotes = document.getElementById("gabineteBriefingNotes");
const gabineteSelectionBar = document.getElementById("gabineteSelectionBar");
const gabineteSelectedCount = document.getElementById("gabineteSelectedCount");
const gabinetePreviewBtn = document.getElementById("gabinetePreviewBtn");
const gabinetePreview = document.getElementById("gabinetePreview");
const gabinetePreviewDocument = document.getElementById("gabinetePreviewDocument");
const closeGabinetePreviewBtn = document.getElementById("closeGabinetePreviewBtn");
const dailyReportPanel = document.getElementById("dailyReportPanel");
const closeDailyReportBtn = document.getElementById("closeDailyReportBtn");
const dailyReportBackdrop = document.getElementById("dailyReportBackdrop");
const dailyReportDate = document.getElementById("dailyReportDate");
const dailyReportSort = document.getElementById("dailyReportSort");
const generateDailyReportBtn = document.getElementById("generateDailyReportBtn");
const shareDailyReportWhatsappBtn = document.getElementById("shareDailyReportWhatsappBtn");
const printDailyReportBtn = document.getElementById("printDailyReportBtn");
const dailyReportStatus = document.getElementById("dailyReportStatus");
const dailyReportList = document.getElementById("dailyReportList");

const dataCenterBtn=document.getElementById("dataCenterBtn");
const dataCenterPanel=document.getElementById("dataCenterPanel");
const closeDataCenterBtn=document.getElementById("closeDataCenterBtn");
const dataCenterBackdrop=document.getElementById("dataCenterBackdrop");
const dataCenterAccessStep=document.getElementById("dataCenterAccessStep");
const dataCenterAccessCode=document.getElementById("dataCenterAccessCode");
const dataCenterUnlockBtn=document.getElementById("dataCenterUnlockBtn");
const dataCenterAccessStatus=document.getElementById("dataCenterAccessStatus");
const dataCenterContent=document.getElementById("dataCenterContent");
const dataCenterEventsCount=document.getElementById("dataCenterEventsCount");
const dataCenterHortasCount=document.getElementById("dataCenterHortasCount");
const dataCenterFeirasCount=document.getElementById("dataCenterFeirasCount");
const dataCenterPendingCount=document.getElementById("dataCenterPendingCount");
const dataQualityPercent=document.getElementById("dataQualityPercent");
const dataQualityBarFill=document.getElementById("dataQualityBarFill");
const dataQualitySummary=document.getElementById("dataQualitySummary");
const dataCenterSearch=document.getElementById("dataCenterSearch");
const dataCenterRegionFilter=document.getElementById("dataCenterRegionFilter");
const dataCenterStatusFilter=document.getElementById("dataCenterStatusFilter");
const dataCenterPriorityFilter=document.getElementById("dataCenterPriorityFilter");
const dataCenterList=document.getElementById("dataCenterList");
const refreshDataCenterBtn=document.getElementById("refreshDataCenterBtn");

const newDataRecordBtn=document.getElementById("newDataRecordBtn");
const eventFormModal=document.getElementById("eventFormModal");
const eventForm=document.getElementById("eventForm");
const eventFormTitle=document.getElementById("eventFormTitle");
const eventFormSubtitle=document.getElementById("eventFormSubtitle");
const eventFormOriginalId=document.getElementById("eventFormOriginalId");
const closeEventFormBtn=document.getElementById("closeEventFormBtn");
const cancelEventFormBtn=document.getElementById("cancelEventFormBtn");
const saveEventFormBtn=document.getElementById("saveEventFormBtn");
const saveAndNewEventFormBtn=document.getElementById("saveAndNewEventFormBtn");
const eventFormStatus=document.getElementById("eventFormStatus");
const eventNameInput=document.getElementById("eventNameInput");
const eventTypeInput=document.getElementById("eventTypeInput");
const eventSecretariaInput=document.getElementById("eventSecretariaInput");
const eventDateInput=document.getElementById("eventDateInput");
const eventStatusInput=document.getElementById("eventStatusInput");
const eventStartInput=document.getElementById("eventStartInput");
const eventEndInput=document.getElementById("eventEndInput");
const eventRegionInput=document.getElementById("eventRegionInput");
const eventBairroInput=document.getElementById("eventBairroInput");
const eventAddressInput=document.getElementById("eventAddressInput");
const eventLocalInput=document.getElementById("eventLocalInput");
const eventPriorityInput=document.getElementById("eventPriorityInput");
const eventPublicInput=document.getElementById("eventPublicInput");
const eventResponsibleInput=document.getElementById("eventResponsibleInput");
const eventPhoneInput=document.getElementById("eventPhoneInput");
const eventLatitudeInput=document.getElementById("eventLatitudeInput");
const eventLongitudeInput=document.getElementById("eventLongitudeInput");
const eventNotesInput=document.getElementById("eventNotesInput");
const eventFormQualityPercent=document.getElementById("eventFormQualityPercent");
const eventFormQualityFill=document.getElementById("eventFormQualityFill");
const eventFormQualityMessage=document.getElementById("eventFormQualityMessage");
const eventTypeSuggestions=document.getElementById("eventTypeSuggestions");
const eventSecretariaSuggestions=document.getElementById("eventSecretariaSuggestions");

const recordTypeModal=document.getElementById("recordTypeModal");
const closeRecordTypeBtn=document.getElementById("closeRecordTypeBtn");
const newEventTypeBtn=document.getElementById("newEventTypeBtn");
const newHortaTypeBtn=document.getElementById("newHortaTypeBtn");

const hortaFormModal=document.getElementById("hortaFormModal");
const hortaForm=document.getElementById("hortaForm");
const hortaFormTitle=document.getElementById("hortaFormTitle");
const hortaFormSubtitle=document.getElementById("hortaFormSubtitle");
const hortaFormOriginalId=document.getElementById("hortaFormOriginalId");
const closeHortaFormBtn=document.getElementById("closeHortaFormBtn");
const cancelHortaFormBtn=document.getElementById("cancelHortaFormBtn");
const saveHortaFormBtn=document.getElementById("saveHortaFormBtn");
const saveAndNewHortaFormBtn=document.getElementById("saveAndNewHortaFormBtn");
const hortaFormStatus=document.getElementById("hortaFormStatus");
const hortaNameInput=document.getElementById("hortaNameInput");
const hortaTypeInput=document.getElementById("hortaTypeInput");
const hortaStatusInput=document.getElementById("hortaStatusInput");
const hortaRegionInput=document.getElementById("hortaRegionInput");
const hortaBairroInput=document.getElementById("hortaBairroInput");
const hortaAddressInput=document.getElementById("hortaAddressInput");
const hortaLatitudeInput=document.getElementById("hortaLatitudeInput");
const hortaLongitudeInput=document.getElementById("hortaLongitudeInput");
const hortaNotesInput=document.getElementById("hortaNotesInput");
const hortaFormQualityPercent=document.getElementById("hortaFormQualityPercent");
const hortaFormQualityFill=document.getElementById("hortaFormQualityFill");
const hortaFormQualityMessage=document.getElementById("hortaFormQualityMessage");

const printGabinetePreviewBtn = document.getElementById("printGabinetePreviewBtn");
const downloadGabinetePdfBtn = document.getElementById("downloadGabinetePdfBtn");
const shareGabineteWhatsappBtn = document.getElementById("shareGabineteWhatsappBtn");
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
const bairrosLegendTotal = document.getElementById("bairrosLegendTotal");
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
    symbol = "👔";
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
    if (regiao && normalize(getItemEffectiveRegion(horta)) !== regiao) return false;

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

function bairroColor(count, total) {
  if (!count || !total) return "#dfe4ea";

  const share = Math.max(0, Math.min(1, count / total));

  // Suaviza a escala para que bairros menores continuem visíveis,
  // mantendo os bairros com maior participação mais intensos.
  const intensity = Math.sqrt(share);
  const lightness = 94 - intensity * 56;
  const saturation = 64 + intensity * 16;

  return `hsl(10, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
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

  const totalFiltered = events.filter(evento => normalize(evento.bairro)).length;
  const participation = totalFiltered
    ? (bairroEvents.length / totalFiltered) * 100
    : 0;

  return {
    total: bairroEvents.length,
    totalFiltered,
    participation,
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
  const safeName = escapeHtml(canonicalTerritoryName(bairroName));
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
          <span>📊 Participação</span>
          <strong>${stats.participation.toLocaleString("pt-BR", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
          })}%</strong>
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

      <p style="font-size:10px;color:#687589;margin:8px 0;">
        ${stats.total} de ${stats.totalFiltered} eventos exibidos.
      </p>

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
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);

  bairrosLegendTotal.textContent =
    total
      ? `Intensidade calculada sobre ${total} evento(s) exibido(s)`
      : "Nenhum evento exibido no filtro atual";

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
        fillColor: bairroColor(count, total),
        fillOpacity: count ? 0.62 : 0.36
      };
    },

    onEachFeature(feature, layer) {
      const bairroName = canonicalTerritoryName(
        feature?.properties?.bairro || "Bairro"
      );

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
            fillOpacity: 0.76
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


function canonicalTerritoryName(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const smallWords = new Set(["da", "de", "do", "das", "dos", "e"]);

  return text
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && smallWords.has(word)) return word;
      return word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);
    })
    .join(" ");
}

function buildCanonicalTerritoryMap(items, fieldName) {
  const map = new Map();

  items.forEach(item => {
    const raw = String(item?.[fieldName] || "").trim();
    const key = normalize(raw);
    if (!key) return;

    if (!map.has(key)) {
      map.set(key, canonicalTerritoryName(raw));
    }
  });

  return map;
}

function buildBairroRegionMap() {
  const votes = new Map();

  allEvents.forEach(item => {
    const bairroKey = normalize(item.bairro);
    const regionRaw = String(item.regiao || "").trim();
    const regionKey = normalize(regionRaw);

    if (!bairroKey || !regionKey) return;

    if (!votes.has(bairroKey)) votes.set(bairroKey, new Map());

    const regionVotes = votes.get(bairroKey);
    const current = regionVotes.get(regionKey) || {
      count: 0,
      display: canonicalTerritoryName(regionRaw)
    };

    current.count += 1;
    regionVotes.set(regionKey, current);
  });

  const result = new Map();

  votes.forEach((regionVotes, bairroKey) => {
    const best = [...regionVotes.values()]
      .sort((a, b) => b.count - a.count)[0];

    if (best) result.set(bairroKey, best.display);
  });

  return result;
}

function getItemEffectiveRegion(item) {
  const explicitRegion = String(item?.regiao || "").trim();
  if (explicitRegion) return canonicalTerritoryName(explicitRegion);

  const bairroKey = normalize(item?.bairro);
  if (!bairroKey) return "";

  return buildBairroRegionMap().get(bairroKey) || "";
}

function getItemTerritoryValue(item, locationType) {
  if (locationType === "regiao") {
    return getItemEffectiveRegion(item);
  }

  return canonicalTerritoryName(item?.bairro);
}

function dedupeCanonicalTerritories(values) {
  const unique = new Map();

  values.forEach(value => {
    const display = canonicalTerritoryName(value);
    const key = normalize(display);

    if (key && !unique.has(key)) {
      unique.set(key, display);
    }
  });

  return [...unique.values()]
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function getSelectedGabineteLocations() {
  return [...gabineteLocationOptions.querySelectorAll("input:checked")]
    .map(input => input.value);
}

function getGabineteLocationLabel() {
  const selected = getSelectedGabineteLocations();
  if (!selected.length) return "";
  if (selected.length === 1) return selected[0];
  if (selected.length === 2) return `${selected[0]} e ${selected[1]}`;
  return `${selected.slice(0, -1).join(", ")} e ${selected[selected.length - 1]}`;
}

function fillGabineteLocations() {
  const type = gabineteLocationType.value;
  const allItems = [...allEvents, ...allHortas];

  const values = dedupeCanonicalTerritories(
    allItems.map(item => getItemTerritoryValue(item, type))
  );

  const previouslySelected = new Set(
    getSelectedGabineteLocations().map(normalize)
  );

  gabineteLocationOptions.innerHTML = "";

  values.forEach(value => {
    const label = document.createElement("label");
    label.className = "gabinete-location-option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = value;
    input.checked = previouslySelected.has(normalize(value));

    const span = document.createElement("span");
    span.textContent = value;

    label.append(input, span);
    gabineteLocationOptions.appendChild(label);
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
dailyReportDate.value = formatDateInputValue(new Date());
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

function getGabineteCategoryConfig() {
  return [
    {
      kind: "evento",
      label: "Eventos",
      icon: "📅",
      enabled: gabineteIncludeEventos.checked
    },
    {
      kind: "horta",
      label: "Hortas",
      icon: "🌱",
      enabled: gabineteIncludeHortas.checked
    },
    {
      kind: "feira",
      label: "Feiras",
      icon: "🛒",
      enabled: gabineteIncludeFeiras.checked
    }
  ];
}

function isFeiraGabineteItem(evento) {
  return Boolean(
    evento &&
    evento.feiraBase &&
    typeof evento.feiraBase === "object"
  );
}

function createGabineteResults() {
  const locations = getSelectedGabineteLocations();
  const locationType = gabineteLocationType.value;
  const selectedDate = gabineteDate.value
    ? new Date(gabineteDate.value + "T00:00:00")
    : null;
  const selectedCategories = getGabineteCategoryConfig()
    .filter(category => category.enabled);

  if (!locations.length) {
    gabineteQueryStatus.textContent = "Selecione ao menos uma região ou bairro.";
    gabineteQueryStatus.className = "gabinete-query-status error";
    return;
  }

  if (!selectedCategories.length) {
    gabineteQueryStatus.textContent = "Escolha ao menos uma categoria para incluir.";
    gabineteQueryStatus.className = "gabinete-query-status error";
    return;
  }

  if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
    gabineteQueryStatus.textContent = "Escolha uma data válida.";
    gabineteQueryStatus.className = "gabinete-query-status error";
    return;
  }

  const locationMatches = item => {
    const itemLocation = getItemTerritoryValue(item, locationType);

    return locations.some(
      location => normalize(itemLocation) === normalize(location)
    );
  };

  const events = gabineteIncludeEventos.checked
    ? allEvents
        .filter(evento => !isFeiraGabineteItem(evento))
        .filter(evento =>
          locationMatches(evento) &&
          sameDay(parseDateBR(evento.data), selectedDate)
        )
        .map(evento => ({
          ...evento,
          kind: "evento",
          displayName: evento.evento || "Evento"
        }))
        .filter(isInGabinetePeriod)
    : [];

  const hortas = gabineteIncludeHortas.checked
    ? allHortas
        .filter(locationMatches)
        .map(horta => ({
          ...horta,
          kind: "horta",
          displayName: horta.nome || "Horta"
        }))
    : [];

  const feiras = gabineteIncludeFeiras.checked
    ? allEvents
        .filter(isFeiraGabineteItem)
        .filter(evento =>
          locationMatches(evento) &&
          sameDay(parseDateBR(evento.data), selectedDate)
        )
        .map(evento => ({
          ...evento,
          kind: "feira",
          displayName:
            evento.feiraBase?.feira ||
            evento.evento ||
            "Feira Livre"
        }))
        .filter(isInGabinetePeriod)
    : [];

  gabineteResults = events.concat(hortas, feiras);
  gabineteSelectedIds = new Set();
  gabineteSelectedOrder = [];

  gabineteResultTitle.textContent = getGabineteLocationLabel();
  gabineteResultSubtitle.textContent =
    `${selectedDate.toLocaleDateString("pt-BR")} • ` +
    `${gabinetePeriod.options[gabinetePeriod.selectedIndex].textContent}`;

  gabineteBriefingTitle.value =
    `Visita a ${getGabineteLocationLabel()}`;

  gabineteQueryStep.hidden = true;
  gabineteResultsStep.hidden = false;
  gabineteSelectionBar.hidden = false;

  gabineteQueryStatus.textContent = "Consulta concluída.";
  gabineteQueryStatus.className = "gabinete-query-status";

  renderGabineteCategoryResults();
  updateGabineteSelection();
}

function getGabineteKindMeta(kind) {
  if (kind === "horta") {
    return { label: "Hortas", icon: "🌱", className: "kind-horta" };
  }

  if (kind === "feira") {
    return { label: "Feiras", icon: "🛒", className: "kind-feira" };
  }

  return { label: "Eventos", icon: "📅", className: "kind-evento" };
}

function getGabineteItemBadge(item) {
  if (item.kind === "evento") return item.horaInicio || "Evento";
  if (item.kind === "feira") {
    return item.horaInicio ||
      item.feiraBase?.horarioInicio ||
      "Feira";
  }
  return "Horta";
}

function getGabineteItemMeta(item) {
  if (item.kind === "evento") {
    return [
      item.secretariaResponsavel || item.tipoEvento,
      item.local || item.endereco,
      item.bairro,
      item.regiao
    ].filter(Boolean).join(" • ");
  }

  if (item.kind === "feira") {
    return [
      item.feiraBase?.dia,
      item.feiraBase?.horarioInicio && item.feiraBase?.horarioFim
        ? `${item.feiraBase.horarioInicio} às ${item.feiraBase.horarioFim}`
        : "",
      item.endereco || item.feiraBase?.trechos?.join(" / "),
      item.bairro,
      item.regiao
    ].filter(Boolean).join(" • ");
  }

  return [
    item.tipo,
    item.endereco,
    item.bairro,
    item.regiao
  ].filter(Boolean).join(" • ");
}

function renderGabineteCategoryResults() {
  gabineteCategoryResults.innerHTML = "";

  const enabledKinds = getGabineteCategoryConfig()
    .filter(category => category.enabled);

  enabledKinds.forEach(category => {
    const items = gabineteResults.filter(item => item.kind === category.kind);
    const meta = getGabineteKindMeta(category.kind);

    const section = document.createElement("section");
    section.className =
      `gabinete-category-result ${meta.className}`;

    const header = document.createElement("div");
    header.className = "gabinete-category-result-header";

    const title = document.createElement("div");
    title.className = "gabinete-category-result-title";
    title.innerHTML =
      `<strong>${meta.icon} ${meta.label}</strong>` +
      `<span>${items.length}</span>`;

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "select-category-btn";
    selectButton.textContent = items.length
      ? "Selecionar todos"
      : "Nenhum encontrado";
    selectButton.disabled = !items.length;
    selectButton.addEventListener("click", () => {
      items.forEach(item => selectGabineteItem(item));
      renderGabineteCategoryResults();
      updateGabineteSelection();
    });

    const collapseButton = document.createElement("button");
    collapseButton.type = "button";
    collapseButton.textContent = "Recolher";
    collapseButton.addEventListener("click", () => {
      section.classList.toggle("collapsed");
      collapseButton.textContent =
        section.classList.contains("collapsed")
          ? "Expandir"
          : "Recolher";
    });

    header.append(title, selectButton, collapseButton);

    const body = document.createElement("div");
    body.className = "gabinete-category-result-body";

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "gabinete-category-empty";
      empty.textContent =
        `Nenhum item de ${meta.label.toLowerCase()} encontrado nos locais selecionados.`;
      body.appendChild(empty);
    } else {
      items.forEach(item => {
        const id = gabineteItemId(item);
        const label = document.createElement("label");
        label.className = "gabinete-category-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = gabineteSelectedIds.has(id);
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectGabineteItem(item);
          } else {
            deselectGabineteItem(item);
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
        badge.textContent = getGabineteItemBadge(item);

        head.append(name, badge);

        const itemMeta = document.createElement("div");
        itemMeta.className = "gabinete-item-meta";
        itemMeta.textContent = getGabineteItemMeta(item);

        const note = document.createElement("input");
        note.type = "text";
        note.className = "gabinete-item-note";
        note.placeholder = "Observação do gabinete para este item";
        note.value = item.gabineteNote || "";
        note.addEventListener("click", event => event.preventDefault());
        note.addEventListener("input", () => {
          item.gabineteNote = note.value;
        });

        main.append(head, itemMeta, note);
        label.append(checkbox, main);
        body.appendChild(label);
      });
    }

    section.append(header, body);
    gabineteCategoryResults.appendChild(section);
  });
}

function selectGabineteItem(item) {
  const id = gabineteItemId(item);
  gabineteSelectedIds.add(id);

  if (!gabineteSelectedOrder.includes(id)) {
    gabineteSelectedOrder.push(id);
  }
}

function deselectGabineteItem(item) {
  const id = gabineteItemId(item);
  gabineteSelectedIds.delete(id);
  gabineteSelectedOrder =
    gabineteSelectedOrder.filter(selectedId => selectedId !== id);
}

function renderGabineteSelectedOrder() {
  gabineteSelectedOrderList.innerHTML = "";

  const selectedItems = getSelectedGabineteItems();

  gabineteSelectedOrderSection.hidden = selectedItems.length === 0;

  selectedItems.forEach((item, index) => {
    const id = gabineteItemId(item);
    const row = document.createElement("div");
    row.className = "gabinete-order-item";
    row.draggable = true;
    row.dataset.itemId = id;

    const handle = document.createElement("span");
    handle.className = "gabinete-order-handle";
    handle.textContent = "☰";

    const number = document.createElement("span");
    number.className = "gabinete-order-number";
    number.textContent = String(index + 1);

    const name = document.createElement("strong");
    name.textContent =
      `${getGabineteKindMeta(item.kind).icon} ${item.displayName}`;

    row.append(handle, number, name);

    row.addEventListener("dragstart", () => {
      row.classList.add("dragging");
    });

    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      syncGabineteOrderFromDom();
    });

    row.addEventListener("dragover", event => {
      event.preventDefault();
      const dragging = gabineteSelectedOrderList.querySelector(".dragging");
      if (!dragging || dragging === row) return;

      const bounds = row.getBoundingClientRect();
      const after = event.clientY > bounds.top + bounds.height / 2;

      gabineteSelectedOrderList.insertBefore(
        dragging,
        after ? row.nextSibling : row
      );
    });

    gabineteSelectedOrderList.appendChild(row);
  });
}

function syncGabineteOrderFromDom() {
  gabineteSelectedOrder = [
    ...gabineteSelectedOrderList.querySelectorAll(".gabinete-order-item")
  ].map(row => row.dataset.itemId);

  renderGabineteSelectedOrder();
}

function updateGabineteSelectionSummary() {
  const selectedItems = getSelectedGabineteItems();
  const counts = {};

  selectedItems.forEach(item => {
    counts[item.kind] = (counts[item.kind] || 0) + 1;
  });

  const rows = ["evento", "horta", "feira"]
    .filter(kind => counts[kind])
    .map(kind => {
      const meta = getGabineteKindMeta(kind);
      return `
        <div class="gabinete-selection-summary-row">
          <span>${meta.icon} ${meta.label}</span>
          <strong>${counts[kind]}</strong>
        </div>
      `;
    })
    .join("");

  gabineteSelectionSummary.innerHTML = selectedItems.length
    ? rows + `
      <div class="gabinete-selection-summary-row total">
        <span>Total</span>
        <strong>${selectedItems.length}</strong>
      </div>
    `
    : "";
}

function updateGabineteSelection() {
  const count = gabineteSelectedIds.size;
  gabineteSelectedCount.textContent = String(count);
  gabinetePreviewBtn.disabled = count === 0;

  renderGabineteSelectedOrder();
  updateGabineteSelectionSummary();
}

function resetGabineteQuery() {
  gabineteResults = [];
  gabineteSelectedIds = new Set();
  gabineteSelectedOrder = [];
  gabineteResultsStep.hidden = true;
  gabineteSelectionBar.hidden = true;
  gabineteQueryStep.hidden = false;
  gabineteCategoryResults.innerHTML = "";
  gabineteSelectedOrderList.innerHTML = "";
  gabineteSelectionSummary.innerHTML = "";
  gabineteSelectedOrderSection.hidden = true;
  updateGabineteSelection();
}

function getSelectedGabineteItems() {
  const itemMap = new Map(
    gabineteResults.map(item => [gabineteItemId(item), item])
  );

  return gabineteSelectedOrder
    .filter(id => gabineteSelectedIds.has(id))
    .map(id => itemMap.get(id))
    .filter(Boolean);
}

function sanitizeFilenamePart(value) {
  return String(value || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatFilenameDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

function getGabinetePdfFilename() {
  const selectedDate = new Date(gabineteDate.value + "T00:00:00");
  const location = sanitizeFilenamePart(getGabineteLocationLabel()) || "Diadema";
  const recipient = sanitizeFilenamePart(
    [gabineteRecipientRole.value, gabineteRecipientName.value]
      .filter(Boolean)
      .join(" ")
  );
  const parts = ["Agenda Executiva"];
  if (recipient) parts.push(recipient);
  parts.push(location, formatFilenameDate(selectedDate));
  return parts.join(" - ") + ".pdf";
}

function getGabineteShareSummary() {
  const items = getSelectedGabineteItems();
  const selectedDate = new Date(gabineteDate.value + "T00:00:00");
  const location = getGabineteLocationLabel();
  const eventCount = items.filter(item => item.kind === "evento").length;
  const hortaCount = items.filter(item => item.kind === "horta").length;
  const feiraCount = items.filter(item => item.kind === "feira").length;
  const recipient = [
    gabineteRecipientRole.value.trim(),
    gabineteRecipientName.value.trim()
  ].filter(Boolean).join(" ");

  const lines = [
    "📅 Agenda Executiva",
    ""
  ];

  if (recipient) {
    lines.push(`👤 ${recipient}`, "");
  }

  lines.push(
    `📍 ${location}`,
    `📆 ${selectedDate.toLocaleDateString("pt-BR")}`,
    ""
  );

  if (eventCount) lines.push(`• ${eventCount} evento(s)`);
  if (hortaCount) lines.push(`• ${hortaCount} horta(s)`);
  if (feiraCount) lines.push(`• ${feiraCount} feira(s)`);
  lines.push(
    `• ${items.length} item(ns) selecionado(s)`,
    "",
    "Segue o briefing completo em PDF.",
    "",
    "GeoDiadema",
    "Trabalhando por Diadema"
  );

  return lines.join("\n");
}

function getBriefingQrUrl(briefingCode) {
  const url = new URL(window.location.href);
  url.searchParams.set("briefing", briefingCode);
  url.searchParams.set("local", getGabineteLocationLabel());
  url.searchParams.set("data", gabineteDate.value);
  return url.toString();
}

function renderBriefingQrCode(briefingCode) {
  const target = document.getElementById("briefingQrCode");
  if (!target || typeof QRCode === "undefined") return;

  target.innerHTML = "";

  new QRCode(target, {
    text: getBriefingQrUrl(briefingCode),
    width: 92,
    height: 92,
    correctLevel: QRCode.CorrectLevel.M
  });
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
  const recipientName = gabineteRecipientName.value.trim();
  const recipientRole = gabineteRecipientRole.value.trim();
  const recipientDepartment = gabineteRecipientDepartment.value.trim();
  const recipientLabel = [recipientRole, recipientName].filter(Boolean).join(" ").trim();

  const eventCount = items.filter(item => item.kind === "evento").length;
  const hortaCount = items.filter(item => item.kind === "horta").length;
  const feiraCount = items.filter(item => item.kind === "feira").length;

  const startTimes = items
    .filter(item => item.kind === "evento")
    .map(item => timeToMinutes(item.horaInicio))
    .filter(value => value !== null)
    .sort((a, b) => a - b);

  const endTimes = items
    .filter(item => item.kind === "evento")
    .map(item => timeToMinutes(item.horaFim || item.horaInicio))
    .filter(value => value !== null)
    .sort((a, b) => a - b);

  const minutesToTime = minutes => {
    if (minutes === undefined || minutes === null) return "A definir";
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    return `${hours}:${mins}`;
  };

  const briefingCode =
    "BR-" +
    selectedDate.getFullYear() +
    "-" +
    String(Date.now()).slice(-6);

  const agendaRange = startTimes.length
    ? `${minutesToTime(startTimes[0])} às ${minutesToTime(endTimes[endTimes.length - 1])}`
    : "Sem horário definido";

  const itemHtml = items.map((item, index) => {
    const time = item.kind === "evento" || item.kind === "feira"
      ? (item.horaInicio || item.feiraBase?.horarioInicio || "A definir")
      : "Ponto territorial";

    const category = item.kind === "evento"
      ? (item.tipoEvento || item.categoria || "Evento")
      : item.kind === "feira"
        ? "Feira Livre"
        : (item.tipo || "Horta");

    const place = [
      item.local || item.endereco,
      item.bairro,
      item.regiao
    ].filter(Boolean).join(" • ");

    const secretaria = item.kind === "evento"
      ? (item.secretariaResponsavel || item.secretaria || "")
      : item.kind === "feira"
        ? (item.secretariaResponsavel || "Abastecimento")
        : "";

    return `
      <section class="briefing-card">
        <div class="briefing-card-number">${index + 1}</div>
        <div class="briefing-card-time">${escapeHtml(time)}</div>
        <div class="briefing-card-content">
          <div class="briefing-card-category">${escapeHtml(category)}</div>
          <h3>${escapeHtml(item.displayName)}</h3>
          ${secretaria ? `<p><strong>Secretaria:</strong> ${escapeHtml(secretaria)}</p>` : ""}
          <p><strong>Local:</strong> ${escapeHtml(place || "-")}</p>
          ${item.gabineteNote ? `
            <p class="briefing-card-note">
              <strong>Observação do gabinete:</strong>
              ${escapeHtml(item.gabineteNote)}
            </p>
          ` : ""}
          <p>□ Confirmado &nbsp;&nbsp; □ Alterado &nbsp;&nbsp; □ Cancelado</p>
        </div>
      </section>
    `;
  }).join("");

  gabinetePreviewDocument.innerHTML = `
    <header class="briefing-print-header">
      <div class="briefing-print-brand">
        <h1>GeoDiadema</h1>
        <p>Trabalhando por Diadema</p>
      </div>

      <div class="briefing-print-meta">
        <span class="briefing-internal">Documento de uso interno</span>
        <span class="briefing-code">${escapeHtml(briefingCode)}</span>
      </div>
    </header>

    <section class="briefing-print-title">
      <div class="eyebrow">AGENDA EXECUTIVA</div>
      <h2>${escapeHtml(title)}</h2>
      ${objective ? `<p><strong>Objetivo:</strong> ${escapeHtml(objective)}</p>` : ""}
    </section>

    <table class="briefing-info-table">
      <tbody>
        ${recipientLabel ? `
        <tr>
          <th>Destinatário</th>
          <td>${escapeHtml(recipientLabel)}</td>
        </tr>
        ` : ""}
        ${recipientDepartment ? `
        <tr>
          <th>Secretaria/Setor</th>
          <td>${escapeHtml(recipientDepartment)}</td>
        </tr>
        ` : ""}
        <tr>
          <th>Data</th>
          <td>${selectedDate.toLocaleDateString("pt-BR")}</td>
        </tr>
        <tr>
          <th>Local</th>
          <td>${escapeHtml(location)}</td>
        </tr>
        <tr>
          <th>Período</th>
          <td>${escapeHtml(gabinetePeriod.options[gabinetePeriod.selectedIndex].textContent)}</td>
        </tr>
        <tr>
          <th>Horário previsto</th>
          <td>${escapeHtml(agendaRange)}</td>
        </tr>
        <tr>
          <th>Quantidade de itens</th>
          <td>${items.length}</td>
        </tr>
      </tbody>
    </table>

    <section class="briefing-summary-section">
      <div class="briefing-section-title">
        <span>VISÃO GERAL</span>
        <h3>Resumo executivo</h3>
      </div>

      <ul class="briefing-summary-list">
        ${eventCount ? `<li><span>Eventos</span><strong>${eventCount}</strong></li>` : ""}
        ${hortaCount ? `<li><span>Hortas</span><strong>${hortaCount}</strong></li>` : ""}
        ${feiraCount ? `<li><span>Feiras</span><strong>${feiraCount}</strong></li>` : ""}
        <li><span>Total de itens selecionados</span><strong>${items.length}</strong></li>
        <li><span>Agenda prevista</span><strong>${escapeHtml(agendaRange)}</strong></li>
      </ul>
    </section>

    <section class="briefing-agenda-print">
      <div class="briefing-section-title">
        <span>PROGRAMAÇÃO</span>
        <h3>Agenda detalhada</h3>
      </div>

      <div class="briefing-cards">
        ${itemHtml}
      </div>
    </section>

    ${notes ? `
      <section class="briefing-general-notes">
        <strong>Observações gerais do gabinete</strong>
        <p>${escapeHtml(notes)}</p>
      </section>
    ` : ""}

    <section class="briefing-map-placeholder">
      <div>
        <strong>🗺️ Mapa executivo</strong>
        <p>O mini mapa com os pontos selecionados será incluído na próxima etapa.</p>
      </div>
    </section>

    <section class="briefing-annotations">
      <h3>Anotações do Gabinete</h3>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </section>

    <footer class="briefing-qr-footer">
      <div>
        <strong>GeoDiadema</strong><br>
        Documento de apoio ao Gabinete<br>
        Gerado em ${new Date().toLocaleString("pt-BR")}
      </div>

      <div class="briefing-qr-box">
        <div id="briefingQrCode"></div>
        <span>Abrir no GeoDiadema</span>
      </div>
    </footer>
  `;

  gabinetePreview.dataset.briefingCode = briefingCode;
  gabinetePreview.classList.add("open");
  gabinetePreview.setAttribute("aria-hidden", "false");

  setTimeout(() => renderBriefingQrCode(briefingCode), 50);
}


async function createGabinetePdfBlob() {
  if (
    typeof html2canvas === "undefined" ||
    !window.jspdf ||
    !window.jspdf.jsPDF
  ) {
    throw new Error(
      "Os recursos de PDF ainda não carregaram. Atualize a página e tente novamente."
    );
  }

  document.body.classList.add("pdf-generating");

  try {
    const canvas = await html2canvas(gabinetePreviewDocument, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: gabinetePreviewDocument.scrollWidth
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const imageHeight = (canvas.height * usableWidth) / canvas.width;
    const imageData = canvas.toDataURL("image/jpeg", 0.94);

    let position = margin;
    let remainingHeight = imageHeight;

    pdf.addImage(
      imageData,
      "JPEG",
      margin,
      position,
      usableWidth,
      imageHeight,
      undefined,
      "FAST"
    );

    remainingHeight -= pageHeight - margin * 2;

    while (remainingHeight > 0) {
      pdf.addPage();
      position = margin - (imageHeight - remainingHeight);

      pdf.addImage(
        imageData,
        "JPEG",
        margin,
        position,
        usableWidth,
        imageHeight,
        undefined,
        "FAST"
      );

      remainingHeight -= pageHeight - margin * 2;
    }

    return pdf.output("blob");
  } finally {
    document.body.classList.remove("pdf-generating");
  }
}

async function downloadGabinetePdf() {
  downloadGabinetePdfBtn.disabled = true;
  downloadGabinetePdfBtn.textContent = "Gerando PDF...";

  try {
    const blob = await createGabinetePdfBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getGabinetePdfFilename();
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (error) {
    console.error(error);
    window.alert(error.message);
  } finally {
    downloadGabinetePdfBtn.disabled = false;
    downloadGabinetePdfBtn.textContent = "📄 Baixar PDF";
  }
}

async function shareGabineteWhatsapp() {
  shareGabineteWhatsappBtn.disabled = true;
  shareGabineteWhatsappBtn.textContent = "Preparando...";

  const message = getGabineteShareSummary();
  const filename = getGabinetePdfFilename();

  try {
    const blob = await createGabinetePdfBlob();
    const file = new File([blob], filename, {
      type: "application/pdf"
    });

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        title: filename.replace(/\.pdf$/i, ""),
        text: message,
        files: [file]
      });
      return;
    }

    // Computadores e navegadores sem compartilhamento de arquivo:
    // baixa o PDF e abre o WhatsApp com a mensagem pronta.
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1500);

    const whatsappUrl =
      "https://wa.me/?text=" + encodeURIComponent(message);

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    window.alert(
      "O PDF foi baixado. No WhatsApp, anexe o arquivo com o nome:\n\n" +
      filename
    );
  } catch (error) {
    console.error(error);

    // Even if PDF fails, still allow sharing the summary.
    const whatsappUrl =
      "https://wa.me/?text=" + encodeURIComponent(message);

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  } finally {
    shareGabineteWhatsappBtn.disabled = false;
    shareGabineteWhatsappBtn.textContent = "📱 WhatsApp";
  }
}

function closeGabinetePreview() {
  gabinetePreview.classList.remove("open");
  gabinetePreview.setAttribute("aria-hidden", "true");
}


function getDailyReportFilteredEvents() {
  const selectedDate = dailyReportDate.value
    ? new Date(dailyReportDate.value + "T00:00:00")
    : new Date();

  const allowedStatus = event => {
    const status = normalize(event.status);
    return !status.includes("cancel") && !status.includes("encerr");
  };

  const events = allEvents
    .filter(event => sameDay(parseDateBR(event.data), selectedDate))
    .filter(allowedStatus);

  return [...events].sort((a, b) => {
    if (dailyReportSort.value === "regiao") {
      return String(a.regiao || "").localeCompare(String(b.regiao || ""), "pt-BR") ||
        (timeToMinutes(a.horaInicio) ?? 9999) - (timeToMinutes(b.horaInicio) ?? 9999);
    }

    if (dailyReportSort.value === "secretaria") {
      return String(a.secretariaResponsavel || "").localeCompare(
        String(b.secretariaResponsavel || ""), "pt-BR"
      ) || (timeToMinutes(a.horaInicio) ?? 9999) - (timeToMinutes(b.horaInicio) ?? 9999);
    }

    return (timeToMinutes(a.horaInicio) ?? 9999) -
      (timeToMinutes(b.horaInicio) ?? 9999);
  });
}

function renderDailyReport() {
  dailyReportEvents = getDailyReportFilteredEvents();
  dailyReportList.innerHTML = "";

  dailyReportStatus.textContent =
    `${dailyReportEvents.length} evento(s) encontrado(s).`;

  if (!dailyReportEvents.length) {
    dailyReportList.innerHTML =
      '<div class="gabinete-empty">Nenhum evento encontrado para esta data.</div>';
    return;
  }

  dailyReportEvents.forEach(event => {
    const card = document.createElement("article");
    card.className = "daily-report-card";
    card.innerHTML = `
      <h3>${escapeHtml(event.evento || "Evento")}</h3>
      <p><strong>Horário:</strong> ${escapeHtml(event.horaInicio || "-")} às ${escapeHtml(event.horaFim || "-")}</p>
      <p><strong>Secretaria:</strong> ${escapeHtml(event.secretariaResponsavel || "-")}</p>
      <p><strong>Local:</strong> ${escapeHtml(event.local || event.endereco || "-")}</p>
      <p><strong>Bairro/Região:</strong> ${escapeHtml(event.bairro || "-")} / ${escapeHtml(event.regiao || "-")}</p>
      <p><strong>Status:</strong> ${escapeHtml(event.status || "-")}</p>
      ${event.observacoes ? `<p><strong>Observações:</strong> ${escapeHtml(event.observacoes)}</p>` : ""}
    `;
    dailyReportList.appendChild(card);
  });
}

function openDailyReportPanel() {
  closeGabinetePanel();
  closeExplorePanel();
  closeDashboard();
  closeCalendar();

  dailyReportPanel.classList.add("open");
  dailyReportPanel.setAttribute("aria-hidden", "false");
  dailyReportBackdrop.hidden = false;

  if (!dailyReportDate.value) {
    dailyReportDate.value = formatDateInputValue(new Date());
  }

  renderDailyReport();
}

function closeDailyReportPanel() {
  dailyReportPanel.classList.remove("open");
  dailyReportPanel.setAttribute("aria-hidden", "true");
  dailyReportBackdrop.hidden = true;
}

function buildDailyReportHtml() {
  const date = new Date(dailyReportDate.value + "T00:00:00");
  const events = getDailyReportFilteredEvents();

  const cards = events.map((event, index) => `
    <section class="briefing-card">
      <div class="briefing-card-number">${index + 1}</div>
      <div class="briefing-card-time">${escapeHtml(event.horaInicio || "A definir")}</div>
      <div class="briefing-card-content">
        <div class="briefing-card-category">${escapeHtml(event.secretariaResponsavel || "Evento")}</div>
        <h3>${escapeHtml(event.evento || "Evento")}</h3>
        <p><strong>Horário:</strong> ${escapeHtml(event.horaInicio || "-")} às ${escapeHtml(event.horaFim || "-")}</p>
        <p><strong>Local:</strong> ${escapeHtml(event.local || event.endereco || "-")}</p>
        <p><strong>Bairro/Região:</strong> ${escapeHtml(event.bairro || "-")} / ${escapeHtml(event.regiao || "-")}</p>
        <p><strong>Status:</strong> ${escapeHtml(event.status || "-")}</p>
        ${event.observacoes ? `<p><strong>Observações:</strong> ${escapeHtml(event.observacoes)}</p>` : ""}
      </div>
    </section>
  `).join("");

  return `
    <header class="briefing-print-header">
      <div class="briefing-print-brand">
        <h1>GeoDiadema</h1>
        <p>Trabalhando por Diadema</p>
      </div>
      <div class="briefing-print-meta">
        <span class="briefing-internal">Relatório diário</span>
      </div>
    </header>

    <section class="briefing-print-title">
      <div class="eyebrow">EVENTOS DO DIA</div>
      <h2>${date.toLocaleDateString("pt-BR")}</h2>
    </section>

    <table class="briefing-info-table">
      <tbody>
        <tr><th>Data</th><td>${date.toLocaleDateString("pt-BR")}</td></tr>
        <tr><th>Total de eventos</th><td>${events.length}</td></tr>
      </tbody>
    </table>

    <section class="briefing-agenda-print">
      <div class="briefing-section-title">
        <span>PROGRAMAÇÃO</span>
        <h3>Eventos do dia</h3>
      </div>
      <div class="briefing-cards">${cards}</div>
    </section>

    <footer class="briefing-footer">
      Documento gerado pelo GeoDiadema em ${new Date().toLocaleString("pt-BR")}
    </footer>
  `;
}

async function generateDailyReportPdf(download = true) {
  const original = gabinetePreviewDocument.innerHTML;
  gabinetePreviewDocument.innerHTML = buildDailyReportHtml();

  try {
    const blob = await createGabinetePdfBlob();

    if (download) {
      const date = new Date(dailyReportDate.value + "T00:00:00");
      const filename = `Eventos do Dia - ${formatFilenameDate(date)}.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    return blob;
  } finally {
    gabinetePreviewDocument.innerHTML = original;
  }
}

function getDailyReportWhatsappMessage() {
  const date = new Date(dailyReportDate.value + "T00:00:00");
  const events = getDailyReportFilteredEvents();
  const preview = events.slice(0, 8).map(event =>
    `• ${event.horaInicio || "--:--"} — ${event.evento || "Evento"} — ${event.regiao || event.bairro || ""}`
  );

  const lines = [
    `📅 Eventos do dia — ${date.toLocaleDateString("pt-BR")}`,
    "",
    `Total: ${events.length} evento(s)`,
    "",
    ...preview
  ];

  if (events.length > 8) {
    lines.push(`• e mais ${events.length - 8} evento(s)`);
  }

  lines.push(
    "",
    "Segue o relatório completo em PDF.",
    "",
    "GeoDiadema",
    "Trabalhando por Diadema"
  );

  return lines.join("\n");
}

function getDataCenterPendingIssues(item){
 const issues=[];

 const add=(field,label,severity,targetId,message)=>{
  issues.push({field,label,severity,targetId,message});
 };

 if(!String(item.evento||"").trim()){
  add("nome","Nome do evento","critical","eventNameInput","Informe o nome do evento.");
 }
 if(!String(item.data||"").trim()){
  add("data","Data","critical","eventDateInput","Informe a data do evento.");
 }
 if(!String(item.horaInicio||"").trim()){
  add("hora inicial","Hora inicial","critical","eventStartInput","Informe o horário inicial.");
 }
 if(!String(item.horaFim||"").trim()){
  add("hora final","Hora final","important","eventEndInput","Informe o horário final.");
 }
 if(!String(item.bairro||"").trim()){
  add("bairro","Bairro","critical","eventBairroInput","Informe o bairro do evento.");
 }
 if(!String(getItemEffectiveRegion(item)||"").trim()){
  add("região","Região","important","eventRegionInput","Informe a região ou confirme o bairro.");
 }
 if(!String(item.endereco||item.local||"").trim()){
  add("endereço/local","Endereço ou local","critical","eventAddressInput","Informe o endereço ou o nome do local.");
 }
 if(!String(item.secretariaResponsavel||item.secretaria||"").trim()){
  add("secretaria","Secretaria responsável","important","eventSecretariaInput","Informe a secretaria responsável.");
 }

 const lat=parseCoordinate(item.latitude);
 const lng=parseCoordinate(item.longitude);
 if(lat===null||lng===null){
  add("coordenadas","Coordenadas","critical","eventLatitudeInput","Informe latitude e longitude válidas.");
 }

 if(!String(item.responsavel||"").trim()){
  add("responsável","Responsável","complementary","eventResponsibleInput","Informe o responsável, se disponível.");
 }
 if(!String(item.telefone||"").trim()){
  add("telefone","Telefone","complementary","eventPhoneInput","Informe o telefone, se disponível.");
 }
 if(!String(item.observacoes||"").trim()){
  add("observações","Observações","complementary","eventNotesInput","Inclua observações úteis, se houver.");
 }
 if(!String(item.publicoEstimado||"").trim()){
  add("público estimado","Público estimado","complementary","eventPublicInput","Informe o público estimado, se disponível.");
 }

 return issues;
}

function getDataCenterPendingFields(item){
 return getDataCenterPendingIssues(item).map(issue=>issue.field);
}

function getPendingSeverityRank(severity){
 if(severity==="critical")return 3;
 if(severity==="important")return 2;
 return 1;
}

function getRecordHighestSeverity(item){
 const issues=getDataCenterPendingIssues(item);
 if(issues.some(issue=>issue.severity==="critical"))return "critical";
 if(issues.some(issue=>issue.severity==="important"))return "important";
 return issues.length?"complementary":"";
}

function getPendingSeverityLabel(severity){
 if(severity==="critical")return "🔴 Crítica";
 if(severity==="important")return "🟡 Importante";
 return "🔵 Complementar";
}

function getDataCenterFeiras(){return allEvents.filter(isFeiraGabineteItem)}
function calculateDataQuality(){
 const records=allEvents.filter(item=>!isFeiraGabineteItem(item));
 const requiredFieldsPerRecord=9;
 const totalRequired=records.length*requiredFieldsPerRecord;

 if(!totalRequired){
  return{
   percent:100,
   pendingRecords:0,
   missingFields:0,
   critical:0,
   important:0,
   complementary:0
  };
 }

 let requiredMissing=0;
 let critical=0;
 let important=0;
 let complementary=0;

 records.forEach(item=>{
  const issues=getDataCenterPendingIssues(item);

  requiredMissing+=issues.filter(
   issue=>issue.severity==="critical"||issue.severity==="important"
  ).length;

  critical+=issues.filter(issue=>issue.severity==="critical").length;
  important+=issues.filter(issue=>issue.severity==="important").length;
  complementary+=issues.filter(issue=>issue.severity==="complementary").length;
 });

 const pendingRecords=records.filter(
  item=>getDataCenterPendingIssues(item).length
 ).length;

 const percent=Math.max(
  0,
  Math.round(((totalRequired-requiredMissing)/totalRequired)*100)
 );

 return{
  percent,
  pendingRecords,
  missingFields:critical+important+complementary,
  critical,
  important,
  complementary
 };
}

function populateDataCenterFilters(){
 const regs=dedupeCanonicalTerritories(allEvents.map(getItemEffectiveRegion));
 dataCenterRegionFilter.innerHTML='<option value="">Todas as regiões</option>'+regs.map(x=>`<option>${escapeHtml(x)}</option>`).join("");
 const st=dedupeCanonicalTerritories(allEvents.map(x=>x.status));
 dataCenterStatusFilter.innerHTML='<option value="">Todos os status</option>'+st.map(x=>`<option>${escapeHtml(x)}</option>`).join("");
}
function updateDataCenterIndicators(){
 const e=allEvents.filter(x=>!isFeiraGabineteItem(x)),q=calculateDataQuality();
 dataCenterEventsCount.textContent=e.length;dataCenterHortasCount.textContent=allHortas.length;dataCenterFeirasCount.textContent=getDataCenterFeiras().length;dataCenterPendingCount.textContent=q.pendingRecords;
 dataQualityPercent.textContent=q.percent+"%";dataQualityBarFill.style.width=q.percent+"%";
 dataQualitySummary.innerHTML=
  `${e.length} evento(s) analisado(s) • ${q.pendingRecords} registro(s) com pendência`+
  `<div class="data-center-pending-summary">`+
  `<div><strong>${q.critical}</strong><span>🔴 Críticas</span></div>`+
  `<div><strong>${q.important}</strong><span>🟡 Importantes</span></div>`+
  `<div><strong>${q.complementary}</strong><span>🔵 Complementares</span></div>`+
  `</div>`;
}
function getDataCenterModuleItems(){
 if(dataCenterActiveModule==="hortas")return allHortas;
 if(dataCenterActiveModule==="feiras")return getDataCenterFeiras();
 const e=allEvents.filter(x=>!isFeiraGabineteItem(x));
 return dataCenterActiveModule==="pending"?e.filter(x=>getDataCenterPendingFields(x).length):e;
}
function getDataCenterRecordName(x){return dataCenterActiveModule==="hortas"?(x.nome||"Horta"):dataCenterActiveModule==="feiras"?(x.feiraBase?.feira||x.evento||"Feira Livre"):(x.evento||"Evento sem nome")}
function renderDataCenterList(){
 const search=normalize(dataCenterSearch.value);
 const region=normalize(dataCenterRegionFilter.value);
 const status=normalize(dataCenterStatusFilter.value);
 const priority=dataCenterPriorityFilter.value;

 const items=getDataCenterModuleItems()
  .filter(item=>{
   const hay=normalize([
    getDataCenterRecordName(item),
    item.secretariaResponsavel,
    item.bairro,
    getItemEffectiveRegion(item),
    item.local,
    item.endereco,
    item.status
   ].filter(Boolean).join(" "));

   if(search&&!hay.includes(search))return false;
   if(region&&normalize(getItemEffectiveRegion(item))!==region)return false;
   if(status&&normalize(item.status)!==status)return false;

   if(dataCenterActiveModule==="pending"&&priority){
    return getDataCenterPendingIssues(item).some(
     issue=>issue.severity===priority
    );
   }

   return true;
  })
  .sort((a,b)=>{
   if(dataCenterActiveModule==="pending"){
    const severityDiff=
     getPendingSeverityRank(getRecordHighestSeverity(b))-
     getPendingSeverityRank(getRecordHighestSeverity(a));

    if(severityDiff)return severityDiff;
   }

   return getDataCenterRecordName(a).localeCompare(
    getDataCenterRecordName(b),
    "pt-BR"
   );
  });

 dataCenterList.innerHTML="";

 if(!items.length){
  dataCenterList.innerHTML=
   '<div class="gabinete-empty">Nenhum registro encontrado.</div>';
  return;
 }

 items.slice(0,250).forEach(item=>{
  const issues=dataCenterActiveModule==="pending"
   ? getDataCenterPendingIssues(item)
   : [];

  const severity=getRecordHighestSeverity(item);
  const card=document.createElement("article");

  card.className=
   "data-center-record"+
   (issues.length
    ? ` data-center-pending severity-${severity}`
    : "");

  const issuesHtml=issues.length
   ? `
    <div class="pending-severity-badge ${severity}">
      ${getPendingSeverityLabel(severity)}
    </div>
    <div class="pending-issue-list">
      ${issues.map(issue=>`
        <div class="pending-issue">
          <span>${issue.severity==="critical"?"🔴":issue.severity==="important"?"🟡":"🔵"}</span>
          <div>
            <strong>${escapeHtml(issue.label)}:</strong>
            ${escapeHtml(issue.message)}
          </div>
        </div>
      `).join("")}
    </div>
   `
   : "";

  card.innerHTML=`
   <div>
    <h3>${escapeHtml(getDataCenterRecordName(item))}</h3>
    <p>
     <strong>Data:</strong> ${escapeHtml(item.data||"-")} •
     <strong>Horário:</strong> ${escapeHtml(item.horaInicio||"-")}
     às ${escapeHtml(item.horaFim||"-")}
    </p>
    <p>
     <strong>Secretaria:</strong>
     ${escapeHtml(item.secretariaResponsavel||item.secretaria||"-")} •
     <strong>Território:</strong>
     ${escapeHtml(item.bairro||"-")} /
     ${escapeHtml(getItemEffectiveRegion(item)||"-")}
    </p>
    <p>
     <strong>Local:</strong>
     ${escapeHtml(item.local||item.endereco||"-")}
    </p>
    ${issuesHtml}
   </div>
   <div class="data-center-record-actions">
    <button class="edit-record-btn" type="button">
     ${issues.length?"✏️ Corrigir agora":"✏️ Editar"}
    </button>
    <button class="duplicate-record-btn" type="button">📄 Duplicar</button>
    ${issues.some(issue=>issue.field==="coordenadas")?`
      <button class="map-record-btn" type="button">📍 Abrir no mapa</button>
    `:""}
   </div>
  `;

  dataCenterList.appendChild(card);

  const editButton=card.querySelector(".edit-record-btn");
  const duplicateButton=card.querySelector(".duplicate-record-btn");
  const mapButton=card.querySelector(".map-record-btn");

  editButton.addEventListener("click",()=>{
   const firstIssue=issues.length?issues[0]:null;

   if(dataCenterActiveModule==="hortas"){
    openHortaForm("edit",item);
   }else{
    openEventForm("edit",item,firstIssue);
   }
  });

  duplicateButton.addEventListener("click",()=>{
   if(dataCenterActiveModule==="hortas"){
    openHortaForm("duplicate",item);
   }else{
    openEventForm("duplicate",item);
   }
  });

  if(mapButton){
   mapButton.addEventListener("click",()=>{
    closeDataCenterPanel();

    const lat=parseCoordinate(item.latitude);
    const lng=parseCoordinate(item.longitude);

    if(lat!==null&&lng!==null){
     map.setView([lat,lng],17);
    }else{
     searchInput.value=item.evento||item.local||item.endereco||"";
     renderMap();
     window.alert(
      "O registro ainda não possui coordenadas. "+
      "O mapa foi filtrado pelo nome/local para ajudar na conferência."
     );
    }
   });
  }
 });
}

function refreshDataCenter(){populateDataCenterFilters();updateDataCenterIndicators();renderDataCenterList()}
function openDataCenterPanel(){closeGabinetePanel();closeDailyReportPanel();closeExplorePanel();closeDashboard();closeCalendar();dataCenterPanel.classList.add("open");dataCenterPanel.setAttribute("aria-hidden","false");dataCenterBackdrop.hidden=false;if(dataCenterUnlocked){dataCenterAccessStep.hidden=true;dataCenterContent.hidden=false;refreshDataCenter()}}
function closeDataCenterPanel(){dataCenterPanel.classList.remove("open");dataCenterPanel.setAttribute("aria-hidden","true");dataCenterBackdrop.hidden=true}
function unlockDataCenter(){if(dataCenterAccessCode.value.trim()!=="3648"){dataCenterAccessStatus.textContent="Código administrativo incorreto.";return}dataCenterUnlocked=true;dataCenterAccessStep.hidden=true;dataCenterContent.hidden=false;dataCenterAccessStatus.textContent="";dataCenterAccessCode.value="";refreshDataCenter()}


function formatDateForInput(value){
  const parsed=parseDateBR(value);
  if(!parsed||Number.isNaN(parsed.getTime()))return "";
  return formatDateInputValue(parsed);
}

function createTimeOptions(selectValue=""){
 const options=[];
 for(let hour=0;hour<24;hour++){
  for(let minute=0;minute<60;minute+=15){
   const value=
    String(hour).padStart(2,"0")+":"+
    String(minute).padStart(2,"0");
   options.push(value);
  }
 }
 return options;
}

function fillSmartTimeInput(input,currentValue=""){
 input.setAttribute("list",input.id+"Suggestions");

 let datalist=document.getElementById(input.id+"Suggestions");

 if(!datalist){
  datalist=document.createElement("datalist");
  datalist.id=input.id+"Suggestions";
  input.insertAdjacentElement("afterend",datalist);
 }

 datalist.innerHTML=createTimeOptions()
  .map(value=>`<option value="${value}"></option>`)
  .join("");

 input.value=currentValue||"";
}

function fillEventFormSuggestions(){
 const regions=dedupeCanonicalTerritories(
  [...allEvents,...allHortas].map(item=>getItemEffectiveRegion(item))
 );

 const bairros=dedupeCanonicalTerritories(
  [...allEvents,...allHortas].map(item=>item.bairro)
 );

 const secretarias=dedupeCanonicalTerritories(
  allEvents.map(item=>item.secretariaResponsavel||item.secretaria)
 );

 const tipos=dedupeCanonicalTerritories(
  allEvents.map(item=>item.tipoEvento||item.categoria)
 );

 eventRegionInput.innerHTML=
  '<option value="">Selecione</option>'+
  regions.map(value=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");

 eventBairroInput.innerHTML=
  '<option value="">Selecione</option>'+
  bairros.map(value=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");

 eventSecretariaSuggestions.innerHTML=secretarias
  .map(value=>`<option value="${escapeHtml(value)}"></option>`)
  .join("");

 eventTypeSuggestions.innerHTML=tipos
  .map(value=>`<option value="${escapeHtml(value)}"></option>`)
  .join("");

 fillSmartTimeInput(eventStartInput,eventStartInput.value);
 fillSmartTimeInput(eventEndInput,eventEndInput.value);
}

function inferRegionFromBairroSelection(){
 const bairro=eventBairroInput.value;
 if(!bairro)return;

 const regionMap=buildBairroRegionMap();
 const inferred=regionMap.get(normalize(bairro))||"";

 if(inferred){
  eventRegionInput.value=inferred;
  eventRegionInput.classList.add("event-smart-filled");

  setTimeout(()=>{
   eventRegionInput.classList.remove("event-smart-filled");
  },1200);
 }
}

function resetEventForm(){
  eventForm.reset();
  eventFormOriginalId.value="";
  eventStatusInput.value="Rascunho";
  eventPriorityInput.value="Média";
  eventDateInput.value=formatDateInputValue(new Date());
  eventRegionInput.value="";
  eventBairroInput.value="";
  eventFormStatus.textContent="";
  eventFormStatus.className="event-form-status";
}

function fillEventForm(record){
  eventFormOriginalId.value=record.id||record.idBase||"";
  eventNameInput.value=record.evento||"";
  eventTypeInput.value=record.tipoEvento||record.categoria||"";
  eventSecretariaInput.value=record.secretariaResponsavel||record.secretaria||"";
  eventDateInput.value=formatDateForInput(record.data);
  eventStatusInput.value=record.status||"Rascunho";
  eventStartInput.value=record.horaInicio||"";
  eventEndInput.value=record.horaFim||"";
  eventRegionInput.value=getItemEffectiveRegion(record)||"";
  eventBairroInput.value=record.bairro||"";
  eventAddressInput.value=record.endereco||"";
  eventLocalInput.value=record.local||"";
  eventPriorityInput.value=record.prioridade||"Média";
  eventPublicInput.value=record.publicoEstimado||"";
  eventResponsibleInput.value=record.responsavel||"";
  eventPhoneInput.value=record.telefone||"";
  eventLatitudeInput.value=record.latitude||"";
  eventLongitudeInput.value=record.longitude||"";
  eventNotesInput.value=record.observacoes||"";
}

function openEventForm(mode,record=null,pendingIssue=null){
  if(dataCenterActiveModule!=="events"&&mode==="new"){
    window.alert("Nesta fase, o novo cadastro está disponível apenas para Eventos.");
    return;
  }

  eventFormMode=mode;
  eventFormSourceRecord=record;
  resetEventForm();
  fillEventFormSuggestions();

  if(record){
    fillEventForm(record);
  }

  if(mode==="edit"){
    eventFormTitle.textContent="✏️ Editar evento";
    eventFormSubtitle.textContent="Altere os dados e salve na planilha.";
  }else if(mode==="duplicate"){
    eventFormTitle.textContent="📄 Duplicar evento";
    eventFormSubtitle.textContent="Será criado um novo ID. Revise principalmente a data.";
    eventFormOriginalId.value="";
    eventStatusInput.value="Rascunho";
  }else{
    eventFormTitle.textContent="➕ Novo evento";
    eventFormSubtitle.textContent="Preencha os dados do novo evento.";
  }

  updateEventFormQuality();

  document.querySelectorAll(".event-smart-hint").forEach(
   element=>element.remove()
  );

  const bairroHint=document.createElement("div");
  bairroHint.className="event-smart-hint";
  bairroHint.textContent=
   "Ao escolher o bairro, a Região será preenchida automaticamente quando houver correspondência.";
  eventBairroInput.closest("label")?.appendChild(bairroHint);

  const secretariaHint=document.createElement("div");
  secretariaHint.className="event-smart-hint";
  secretariaHint.textContent=
   "Comece a digitar para ver sugestões já usadas na base.";
  eventSecretariaInput.closest("label")?.appendChild(secretariaHint);

  eventFormModal.classList.add("open");
  eventFormModal.setAttribute("aria-hidden","false");

  document.querySelectorAll(".event-form-highlight-message").forEach(
   element=>element.remove()
  );

  setTimeout(()=>{
   if(pendingIssue){
    const target=document.getElementById(pendingIssue.targetId);

    if(target){
     target.classList.add("invalid");
     target.focus();
     target.scrollIntoView({behavior:"smooth",block:"center"});

     const message=document.createElement("div");
     message.className="event-form-highlight-message";
     message.textContent=
      `${getPendingSeverityLabel(pendingIssue.severity)} — ${pendingIssue.message}`;

     target.closest("label")?.appendChild(message);
    }
   }else{
    eventNameInput.focus();
   }
  },80);
}

function closeEventForm(){
  eventFormModal.classList.remove("open");
  eventFormModal.setAttribute("aria-hidden","true");
  eventFormSourceRecord=null;
}

function getEventFormMissingFields(){
  const missing=[];
  if(!eventNameInput.value.trim())missing.push("nome do evento");
  if(!eventSecretariaInput.value.trim())missing.push("secretaria");
  if(!eventDateInput.value)missing.push("data");
  if(!eventStartInput.value)missing.push("hora inicial");
  if(!eventEndInput.value)missing.push("hora final");
  if(!eventBairroInput.value.trim())missing.push("bairro");
  if(!eventAddressInput.value.trim()&&!eventLocalInput.value.trim()){
    missing.push("endereço ou local");
  }
  return missing;
}

function updateEventFormQuality(){
  const fields=[
    eventNameInput,eventSecretariaInput,eventDateInput,eventStartInput,
    eventEndInput,eventBairroInput,eventAddressInput,eventLocalInput,
    eventRegionInput,eventLatitudeInput,eventLongitudeInput
  ];

  const fulfilled=[
    eventNameInput.value.trim(),
    eventSecretariaInput.value.trim(),
    eventDateInput.value,
    eventStartInput.value,
    eventEndInput.value,
    eventBairroInput.value.trim(),
    eventAddressInput.value.trim()||eventLocalInput.value.trim(),
    eventRegionInput.value.trim(),
    eventLatitudeInput.value.trim(),
    eventLongitudeInput.value.trim()
  ].filter(Boolean).length;

  const percent=Math.round((fulfilled/10)*100);
  eventFormQualityPercent.textContent=percent+"%";
  eventFormQualityFill.style.width=percent+"%";

  const missing=getEventFormMissingFields();
  eventFormQualityMessage.textContent=missing.length
    ?"Falta preencher: "+missing.join(", ")+"."
    :"Todos os campos obrigatórios estão preenchidos.";

  fields.forEach(field=>{
   if(field.value.trim()){
    field.classList.remove("invalid");
    field.closest("label")
     ?.querySelector(".event-form-highlight-message")
     ?.remove();
   }
  });
}

function getEventFormPayload(){
  return{
    action:eventFormMode==="edit"?"updateEvent":"createEvent",
    codigo:"3648",
    id:eventFormOriginalId.value.trim(),
    evento:eventNameInput.value.trim(),
    tipoEvento:eventTypeInput.value.trim(),
    secretariaResponsavel:eventSecretariaInput.value.trim(),
    secretariasParticipantes:"",
    data:eventDateInput.value,
    horaInicio:eventStartInput.value,
    horaFim:eventEndInput.value,
    regiao:canonicalTerritoryName(eventRegionInput.value),
    bairro:canonicalTerritoryName(eventBairroInput.value),
    endereco:eventAddressInput.value.trim(),
    local:eventLocalInput.value.trim(),
    publicoEstimado:eventPublicInput.value.trim(),
    status:eventStatusInput.value,
    prioridade:eventPriorityInput.value,
    responsavel:eventResponsibleInput.value.trim(),
    telefone:eventPhoneInput.value.trim(),
    observacoes:eventNotesInput.value.trim(),
    latitude:eventLatitudeInput.value.trim(),
    longitude:eventLongitudeInput.value.trim()
  };
}

async function saveEventForm(event){
  event.preventDefault();
  updateEventFormQuality();

  const missing=getEventFormMissingFields();
  if(missing.length){
    eventFormStatus.textContent="Preencha os campos obrigatórios antes de salvar.";
    [eventNameInput,eventSecretariaInput,eventDateInput,eventStartInput,eventEndInput,eventBairroInput]
      .forEach(field=>{
        if(!field.value.trim())field.classList.add("invalid");
      });
    return;
  }

  const start=timeToMinutes(eventStartInput.value);
  const end=timeToMinutes(eventEndInput.value);

  if(start!==null&&end!==null&&end<=start){
    eventFormStatus.textContent="O horário final deve ser posterior ao horário inicial.";
    eventEndInput.classList.add("invalid");
    return;
  }

  saveEventFormBtn.disabled=true;
  saveEventFormBtn.textContent="Salvando...";
  eventFormStatus.textContent="";

  try{
    const payload=getEventFormPayload();
    const params=new URLSearchParams();

    Object.entries(payload).forEach(([key,value])=>{
      params.set(key,String(value??""));
    });

    params.set("acao",payload.action);

    const response=await fetch(API_URL,{
      method:"POST",
      headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
      body:params.toString()
    });

    const result=await response.json();

    if(!result.sucesso){
      throw new Error(result.erro||"Não foi possível salvar o evento.");
    }

    eventFormStatus.textContent=
      eventFormMode==="edit"
        ?"Evento atualizado com sucesso."
        :"Evento criado com sucesso.";
    eventFormStatus.className="event-form-status success";

    await loadEvents();
    refreshDataCenter();

    if(saveAndCreateAnother){
      saveAndCreateAnother=false;
      resetEventForm();
      fillEventFormSuggestions();
      eventFormMode="new";
      eventFormTitle.textContent="➕ Novo evento";
      eventFormSubtitle.textContent="Preencha os dados do próximo evento.";
      eventFormStatus.textContent="Evento salvo. Você já pode cadastrar o próximo.";
      eventFormStatus.className="event-form-status success";
      updateEventFormQuality();
      setTimeout(()=>eventNameInput.focus(),80);
    }else{
      setTimeout(()=>{
        closeEventForm();
        renderMap();
        renderCalendar();
      },700);
    }
  }catch(error){
    console.error(error);
    eventFormStatus.textContent=error.message;
    eventFormStatus.className="event-form-status";
  }finally{
    saveEventFormBtn.disabled=false;
    saveEventFormBtn.textContent="💾 Salvar evento";
  }
}


function openRecordTypeModal(){
 recordTypeModal.classList.add("open");
 recordTypeModal.setAttribute("aria-hidden","false");
}

function closeRecordTypeModal(){
 recordTypeModal.classList.remove("open");
 recordTypeModal.setAttribute("aria-hidden","true");
}

function fillHortaFormSuggestions(){
 const regions=dedupeCanonicalTerritories(
  [...allEvents,...allHortas].map(item=>getItemEffectiveRegion(item))
 );
 const bairros=dedupeCanonicalTerritories(
  [...allEvents,...allHortas].map(item=>item.bairro)
 );

 hortaRegionInput.innerHTML=
  '<option value="">Selecione</option>'+
  regions.map(value=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");

 hortaBairroInput.innerHTML=
  '<option value="">Selecione</option>'+
  bairros.map(value=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
}

function inferHortaRegion(){
 const bairro=hortaBairroInput.value;
 if(!bairro)return;

 const inferred=buildBairroRegionMap().get(normalize(bairro))||"";

 if(inferred){
  hortaRegionInput.value=inferred;
  hortaRegionInput.classList.add("event-smart-filled");
  setTimeout(()=>hortaRegionInput.classList.remove("event-smart-filled"),1200);
 }
}

function resetHortaForm(){
 hortaForm.reset();
 hortaFormOriginalId.value="";
 hortaStatusInput.value="Ativa";
 hortaFormStatus.textContent="";
 hortaFormStatus.className="event-form-status";
}

function fillHortaForm(record){
 hortaFormOriginalId.value=record.id||record.idBase||"";
 hortaNameInput.value=record.nome||"";
 hortaTypeInput.value=record.tipo||"";
 hortaStatusInput.value=record.status||"Ativa";
 hortaRegionInput.value=getItemEffectiveRegion(record)||"";
 hortaBairroInput.value=record.bairro||"";
 hortaAddressInput.value=record.endereco||"";
 hortaLatitudeInput.value=record.latitude||"";
 hortaLongitudeInput.value=record.longitude||"";
 hortaNotesInput.value=record.observacoes||"";
}

function openHortaForm(mode,record=null){
 hortaFormMode=mode;
 resetHortaForm();
 fillHortaFormSuggestions();

 if(record)fillHortaForm(record);

 if(mode==="edit"){
  hortaFormTitle.textContent="✏️ Editar horta";
  hortaFormSubtitle.textContent="Altere os dados e salve na planilha.";
 }else if(mode==="duplicate"){
  hortaFormTitle.textContent="📄 Duplicar horta";
  hortaFormSubtitle.textContent="Será criado um novo ID.";
  hortaFormOriginalId.value="";
 }else{
  hortaFormTitle.textContent="🌱 Nova horta";
  hortaFormSubtitle.textContent="Preencha os dados da nova horta.";
 }

 updateHortaFormQuality();
 hortaFormModal.classList.add("open");
 hortaFormModal.setAttribute("aria-hidden","false");
 setTimeout(()=>hortaNameInput.focus(),80);
}

function closeHortaForm(){
 hortaFormModal.classList.remove("open");
 hortaFormModal.setAttribute("aria-hidden","true");
}

function getHortaMissingFields(){
 const missing=[];
 if(!hortaNameInput.value.trim())missing.push("nome");
 if(!hortaTypeInput.value)missing.push("tipo");
 if(!hortaStatusInput.value)missing.push("status");
 if(!hortaBairroInput.value)missing.push("bairro");
 if(!hortaAddressInput.value.trim())missing.push("endereço");
 return missing;
}

function updateHortaFormQuality(){
 const values=[
  hortaNameInput.value.trim(),
  hortaTypeInput.value,
  hortaStatusInput.value,
  hortaRegionInput.value,
  hortaBairroInput.value,
  hortaAddressInput.value.trim(),
  hortaLatitudeInput.value.trim(),
  hortaLongitudeInput.value.trim()
 ];

 const percent=Math.round(values.filter(Boolean).length/values.length*100);
 hortaFormQualityPercent.textContent=percent+"%";
 hortaFormQualityFill.style.width=percent+"%";

 const missing=getHortaMissingFields();
 hortaFormQualityMessage.textContent=missing.length
  ?"Falta preencher: "+missing.join(", ")+"."
  :"Todos os campos obrigatórios estão preenchidos.";
}

function getHortaPayload(){
 return{
  acao:hortaFormMode==="edit"?"updateHorta":"createHorta",
  codigo:"3648",
  id:hortaFormOriginalId.value.trim(),
  nome:hortaNameInput.value.trim(),
  tipo:hortaTypeInput.value,
  status:hortaStatusInput.value,
  regiao:canonicalTerritoryName(hortaRegionInput.value),
  bairro:canonicalTerritoryName(hortaBairroInput.value),
  endereco:hortaAddressInput.value.trim(),
  latitude:hortaLatitudeInput.value.trim(),
  longitude:hortaLongitudeInput.value.trim(),
  observacoes:hortaNotesInput.value.trim()
 };
}

async function saveHortaForm(event){
 event.preventDefault();

 const missing=getHortaMissingFields();
 if(missing.length){
  hortaFormStatus.textContent="Preencha os campos obrigatórios antes de salvar.";
  return;
 }

 saveHortaFormBtn.disabled=true;
 saveHortaFormBtn.textContent="Salvando...";
 hortaFormStatus.textContent="";

 try{
  const params=new URLSearchParams();
  Object.entries(getHortaPayload()).forEach(([key,value])=>{
   params.set(key,String(value??""));
  });

  const response=await fetch(API_URL,{
   method:"POST",
   headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
   body:params.toString()
  });

  const result=await response.json();

  if(!result.sucesso){
   throw new Error(result.erro||"Não foi possível salvar a horta.");
  }

  hortaFormStatus.textContent=
   hortaFormMode==="edit"
    ?"Horta atualizada com sucesso."
    :"Horta criada com sucesso.";
  hortaFormStatus.className="event-form-status success";

  await loadEvents();
  refreshDataCenter();
  renderHortasLayer();

  if(saveAndCreateAnotherHorta){
   saveAndCreateAnotherHorta=false;
   resetHortaForm();
   fillHortaFormSuggestions();
   hortaFormMode="new";
   hortaFormTitle.textContent="🌱 Nova horta";
   hortaFormSubtitle.textContent="Preencha os dados da próxima horta.";
   hortaFormStatus.textContent="Horta salva. Você já pode cadastrar a próxima.";
   hortaFormStatus.className="event-form-status success";
   updateHortaFormQuality();
  }else{
   setTimeout(closeHortaForm,700);
  }
 }catch(error){
  console.error(error);
  hortaFormStatus.textContent=error.message;
  hortaFormStatus.className="event-form-status";
 }finally{
  saveHortaFormBtn.disabled=false;
  saveHortaFormBtn.textContent="💾 Salvar horta";
 }
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

    // Padroniza a exibição territorial sem alterar a planilha original.
    allEvents = allEvents.map(item => ({
      ...item,
      bairro: canonicalTerritoryName(item.bairro),
      regiao: canonicalTerritoryName(item.regiao)
    }));

    allHortas = allHortas.map(item => ({
      ...item,
      bairro: canonicalTerritoryName(item.bairro),
      regiao: canonicalTerritoryName(item.regiao)
    }));

    // Preenche a região em memória quando ela estiver vazia,
    // usando o bairro como referência nos eventos já cadastrados.
    const bairroRegionMap = buildBairroRegionMap();

    allHortas = allHortas.map(item => ({
      ...item,
      regiao:
        item.regiao ||
        bairroRegionMap.get(normalize(item.bairro)) ||
        ""
    }));

    allEvents = allEvents.map(item => ({
      ...item,
      regiao:
        item.regiao ||
        bairroRegionMap.get(normalize(item.bairro)) ||
        ""
    }));

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
  openDailyReportPanel();
});


bairrosBtn.addEventListener("click", () => {
  bairrosActive = !bairrosActive;
  updateTerritorialButtons();
  renderMap();
});


saveAndNewEventFormBtn.addEventListener("click",()=>{
 saveAndCreateAnother=true;

 if(typeof eventForm.requestSubmit==="function"){
  eventForm.requestSubmit();
 }else{
  saveEventFormBtn.click();
 }
});

eventBairroInput.addEventListener("change",()=>{
 inferRegionFromBairroSelection();
 updateEventFormQuality();
});

newDataRecordBtn.addEventListener("click",openRecordTypeModal);
closeEventFormBtn.addEventListener("click",closeEventForm);
cancelEventFormBtn.addEventListener("click",closeEventForm);
eventForm.addEventListener("submit",event=>{
 if(event.submitter===saveEventFormBtn){
  saveAndCreateAnother=false;
 }
 saveEventForm(event);
});
eventFormModal.addEventListener("click",event=>{
  if(event.target===eventFormModal)closeEventForm();
});
[
  eventNameInput,eventTypeInput,eventSecretariaInput,eventDateInput,
  eventStatusInput,eventStartInput,eventEndInput,eventRegionInput,
  eventBairroInput,eventAddressInput,eventLocalInput,eventPriorityInput,
  eventPublicInput,eventResponsibleInput,eventPhoneInput,
  eventLatitudeInput,eventLongitudeInput,eventNotesInput
].forEach(control=>{
  control.addEventListener("input",updateEventFormQuality);
  control.addEventListener("change",updateEventFormQuality);
});


closeRecordTypeBtn.addEventListener("click",closeRecordTypeModal);
recordTypeModal.addEventListener("click",event=>{
 if(event.target===recordTypeModal)closeRecordTypeModal();
});
newEventTypeBtn.addEventListener("click",()=>{
 closeRecordTypeModal();
 openEventForm("new");
});
newHortaTypeBtn.addEventListener("click",()=>{
 closeRecordTypeModal();
 openHortaForm("new");
});

closeHortaFormBtn.addEventListener("click",closeHortaForm);
cancelHortaFormBtn.addEventListener("click",closeHortaForm);
hortaFormModal.addEventListener("click",event=>{
 if(event.target===hortaFormModal)closeHortaForm();
});
hortaForm.addEventListener("submit",event=>{
 if(event.submitter===saveHortaFormBtn){
  saveAndCreateAnotherHorta=false;
 }
 saveHortaForm(event);
});
saveAndNewHortaFormBtn.addEventListener("click",()=>{
 saveAndCreateAnotherHorta=true;
 hortaForm.requestSubmit();
});
hortaBairroInput.addEventListener("change",()=>{
 inferHortaRegion();
 updateHortaFormQuality();
});
[
 hortaNameInput,hortaTypeInput,hortaStatusInput,hortaRegionInput,
 hortaBairroInput,hortaAddressInput,hortaLatitudeInput,
 hortaLongitudeInput,hortaNotesInput
].forEach(control=>{
 control.addEventListener("input",updateHortaFormQuality);
 control.addEventListener("change",updateHortaFormQuality);
});

dataCenterBtn.addEventListener("click",openDataCenterPanel);
closeDataCenterBtn.addEventListener("click",closeDataCenterPanel);
dataCenterBackdrop.addEventListener("click",closeDataCenterPanel);
dataCenterUnlockBtn.addEventListener("click",unlockDataCenter);
dataCenterAccessCode.addEventListener("keydown",e=>{if(e.key==="Enter")unlockDataCenter()});
document.querySelectorAll(".data-center-module").forEach(button=>{
 button.addEventListener("click",()=>{
  document.querySelectorAll(".data-center-module").forEach(
   item=>item.classList.remove("active")
  );

  button.classList.add("active");
  dataCenterActiveModule=button.dataset.module||"events";
  dataCenterPriorityFilter.hidden=dataCenterActiveModule!=="pending";

  if(dataCenterActiveModule!=="pending"){
   dataCenterPriorityFilter.value="";
  }

  renderDataCenterList();
 });
});
[
 dataCenterSearch,
 dataCenterRegionFilter,
 dataCenterStatusFilter,
 dataCenterPriorityFilter
].forEach(control=>{
 control.addEventListener("input",renderDataCenterList);
 control.addEventListener("change",renderDataCenterList);
});
refreshDataCenterBtn.addEventListener("click",refreshDataCenter);

closeDailyReportBtn.addEventListener("click", closeDailyReportPanel);
dailyReportBackdrop.addEventListener("click", closeDailyReportPanel);
dailyReportDate.addEventListener("change", renderDailyReport);
dailyReportSort.addEventListener("change", renderDailyReport);

generateDailyReportBtn.addEventListener("click", async () => {
  generateDailyReportBtn.disabled = true;
  generateDailyReportBtn.textContent = "Gerando...";
  try {
    await generateDailyReportPdf(true);
  } catch (error) {
    console.error(error);
    window.alert(error.message);
  } finally {
    generateDailyReportBtn.disabled = false;
    generateDailyReportBtn.textContent = "📄 Gerar relatório";
  }
});

shareDailyReportWhatsappBtn.addEventListener("click", async () => {
  const message = getDailyReportWhatsappMessage();

  try {
    const blob = await generateDailyReportPdf(false);
    const date = new Date(dailyReportDate.value + "T00:00:00");
    const filename = `Eventos do Dia - ${formatFilenameDate(date)}.pdf`;
    const file = new File([blob], filename, { type: "application/pdf" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: filename.replace(/\.pdf$/i, ""),
        text: message,
        files: [file]
      });
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);

    window.open(
      "https://wa.me/?text=" + encodeURIComponent(message),
      "_blank",
      "noopener,noreferrer"
    );

    window.alert(
      "O PDF foi baixado. Anexe o arquivo no WhatsApp:\n\n" + filename
    );
  } catch (error) {
    console.error(error);
    window.open(
      "https://wa.me/?text=" + encodeURIComponent(message),
      "_blank",
      "noopener,noreferrer"
    );
  }
});

printDailyReportBtn.addEventListener("click", () => {
  const original = gabinetePreviewDocument.innerHTML;
  gabinetePreviewDocument.innerHTML = buildDailyReportHtml();
  gabinetePreview.classList.add("open");
  gabinetePreview.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    window.print();
    gabinetePreviewDocument.innerHTML = original;
  }, 100);
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





gabineteClearSelectionBtn.addEventListener("click", () => {
  gabineteSelectedIds.clear();
  gabineteSelectedOrder = [];
  renderGabineteCategoryResults();
  updateGabineteSelection();
});

gabinetePreviewBtn.addEventListener("click", buildGabinetePreview);
closeGabinetePreviewBtn.addEventListener("click", closeGabinetePreview);
downloadGabinetePdfBtn.addEventListener("click", downloadGabinetePdf);
shareGabineteWhatsappBtn.addEventListener("click", shareGabineteWhatsapp);
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
